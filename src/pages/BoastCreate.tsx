import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mic, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function BoastCreate() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const types = ['채소', '과일', '곡류'];

  return (
    <div className="bg-[#F6F8F5] min-h-screen font-sans flex flex-col pb-6">
      {/* Header */}
      <header className="p-5 flex items-center gap-4 bg-[#F6F8F5] sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 active:scale-90 transition-all text-[#1E8449]">
          <ChevronLeft size={32} strokeWidth={2.5} />
        </button>
        <h1 className="text-[22px] font-bold text-[#2C3E30]">게시물 쓰기</h1>
      </header>

      <div className="px-5 pt-2 flex-1 flex flex-col gap-8">
        
        {/* Photo Upload Section */}
        <section>
          <h2 className="text-[17px] font-bold text-[#4B5A4D] mb-3">사진 올리기</h2>
          <div className="relative h-48 rounded-xl border-2 border-dashed border-[#B4C5B6] bg-[#E8EFE9] overflow-hidden flex flex-col items-center justify-center gap-3">
            {/* faint background image mockup */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80')] bg-cover bg-center pointer-events-none"></div>
            
            <button className="relative z-10 w-20 h-20 bg-[#2E7D32] rounded-full flex items-center justify-center text-white shadow-[0_4px_10px_rgba(46,125,50,0.3)] active:scale-95 transition-all">
              <Camera size={34} strokeWidth={2} />
            </button>
            <span className="relative z-10 text-[17px] font-bold text-[#2E7D32]">사진 찍기/올리기</span>
          </div>
        </section>

        {/* Text Input Section */}
        <section>
          <h2 className="text-[17px] font-bold text-[#4B5A4D] mb-3">농부의 한마디</h2>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 수확한 작물에 대해 한마디 적어주세요."
            className="w-full h-36 rounded-[16px] border border-[#CBD5CC] p-4 text-[16px] resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32] placeholder:text-[#8D9B8F] shadow-sm font-medium"
          />
        </section>

        {/* Voice Input Section */}
        <section className="flex flex-col items-center justify-center mt-2 mb-2">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="w-[140px] h-[140px] rounded-full bg-[#FFD1C1] flex flex-col items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,209,193,0.5)] border-4 border-white mb-5"
          >
            <Mic size={42} className="text-[#6D4C41]" strokeWidth={2.5} />
            <span className="text-[13px] font-bold text-[#6D4C41]">말씀으로 기록하기</span>
          </motion.button>
          <div className="text-center space-y-1">
            <p className="text-[14px] font-bold text-[#5D6B5F]">글씨 쓰기가 힘드시다면</p>
            <p className="text-[14px] font-bold text-[#5D6B5F]">버튼을 누르고 말씀해 보세요!</p>
          </div>
        </section>

        {/* Type Selection */}
        <section>
          <h2 className="text-[17px] font-bold text-[#4B5A4D] mb-3">종류 선택</h2>
          <div className="flex gap-3">
            {types.map(type => (
              <button 
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex-1 py-4 rounded-[14px] text-[17px] font-bold transition-all border ${selectedType === type ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md' : 'bg-[#EAEFEA] text-[#4A5D4E] border-[#D1E0D3]'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Submit Button */}
      <div className="px-5 mt-10">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            navigate('/boast');
          }}
          className="w-full bg-[#2E7D32] text-white rounded-[16px] py-4 shadow-[0_6px_0_#1B5E20] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all mb-4"
        >
          <span className="text-[20px] font-bold">자랑하기 완료 ▷</span>
        </motion.button>
      </div>
    </div>
  );
}
