import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Mic, Calendar, User as UserIcon, Settings, ChevronLeft, MapPin, MessageSquare, Home, Plus, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';

import BottomNav from './BottomNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  // List of paths that should have the bottom nav
  const showBottomNav = ['/ai-expert', '/logs', '/schedule', '/complaint'].includes(location.pathname);

  // List of paths that should hide the global top header
  const hideHeader = [
    '/login', 
    '/onboarding'
  ].includes(location.pathname) || 
  location.pathname.startsWith('/logs/') || 
  location.pathname.startsWith('/complaint/');

  const playUsageGuide = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      let text = "";
      
      if (location.pathname === '/ai-expert') {
        text = "어르신, 요 화면은 내 밭에 궁금한 거 물어보는 척척박사 방이여요. 사용하시는 방법 참 쉽습니다! 첫번째로, 저 밑에 마이크 그림 보이시지오? 그거 손가락으로 꾹 누르시고, '올해 고추 심을 때 거름을 얼마나 줘야 하냐~' 하고 편하게 말씀만 하셔요. 두번째로, 그러면 요 박사가 글씨랑 목소리로 싹 대답해 줄 겁니다. 세번째로, 만약 이 대답을 멀리 사는 자녀들한테도 보여주고 싶으시면, 대답 밑에 협업일지에 복사 버튼을 툭 누르셔요. 그러면 우리 자녀들이 보는 소통방에 아버님이 공부하신 내용이 그대로 복사돼서 쏙 들어갑니다!";
      } else if (location.pathname.startsWith('/logs')) {
        text = "어르신, 여기는 오늘 농사지은 내용을 기록하는 농사일지 방이여요. 사용하시는 법 알려드릴게요! 첫번째로, 저 위에 초록색 십자가 모양 방 만들기 버튼 보이시죠? 그걸 툭 누르면 새 일지를 쓸 수 있습니다. 두번째로, 오늘 찍은 예쁜 사진도 올리고, 오늘 무슨 일을 했는지 말씀만 하시면 글자로 싹 적어드려요. 세번째로, 다 적으신 다음에 저장하기를 누르면 우리 가족들이 다 같이 볼 수 있답니다!";
      } else if (location.pathname === '/schedule') {
        text = "어르신, 여기는 우리 달력에다가 제삿날이나 잔칫날, 또 병원 가는 날 같은 중요한 일정을 적어두는 곳이여요. 사용법 알려드릴게요! 첫번째로, 달력에서 날짜를 손가락으로 툭 누르셔요. 두번째로, 그러면 그날 무슨 일이 있는지 적는 창이 뜹니다. 마이크 버튼 누르고 '다음 주 수요일 농약 치는 날' 하고 말씀하시면 글자로 싹 적어드려요. 세번째로, 저장하기를 누르면 달력에 예쁘게 표시가 된답니다!";
      } else if (location.pathname.startsWith('/complaint')) {
        text = "어르신, 여기는 농사짓다가 속상한 일이나 어려운 일이 있을 때 전국에 있는 다른 농부님들한테 물어보는 곳이여용. 사용법 알려드릴게요! 첫번째로, 저 위에 초록색 더하기 버튼 보이시죠? 그걸 누르고 아픈 작물 사진이나 궁금한 걸 적으셔요. 두번째로, 그러면 다른 동네 농부님들이나 전문가들이 '이건 이렇게 하면 된다~' 하고 답글을 달아줄 겁니다. 세번째로, 우리 서로 돕고 살면서 풍년 만들어보자고요!";
      }

      if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.9; // Slightly slower for better clarity
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col relative bg-brand-bg max-w-[430px] mx-auto border-x border-black/5 shadow-2xl overflow-hidden font-sans">
      {/* Top Header (only on subpages) */}
      {!isHome && !hideHeader && (
        <header className={`p-6 pb-2 flex items-center shrink-0 bg-brand-bg/80 backdrop-blur-md z-40 ${['/ai-expert', '/logs', '/schedule', '/complaint'].includes(location.pathname) ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${['/ai-expert', '/logs', '/schedule', '/complaint'].includes(location.pathname) ? 'w-full justify-center' : ''}`}>
            {!['/ai-expert', '/logs', '/schedule', '/complaint'].includes(location.pathname) && (
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-90 transition-all">
                <div className="w-12 h-12 bg-white border-2 border-black rounded-[16px] flex items-center justify-center shadow-sm">
                  <ChevronLeft size={32} className="text-black" strokeWidth={3} />
                </div>
              </button>
            )}
            <h1 className={`text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2 ${['/ai-expert', '/logs', '/schedule', '/complaint'].includes(location.pathname) ? 'text-center' : ''}`}>
              {location.pathname.startsWith('/logs') ? (
                <>
                  농사일지
                  <motion.button 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    onClick={playUsageGuide}
                    className="group bg-[#2E7D32]/10 p-2 rounded-full border-2 border-black active:scale-95 transition-all text-[#2E7D32] relative"
                  >
                    <Volume2 size={24} strokeWidth={3} />
                    <span className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-black text-white text-base font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border-2 border-white z-50 after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-b-black">
                      사용방법 듣기
                    </span>
                  </motion.button>
                </>
              ) : 
               location.pathname.startsWith('/complaint') ? (
                <>
                  우리밭 해결소
                  <motion.button 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    onClick={playUsageGuide}
                    className="group bg-[#2E7D32]/10 p-2 rounded-full border-2 border-black active:scale-95 transition-all text-[#2E7D32] relative"
                  >
                    <Volume2 size={24} strokeWidth={3} />
                    <span className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-black text-white text-base font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border-2 border-white z-50 after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-b-black">
                      사용방법 듣기
                    </span>
                  </motion.button>
                </>
               ) :
               location.pathname === '/schedule' ? (
                <>
                  휴무 & 일정
                  <motion.button 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    onClick={playUsageGuide}
                    className="group bg-[#E64A19]/10 p-2 rounded-full border-2 border-black active:scale-95 transition-all text-[#E64A19] relative"
                  >
                    <Volume2 size={24} strokeWidth={3} />
                    <span className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-black text-white text-base font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border-2 border-white z-50 after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-b-black">
                      사용방법 듣기
                    </span>
                  </motion.button>
                </>
               ) : 
               location.pathname === '/harvest' ? '수확시기' : 
               location.pathname === '/ai-expert' ? (
                 <>
                   AI 척척박사
                   <motion.button 
                     animate={{ scale: [1, 1.1, 1] }} 
                     transition={{ repeat: Infinity, duration: 2 }}
                     onClick={playUsageGuide}
                     className="group bg-brand-primary/20 p-2 rounded-full border-2 border-black active:scale-95 transition-all text-brand-primary relative"
                   >
                     <Volume2 size={24} strokeWidth={3} />
                     <span className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-black text-white text-base font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border-2 border-white z-50 after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-b-black">
                      사용방법 듣기
                    </span>
                   </motion.button>
                 </>
               ) : '든든농사'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {location.pathname === '/logs' && (
              <button 
                onClick={() => navigate('/logs/create')}
                className="group w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center border-2 border-black shadow-sm text-white active:scale-90 transition-all font-black relative"
              >
                <Plus size={28} strokeWidth={3} />
                <span className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-black text-white text-base font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border-2 border-white z-50 after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-b-black">
                  방 만들기
                </span>
              </button>
            )}
            {location.pathname === '/complaint' && (
              <button 
                onClick={() => navigate('/complaint/create')}
                className="group w-12 h-12 rounded-full bg-[#66BB6A] flex items-center justify-center border-2 border-black shadow-sm text-white active:scale-90 transition-all font-black relative"
              >
                <Plus size={28} strokeWidth={3} />
                <span className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-black text-white text-base font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border-2 border-white z-50 after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-b-black">
                  글 쓰기
                </span>
              </button>
            )}
          </div>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto ${showBottomNav ? 'pb-32' : ''}`}>
        {children}
      </main>

      {user && showBottomNav && <BottomNav />}
    </div>
  );
}
