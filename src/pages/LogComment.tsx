import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageCircle, Save, Home, FileText, Camera, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LogComment() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64 storage in firestore
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
    if (!id || !user || (!content.trim() && !imageUrl)) {
      toast.error('메시지나 사진을 남겨주세요!');
      return;
    }

    setIsSaving(true);
    try {
      const logRef = doc(db, 'logs', id);
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const userName = userSnap.exists() ? userSnap.data().name : (user.displayName || '가족');

      await updateDoc(logRef, {
        comments: arrayUnion({
          userId: user.uid,
          userName: userName,
          content: content,
          imageUrl: imageUrl,
          timestamp: new Date().toISOString()
        })
      });

      toast.success('따뜻한 한마디가 등록되었습니다!');
      navigate(`/logs/${id}`);
    } catch (error) {
      console.error(error);
      toast.error('등록에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#D1E8D1] min-h-screen flex flex-col font-sans max-w-[430px] mx-auto pb-44">
      <div className="px-6 pt-10 pb-4 flex items-center">
        <button onClick={() => navigate(-1)} className="w-16 h-16 bg-white border-4 border-black rounded-[24px] flex items-center justify-center shadow-sm">
          <ArrowLeft size={36} strokeWidth={3} />
        </button>
        <h1 className="text-3xl font-black text-gray-800 flex-1 text-center pr-12">가족 한마디</h1>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black rounded-[48px] p-8 space-y-6 shadow-md"
        >
          <div className="bg-[#F1F8F1] border-4 border-black rounded-[32px] p-8 min-h-[300px] shadow-inner flex flex-col items-center justify-center text-center relative">
            <MessageCircle size={64} className="text-brand-primary mb-6 opacity-30" />
            <textarea 
              placeholder="가족들에게 전할 따뜻한 응원을 남겨주세요!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-transparent text-3xl font-black text-gray-700 placeholder:text-gray-300 focus:outline-none resize-none text-center leading-relaxed"
            />
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <span className="text-2xl font-black text-gray-800">사진 추가하기</span>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 bg-brand-primary/10 border-2 border-brand-primary rounded-2xl flex items-center justify-center active:scale-90 transition-all font-black text-brand-primary"
                >
                  <Camera size={28} />
                </button>
             </div>
             
             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
             
             {imageUrl && (
               <div className="relative border-4 border-black rounded-3xl overflow-hidden shadow-md">
                 <img src={imageUrl} alt="Uploaded" className="w-full h-auto" />
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
              className="flex-1 bg-brand-primary text-white border-4 border-black py-5 rounded-[24px] text-2xl font-black shadow-md active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Save size={28} />
              {isSaving ? '보내는중...' : '등록하기'}
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
