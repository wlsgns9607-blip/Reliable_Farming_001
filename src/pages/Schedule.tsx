import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Plus, 
  Mic, 
  Plane,
  RefreshCw,
  Trash2,
  Volume2,
  Sparkles,
  FileText
} from 'lucide-react';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { saveSchedule, subscribeToSchedules, deleteSchedule } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Schedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<'travel' | 'rest'>('travel');
  const [events, setEvents] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = "여행이나 휴일 일정을 잡으면 AI가 농사 독촉을 멈추고 편안한 휴식을 도와드립니다";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToSchedules(user.uid, (data) => {
      setEvents(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddSchedule = async () => {
    if (!title || !startDate || !endDate) {
      toast.error('모든 정보를 입력해주세요!');
      return;
    }
    
    try {
      await saveSchedule({
        title,
        startDate,
        endDate,
        type
      }, user?.uid);
      toast.success('일정이 등록되었습니다!');
      setTitle('');
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error(error);
      toast.error('일정 등록에 실패했습니다.');
    }
  };

  const removeEvent = async (id: string) => {
    try {
      await deleteSchedule(id);
      toast.success('일정이 삭제되었습니다.');
    } catch (error) {
      console.error(error);
      toast.error('일정 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-5 overflow-y-auto space-y-6 pt-4 pb-10">
        {/* Info Card with Speaker */}
        <div className="bg-white border-2 border-black rounded-[24px] p-8 relative shadow-sm">
          <button 
            onClick={handleSpeak}
            className={`absolute right-4 top-4 text-black h-fit transition-transform active:scale-90 ${isSpeaking ? 'animate-pulse scale-110' : ''}`}
          >
            <Volume2 size={48} fill={isSpeaking ? "#2E7D32" : "black"} />
          </button>
          <p className="text-3xl font-black text-gray-800 leading-snug pr-8">
            여행이나 휴일 일정을 잡으면 AI가 농사 독촉을 멈추고 편안한 휴식을 도와드립니다
          </p>
        </div>

        {/* Main Form Container */}
        <div className="bg-[#B8D4B8] border-2 border-black rounded-[32px] p-6 space-y-8 shadow-inner">
          {/* Tabs */}
          <div className="flex gap-4">
            <button 
              onClick={() => setType('travel')}
              className={`flex-1 py-4 bg-white border-2 border-black rounded-[16px] text-3xl font-black flex items-center justify-center gap-3 transition-all ${
                type === 'travel' ? 'opacity-100 shadow-lg' : 'opacity-60 grayscale'
              }`}
            >
              <Plane size={36} strokeWidth={3} />
              여행
            </button>
            <button 
              onClick={() => setType('rest')}
              className={`flex-1 py-4 bg-white border-2 border-black rounded-[16px] text-3xl font-black flex items-center justify-center gap-3 transition-all ${
                type === 'rest' ? 'opacity-100 shadow-lg' : 'opacity-60 grayscale'
              }`}
            >
              <RefreshCw size={36} strokeWidth={3} />
              휴식
            </button>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-2xl font-black text-gray-700 ml-2">시작일</label>
              <input 
                type="text"
                placeholder="연도-월-일"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border-none rounded-[16px] py-6 text-2xl font-black text-gray-400 outline-none text-center shadow-md placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-2xl font-black text-gray-700 ml-2">끝나는일</label>
              <input 
                type="text"
                placeholder="연도-월-일"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border-none rounded-[16px] py-6 text-2xl font-black text-gray-400 outline-none text-center shadow-md placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Description */}
          <div className="relative">
            <textarea 
              placeholder="일정 설명(예: 제주도 가족여행)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border-none rounded-[24px] p-8 min-h-[160px] text-[20px] font-black text-gray-800 outline-none resize-none shadow-md placeholder:text-gray-300"
            />
            <button className="absolute right-6 bottom-6 w-20 h-20 bg-white border-4 border-[#2E7D32] rounded-full flex items-center justify-center text-[#2E7D32] shadow-lg active:scale-90 transition-all">
              <Mic size={48} strokeWidth={3} />
            </button>
          </div>

          {/* Submit Button */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleAddSchedule}
            className="w-[70%] mx-auto block bg-white border-none py-6 rounded-[24px] text-4xl font-black text-gray-700 shadow-lg"
          >
            일정등록하기
          </motion.button>
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          <AnimatePresence>
            {events.map((event) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#F8F9F8] border-2 border-black rounded-[24px] p-8 relative shadow-sm"
              >
                <button 
                  onClick={() => removeEvent(event.id)}
                  className="absolute right-4 top-4 text-black hover:text-red-500 transition-colors"
                >
                  <Trash2 size={40} strokeWidth={3} />
                </button>
                <p className="text-4xl font-black text-gray-700 mt-4 leading-normal">
                  {event.title}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 active:scale-90 transition-all group"
    >
      <div className="w-24 h-24 bg-white border-4 border-black rounded-[32px] flex items-center justify-center shadow-lg group-hover:translate-y-[-4px] transition-transform">
        {icon}
      </div>
      <span className="text-xl font-black text-gray-800 tracking-tight whitespace-nowrap">{label}</span>
    </button>
  );
}
