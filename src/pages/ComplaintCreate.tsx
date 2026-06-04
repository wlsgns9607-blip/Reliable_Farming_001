import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Home,
  Bot,
  CalendarDays,
  FileText,
  Mic, 
  ImagePlus,
  Save,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { saveComplaint } from '../services/db';
import { useAuth } from '../context/AuthContext';

export default function ComplaintCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for data URL safety
        toast.error('이미지 크기가 너무 큽니다. (2MB 이하)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeech = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      toast.error('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    toast.success('음성 인식을 시작합니다. 말씀해 주세요!');
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setContent(prev => prev + (prev ? ' ' : '') + transcript);
      toast.success('음성이 텍스트로 입력되었습니다.');
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast.error('음성 인식 중 오류가 발생했습니다.');
    };

    recognition.start();
  };

  const handleApply = async () => {
    if (!content.trim() && !image) {
      toast.error('내용이나 사진을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await saveComplaint({
        content: content,
        imageUrl: image,
      }, user?.uid, user?.displayName || "생활 농부");

      toast.success('기록이 완료되었습니다!');
      navigate('/complaint');
    } catch (error) {
      console.error(error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#D1E8D1] min-h-screen font-sans flex flex-col max-w-[430px] mx-auto overflow-x-hidden">
      <div className="p-6 space-y-8 flex-1">
        {/* Detail Card */}
        <div className="bg-white border-2 border-black rounded-[40px] p-8 space-y-8 shadow-lg mt-10">
          <h3 className="text-[34px] font-bold text-gray-800 text-center">상세 내용을 알려주세요</h3>
          
          <div className="bg-white border-2 border-green-800 rounded-[28px] p-6 h-[260px] flex flex-col">
             <textarea 
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="어디가 어떻게 불편하신가요?"
               className="w-full h-full text-[28px] font-medium text-gray-800 bg-transparent outline-none placeholder:text-gray-300 resize-none font-sans"
             />
             {image && (
               <div className="relative mt-2 w-24 h-24 shrink-0">
                 <img src={image} alt="uploaded" className="w-full h-full object-cover rounded-xl border-2 border-black" />
                 <button 
                   onClick={() => setImage(null)}
                   className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 shadow-md"
                 >
                   <XCircle size={24} fill="currentColor" className="text-white" />
                 </button>
               </div>
             )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <input 
               type="file" 
               accept="image/*" 
               capture="environment" 
               className="hidden" 
               ref={fileInputRef}
               onChange={handleFileChange}
             />
             <button 
               onClick={handleSpeech}
               className="flex items-center justify-center bg-[#603010] text-white h-[84px] rounded-[42px] text-[28px] font-bold shadow-md active:scale-95 transition-all"
             >
                <span>말하기</span>
             </button>
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center justify-center bg-[#4C6454] text-white h-[84px] rounded-[42px] text-[24px] leading-tight font-bold shadow-md active:scale-95 transition-all"
             >
                <span className="text-center">사진<br />추가</span>
             </button>
          </div>

          <div className="space-y-4 pt-4">
            <button 
              onClick={handleApply}
              disabled={loading}
              className="bg-[#7CD098] text-black h-[100px] w-full rounded-[24px] text-[36px] font-bold flex items-center justify-center gap-4 border-2 border-black active:translate-y-1 transition-all shadow-md"
            >
              <span>{loading ? '기록 중...' : '기록 완료하기'}</span>
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="bg-white text-gray-800 h-[100px] w-full rounded-[24px] text-[36px] font-bold border-2 border-[#603010] active:scale-95 transition-all font-sans shadow-sm"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
