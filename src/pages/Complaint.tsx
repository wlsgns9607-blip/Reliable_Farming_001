import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle,
  MessageCircleQuestion,
  ChevronRight,
  Home,
  Bot,
  CalendarDays,
  FileText,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToComplaints, deleteComplaint } from '../services/db';

export default function Complaint() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToComplaints((newComplaints) => {
      setComplaints(newComplaints);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteComplaint(id);
    }
  };

  return (
    <div className="bg-[#D1E8D1] min-h-screen font-sans flex flex-col max-w-[430px] mx-auto overflow-x-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <h2 className="text-[32px] font-black text-gray-800 mt-4 px-2">기록된 불편함들</h2>
        
        <div className="px-2">
          <div className="relative">
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-white border-2 border-green-800 rounded-[20px] px-5 py-3 text-[18px] font-bold text-gray-800 outline-none appearance-none shadow-sm"
            >
              <option value="">🗺️ 모든 지역 보기</option>
              <option value="서울특별시">서울특별시</option>
              <option value="부산광역시">부산광역시</option>
              <option value="대구광역시">대구광역시</option>
              <option value="인천광역시">인천광역시</option>
              <option value="광주광역시">광주광역시</option>
              <option value="대전광역시">대전광역시</option>
              <option value="울산광역시">울산광역시</option>
              <option value="세종특별자치시">세종특별자치시</option>
              <option value="경기도">경기도</option>
              <option value="강원도">강원도</option>
              <option value="충청북도">충청북도</option>
              <option value="충청남도">충청남도</option>
              <option value="전라북도">전라북도</option>
              <option value="전라남도">전라남도</option>
              <option value="경상북도">경상북도</option>
              <option value="경상남도">경상남도</option>
              <option value="제주특별자치도">제주특별자치도</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" className="text-green-800"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </div>
        
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
          <div className="space-y-4">
            {(selectedRegion ? complaints.filter(c => c.region === selectedRegion) : complaints).map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full p-4 bg-white border-2 border-green-800 rounded-[28px] flex items-center gap-6 shadow-[0_4px_0_0_rgba(22,66,44,0.05)] transition-all relative overflow-hidden"
              >
                <div className="w-24 h-24 bg-white border-2 border-green-800 rounded-[20px] shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                   {item.imageUrl ? (
                     <img src={item.imageUrl} alt="불편함" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   ) : (
                     <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                       <FileText size={32} className="text-gray-300" />
                     </div>
                   )}
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                  {item.region && (
                    <div className="text-[12px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg w-fit mb-1 shrink-0">
                      📍 {item.region}
                    </div>
                  )}
                  <span className="text-[20px] font-black text-gray-800 text-left leading-tight line-clamp-1 truncate mb-1">
                    {item.content}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-gray-500">
                      작성: {item.userName || '식구'}
                    </span>
                    <span className={`text-[12px] px-2 py-0.5 rounded-full font-bold shrink-0 ${item.answer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.answer ? '해결완료' : '검토중'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center shrink-0 gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/complaint/${item.id}`);
                    }}
                    className="bg-[#2E7D32] text-white px-3 py-2 rounded-xl text-sm font-black shadow-[2px_2px_0_0_#163316] active:translate-y-0.5 active:shadow-none transition-all whitespace-nowrap"
                  >
                    답변하기
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="flex items-center gap-1 text-[12px] font-bold text-gray-400 hover:text-red-500 active:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                    삭제
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


