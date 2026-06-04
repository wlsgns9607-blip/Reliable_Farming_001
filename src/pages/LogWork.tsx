import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Save, Home, CalendarDays, FileText, Droplets, Sprout, Scissors, Wheat, Camera, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const WORK_TAGS = [
  { id: 'water', label: '물주기', icon: <Droplets />, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { id: 'weed', label: '잡초제거', icon: <Scissors />, color: 'bg-green-100 text-green-600 border-green-200' },
  { id: 'fertilize', label: '비료주기', icon: <Wheat />, color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { id: 'seed', label: '씨뿌리기', icon: <Sprout />, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
];

export default function LogWork() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        toast.error('사진 용량이 너무 큽니다 (1MB 이하 권장)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!id || !user || !content.trim()) {
      toast.error('작업 내용을 입력해주세요!');
      return;
    }

    setIsSaving(true);
    try {
      const logRef = doc(db, 'logs', id);
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const userName = userSnap.exists() ? userSnap.data().name : (user.displayName || '식구');
      const tagLabel = WORK_TAGS.find(t => t.id === selectedTag)?.label || '공동작업';

      await updateDoc(logRef, {
        works: arrayUnion({
          userId: user.uid,
          userName: userName,
          content: content,
          tag: tagLabel,
          imageUrl: imageUrl,
          timestamp: new Date().toISOString()
        })
      });

      toast.success('협업 기록이 등록되었습니다!');
      navigate(`/logs/${id}`);
    } catch (error) {
      console.error(error);
      toast.error('등록에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#D1E8D1] min-h-screen flex flex-col font-sans max-w-[430px] mx-auto pb-44 overflow-hidden">
      <div className="px-6 pt-10 pb-4 flex items-center">
        <button onClick={() => navigate(-1)} className="w-16 h-16 bg-white border-4 border-black rounded-[24px] flex items-center justify-center shadow-sm">
          <ArrowLeft size={36} strokeWidth={3} />
        </button>
        <h1 className="text-3xl font-black text-gray-800 flex-1 text-center pr-12">협업 기록</h1>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black rounded-[48px] p-8 space-y-8 shadow-md"
        >
          <div className="space-y-4">
             <h3 className="text-2xl font-black text-gray-800">무슨 일을 도와주셨나요?</h3>
             <div className="grid grid-cols-2 gap-4">
                {WORK_TAGS.map((tag) => (
                   <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.id)}
                    className={`flex items-center gap-2 p-5 rounded-[24px] border-4 transition-all active:scale-95 ${
                        selectedTag === tag.id ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-100 bg-gray-50'
                    }`}
                   >
                    <span className={selectedTag === tag.id ? 'text-brand-primary' : 'text-gray-400'}>
                        {React.cloneElement(tag.icon as React.ReactElement<any>, { size: 32, strokeWidth: 3 })}
                    </span>
                    <span className={`text-2xl font-black ${selectedTag === tag.id ? 'text-black' : 'text-gray-400'}`}>
                        {tag.label}
                    </span>
                   </button>
                ))}
             </div>
          </div>

          <div className="bg-[#F1F8F1] border-4 border-black rounded-[32px] p-8 min-h-[250px] shadow-inner">
            <textarea 
              placeholder="구체적으로 어떤 작업을 도와주셨는지 남겨주세요!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-transparent text-2xl font-black text-gray-700 placeholder:text-gray-300 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <span className="text-2xl font-black text-gray-800">현장 사진 첨부</span>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="group w-16 h-16 bg-amber-100 border-2 border-amber-400 rounded-2xl flex items-center justify-center active:scale-90 transition-all font-black text-amber-600 relative"
                >
                  <Camera size={28} />
                  <span className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black text-white text-base font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border-2 border-white z-50 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-black">
                    사진 찍기
                  </span>
                </button>
             </div>
             
             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
             
             {imageUrl && (
               <div className="relative border-4 border-black rounded-3xl overflow-hidden shadow-md">
                 <img src={imageUrl} alt="Work" className="w-full h-auto" />
                 <button 
                  onClick={() => setImageUrl(null)}
                  className="absolute top-4 right-4 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center active:scale-90"
                 >
                  <X size={24} />
                 </button>
               </div>
             )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex-1 bg-white border-4 border-black py-5 rounded-[24px] text-2xl font-black text-gray-500 shadow-md active:scale-95 transition-all"
            >
              취소
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 bg-amber-500 text-white border-4 border-black py-5 rounded-[24px] text-2xl font-black shadow-md active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Users size={28} />
              {isSaving ? '등록중...' : '기록하기'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#D1E8D1] p-6 flex justify-around items-end z-50">
         <button onClick={() => navigate('/')} className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-white border-4 border-black rounded-[24px] flex items-center justify-center shadow-md">
               <Home size={40} strokeWidth={3} />
            </div>
            <span className="text-lg font-bold">홈으로</span>
         </button>
         <button onClick={() => navigate('/logs')} className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-white border-4 border-black rounded-[24px] flex items-center justify-center shadow-md">
               <FileText size={40} strokeWidth={3} />
            </div>
            <span className="text-lg font-bold">농사일지</span>
         </button>
      </div>
    </div>
  );
}
