import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle,
  MessageCircleQuestion,
  ChevronRight,
  Home,
  Bot,
  CalendarDays,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToComplaints } from '../services/db';

export default function Complaint() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToComplaints((newComplaints) => {
      setComplaints(newComplaints);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-[#D1E8D1] min-h-screen font-sans flex flex-col max-w-[430px] mx-auto overflow-x-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <h2 className="text-[32px] font-black text-gray-800 mt-4 px-2">기록된 불편함들</h2>
        
        {loading ? (
          <div className="flex justify-center p-20">
             <div className="w-12 h-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 px-6 space-y-6 bg-white rounded-[40px] border-2 border-black shadow-sm mx-2">
             <MessageCircleQuestion size={64} className="mx-auto text-gray-100" />
             <p className="text-[26px] font-bold text-gray-300 leading-tight">아직 기록된 내용이<br/>없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {complaints.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => navigate(`/complaint/${item.id}`)}
                className="w-full p-4 bg-white border-2 border-green-800 rounded-[28px] flex items-center gap-6 shadow-[0_4px_0_0_rgba(22,66,44,0.05)] active:scale-[0.98] transition-all relative overflow-hidden cursor-pointer"
              >
                <div className="w-24 h-24 bg-white border-2 border-green-800 rounded-[20px] shrink-0 flex items-center justify-center overflow-hidden">
                   {item.imageUrl ? (
                     <img src={item.imageUrl} alt="불편함" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   ) : (
                     <div className="w-16 h-16 bg-gray-50 rounded-[12px]" />
                   )}
                </div>
                <div className="flex-1 flex flex-col justify-center gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[26px] font-bold text-gray-800 text-left leading-tight line-clamp-2">
                      {item.content}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.region && (
                      <div className="text-sm font-bold text-blue-600 bg-blue-50 border-2 border-blue-100 px-2 rounded-md">
                        📍 {item.region}
                      </div>
                    )}
                    <div className="text-sm font-bold text-gray-400 bg-gray-50 px-2 rounded-md">
                      작성: {item.userName || '식구'}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-base font-bold flex items-center gap-1 ${item.answer ? 'bg-green-100 text-green-700 border-2 border-green-200' : 'bg-gray-100 text-gray-400 border-2 border-gray-200'}`}>
                      {item.answer ? '해결완료' : '검토중'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <ChevronRight size={28} className="text-gray-300" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/complaint/${item.id}`);
                    }}
                    className="bg-[#2E7D32] text-white px-4 py-2 rounded-[16px] text-lg font-black shadow-[2px_2px_0_0_#163316] active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    답변하기
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


