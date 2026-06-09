import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, BookOpen, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      id: 'home', 
      label: '홈으로', 
      icon: <Home size={32} />, 
      path: '/',
      active: location.pathname === '/'
    },
    { 
      id: 'expert', 
      label: '농사상담', 
      icon: <MessageCircle size={32} />, 
      path: '/ai-expert',
      active: location.pathname === '/ai-expert'
    },
    { 
      id: 'schedule', 
      label: '일정관리', 
      icon: <CalendarDays size={32} />, 
      path: '/schedule',
      active: location.pathname === '/schedule'
    },
    { 
      id: 'logs', 
      label: '지난 일지', 
      icon: <BookOpen size={32} />, 
      path: '/logs',
      active: location.pathname.startsWith('/logs')
    },
  ].filter(item => {
    // Hide certain icons when on their respective pages as requested
    if (location.pathname.startsWith('/logs') && item.id === 'logs') return false;
    if (location.pathname === '/ai-expert' && item.id === 'expert') return false;
    if (location.pathname === '/schedule' && item.id === 'schedule') return false;
    return true;
  });

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t-2 border-black rounded-t-[32px] px-4 pt-4 pb-8 flex justify-around items-end z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => (
        <motion.button
          key={item.id}
          onClick={() => navigate(item.path)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-1 group transition-all"
        >
          <motion.div 
            layoutId={`nav-icon-${item.id}`}
            className={`w-16 h-16 rounded-[20px] border-2 border-black flex items-center justify-center transition-all ${
              item.active 
                ? 'bg-brand-primary text-white scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white text-gray-800 group-hover:bg-gray-50'
            }`}
          >
            {item.icon}
          </motion.div>
          <motion.span 
            className={`text-[15px] font-extrabold mt-1 transition-colors ${item.active ? 'text-brand-primary' : 'text-gray-700 group-hover:text-black'}`}
          >
            {item.label}
          </motion.span>
        </motion.button>
      ))}
    </div>
  );
}
