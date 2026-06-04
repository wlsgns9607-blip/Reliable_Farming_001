import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Share2, 
  Camera, 
  Home, 
  CalendarDays, 
  FileText,
  Mic,
  Volume2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveLog } from '../services/db';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LogCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = "여기는 협업 및 가족 농사일지 방 만드는 란입니다. 방 이름을 써서 작성하기 버튼을 누르면 방이 생성됩니다.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('내용을 모두 입력해주세요!');
      return;
    }

    setIsSaving(true);
    try {
      await saveLog({
        title,
        content,
        category: '영농일지',
        imageUrl: imageUrl || undefined
      }, user?.uid, user?.displayName || "농부");
      toast.success('일지가 작성되었습니다!');
      navigate('/logs');
    } catch (error) {
      console.error(error);
      toast.error('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#D1E8D1] min-h-screen flex flex-col font-sans max-w-[430px] mx-auto relative overflow-hidden pb-44">
      {/* Header Region */}
      <div className="px-6 pt-10 pb-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-20 h-20 bg-transparent border-[3px] border-black rounded-[24px] flex items-center justify-center active:scale-95 transition-all"
        >
          <ArrowLeft size={44} strokeWidth={3} />
        </button>
        <div className="flex-1" />
        <div className="flex gap-3">
          <button 
            onClick={handleSpeak}
            className="w-20 h-20 bg-white border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Volume2 size={44} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 pt-4 pb-10">
        {/* Form Card */}
        <div className="bg-[#D1E8D1] border-[3px] border-black rounded-[56px] p-8 space-y-8 shadow-sm overflow-hidden border-b-8">
          <div className="bg-white border-[3px] border-black rounded-[32px] h-24 px-6 flex items-center shadow-inner">
            <input 
              type="text" 
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-black text-gray-800 placeholder:text-gray-400 focus:outline-none text-center"
            />
          </div>

          <div className="bg-[#E2EBE2] border-[3px] border-black rounded-[40px] p-8 min-h-[250px] shadow-inner flex flex-col items-center justify-center relative">
            <textarea 
              placeholder="일지를 작성해주세요!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-transparent text-3xl font-black text-gray-700 placeholder:text-gray-400 focus:outline-none resize-none text-center"
            />
            <button 
              onClick={() => {
                if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
                  toast.error('이 브라우저는 음성 인식을 지원하지 않습니다.');
                  return;
                }
                toast.success('음성 인식을 시작합니다.');
                const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
                const recognition = new SpeechRecognition();
                recognition.lang = 'ko-KR';
                recognition.onresult = (event: any) => {
                  const transcript = event.results[0][0].transcript;
                  setContent(prev => prev + (prev ? ' ' : '') + transcript);
                };
                recognition.start();
              }}
              className="absolute bottom-6 right-6 w-16 h-16 bg-white border-[3px] border-black rounded-full flex items-center justify-center shadow-md active:scale-90"
            >
              <Mic size={36} strokeWidth={2.5} />
            </button>
          </div>

          <div className="group bg-[#E2EBE2] border-[3px] border-black rounded-[48px] p-12 flex flex-col items-center justify-center gap-4 shadow-inner cursor-pointer active:scale-95 transition-all relative overflow-hidden"
               onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            {imageUrl ? (
              <div className="absolute inset-0 w-full h-full">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center transition-all group-hover:bg-black/40">
                  <Camera size={64} className="text-white drop-shadow-lg" strokeWidth={3} />
                  <span className="text-2xl font-black text-white drop-shadow-lg">사진 변경하기</span>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white p-8 rounded-3xl border-[3px] border-black shadow-md">
                  <Camera size={80} className="text-gray-700" strokeWidth={3} />
                </div>
                <span className="text-[44px] font-black text-gray-500 tracking-tighter">사진올리기</span>
                {/* Hover overlay for empty state */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-white border-4 border-black px-6 py-3 rounded-2xl shadow-xl animate-bounce">
                      <span className="text-2xl font-black">찰깍! 사진을 찍어보세요</span>
                   </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <button 
              onClick={() => navigate(-1)}
              className="bg-white border-[3px] border-black py-6 rounded-[32px] text-3xl font-black text-gray-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              취소하기
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#2E7D32] border-[3px] border-black py-6 rounded-[32px] text-3xl font-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              {isSaving ? '저장중...' : '작성하기'}
            </button>
          </div>
        </div>


      </div>
    </div>
  );
}
