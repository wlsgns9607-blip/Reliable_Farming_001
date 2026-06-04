import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Share2, 
  Camera, 
  Home, 
  CalendarDays, 
  FileText,
  Save
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateLog } from '../services/db';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LogEdit() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadLog() {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'logs', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || '');
          setContent(data.content || '');
        }
      } catch (error) {
        console.error(error);
        toast.error('일지를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    loadLog();
  }, [id]);

  const handleShare = async () => {
    const shareData = {
      title: title || '농사일지',
      text: content.substring(0, 100) + '...',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('링크가 복사되었습니다!');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        toast.error('링크 복사에 실패했습니다.');
      }
    }
  };

  const handleUpdate = async () => {
    if (!id || !user) return;
    if (!title.trim() || !content.trim()) {
      toast.error('내용을 모두 입력해주세요!');
      return;
    }

    setIsSaving(true);
    try {
      await updateLog(id, {
        title,
        content,
        category: '영농일지'
      });
      toast.success('일지가 수정되었습니다!');
      navigate(`/logs/${id}`);
    } catch (error) {
      console.error(error);
      toast.error('수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
     return (
       <div className="bg-[#D1E8D1] min-h-screen flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
       </div>
     );
  }

  return (
    <div className="bg-[#D1E8D1] min-h-screen flex flex-col font-sans max-w-[430px] mx-auto relative overflow-hidden pb-44">
      {/* Header Region */}
      <div className="px-6 pt-10 pb-4 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="w-20 h-20 bg-transparent border-2 border-black rounded-[24px] flex items-center justify-center active:scale-95 transition-all"
        >
          <ArrowLeft size={44} strokeWidth={2} />
        </button>
        <div className="flex-1 text-center">
           <h1 className="text-3xl font-black text-gray-800">일지 수정</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            <Share2 size={32} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-6 pt-4">
        {/* Form Card */}
        <div className="bg-[#D1E8D1] border-2 border-black rounded-[48px] p-8 space-y-6 shadow-sm overflow-hidden border-b-4">
          <div className="bg-white border-2 border-black rounded-[32px] h-20 px-6 flex items-center shadow-inner">
            <input 
              type="text" 
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-black text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          <div className="bg-[#E2EBE2] border-2 border-black rounded-[32px] p-8 min-h-[300px] shadow-inner flex items-center justify-center">
            <textarea 
              placeholder="일지 내용을 수정해보세요!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-transparent text-3xl font-black text-gray-600 placeholder:text-gray-400 focus:outline-none resize-none text-center"
            />
          </div>

          <div className="group bg-[#E2EBE2] border-2 border-black rounded-[40px] p-10 flex flex-col items-center justify-center gap-4 shadow-inner cursor-pointer active:scale-95 transition-all relative overflow-hidden"
               onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
            />
            <div className="bg-white p-6 rounded-2xl border-2 border-black">
              <Camera size={64} className="text-gray-700" strokeWidth={2.5} />
            </div>
            <span className="text-4xl font-black text-gray-500">사진 수정</span>
            
            {/* Hover indication */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="bg-white text-black text-2xl font-black px-6 py-3 rounded-2xl border-4 border-black shadow-xl">
                사진 찍거나 골라주세요
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              onClick={() => navigate(-1)}
              className="flex-1 bg-white border-2 border-black py-4 rounded-[24px] text-2xl font-black text-gray-600 shadow-md active:scale-95"
            >
              취소
            </button>
            <button 
              onClick={handleUpdate}
              disabled={isSaving}
              className="flex-1 bg-white border-2 border-black py-4 rounded-[24px] text-2xl font-black text-gray-600 shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Save size={24} />
              {isSaving ? '수정중...' : '수정완료'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#D1E8D1] px-4 pb-12 pt-4 flex justify-around items-end z-50">
        <NavButton 
          onClick={() => navigate('/')}
          icon={<Home size={44} strokeWidth={3} />} 
          label="홈으로돌아가기" 
        />
        <NavButton 
          onClick={() => navigate('/schedule')}
          icon={<CalendarDays size={44} strokeWidth={3} />} 
          label="여행,휴식일정" 
        />
        <NavButton 
          onClick={() => navigate('/logs')}
          isActive
          icon={
            <div className="relative">
              <div className="w-4 h-4 bg-black rounded-full absolute -top-1 -right-1 z-10" />
              <div className="p-1">
                <FileText size={44} strokeWidth={3} />
              </div>
            </div>
          } 
          label="우리밭농사일지" 
        />
      </div>
    </div>
  );
}

function NavButton({ icon, label, onClick, isActive }: { icon: React.ReactNode; label: string; onClick: () => void; isActive?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-2 active:scale-90 transition-all group ${isActive ? 'scale-105' : ''}`}
    >
      <div className={`w-24 h-24 bg-white border-4 border-black rounded-[32px] flex items-center justify-center shadow-lg transition-transform ${isActive ? 'bg-white' : ''}`}>
        {icon}
      </div>
      <span className="text-xl font-black text-gray-800 tracking-tight whitespace-nowrap">{label}</span>
    </button>
  );
}
