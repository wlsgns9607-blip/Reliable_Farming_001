import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToLogs, deleteLog } from '../services/db';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Volume2, 
  Share2, 
  Trash2, 
  Plus, 
  UserPlus, 
  X,
  PlusCircle,
  FileText,
  CalendarDays,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchUserByUid, updateUserProfile } from '../services/db';
import toast from 'react-hot-toast';

export default function LogList() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [searchUid, setSearchUid] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToLogs((newLogs) => {
      setLogs(newLogs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShare = async (log: any) => {
    const shareData = {
      title: log.title || '농사일지',
      text: log.content.substring(0, 100),
      url: window.location.origin + `/logs/${log.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('링크가 복사되었습니다!');
      } catch (err) {
        toast.error('링크 복사에 실패했습니다.');
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteLog(id);
        toast.success('삭제되었습니다.');
      } catch (e) {
        toast.error('삭제 실패');
      }
    }
  };

  const handleAddFamily = async () => {
    if (!user || !profile || !searchUid.trim()) return;
    setIsSearching(true);
    try {
      const foundUser = await searchUserByUid(searchUid);
      if (foundUser) {
        const newFamilyUids = [...(profile.familyUids || []), searchUid];
        await updateUserProfile(user.uid, { familyUids: newFamilyUids });
        toast.success(`${foundUser.name || '식구'}님을 추가했습니다!`);
        setSearchUid('');
        setShowFamilyModal(false);
      } else {
        toast.error('사용자를 찾을 수 없습니다.');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-[#D1E8D1] min-h-screen flex flex-col font-sans max-w-[430px] mx-auto pb-44">
      {/* Header */}
      <div className="px-6 pt-10 pb-4 flex items-center sticky top-0 bg-[#D1E8D1]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
           <button onClick={() => navigate('/')} className="p-2 -ml-2 active:scale-90 transition-all">
             <Home size={32} strokeWidth={2.5} />
           </button>
           <h1 className="text-4xl font-black text-gray-800 tracking-tighter">농사일지</h1>
        </div>
      </div>

      <div className="px-6 space-y-8 pt-4">
        {/* Intro Banner */}
        <div 
          onClick={() => handleSpeak('우리 식구들과 함께 적는 농사일기')}
          className="bg-white border-4 border-black rounded-[40px] p-8 flex justify-between items-center shadow-sm active:scale-95 transition-all cursor-pointer group"
        >
          <p className="text-3xl font-black text-gray-800 leading-tight">
            우리 식구들과<br />함께 적는 농사일기
          </p>
          <div className="bg-gray-100 p-4 rounded-3xl text-gray-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
            <Volume2 size={48} strokeWidth={3} />
          </div>
        </div>

        {/* Log Cards */}
        <div className="space-y-10">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-4 border-black rounded-[48px] overflow-hidden shadow-md"
              >
                {/* Image if exists */}
                {log.imageUrl && (
                  <div className="border-b-4 border-black aspect-square overflow-hidden cursor-pointer" onClick={() => navigate(`/logs/${log.id}`)}>
                    <img src={log.imageUrl} alt="농사현장" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start" onClick={() => navigate(`/logs/${log.id}`)}>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-brand-primary">#{log.category}</span>
                        <span className="text-sm font-bold text-gray-400">{log.userName || '식구'}</span>
                      </div>
                      <h3 className="text-4xl font-black text-gray-800 line-clamp-1">{log.title || '일지가 도착했어요!'}</h3>
                      <p className="text-xl font-bold text-gray-500 line-clamp-2">{log.content}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleSpeak(`${log.title}. ${log.content}`)}
                      className="flex-1 bg-[#F1F8F1] border-4 border-black py-4 rounded-[24px] flex items-center justify-center gap-2 text-2xl font-black active:scale-95 transition-all shadow-sm"
                    >
                      <Volume2 size={32} />
                      들기
                    </button>
                    <button 
                      onClick={() => handleShare(log)}
                      className="flex-1 bg-white border-4 border-black py-4 rounded-[24px] flex items-center justify-center gap-2 text-2xl font-black active:scale-95 transition-all shadow-sm"
                    >
                      <Share2 size={32} />
                      공유
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button 
                      onClick={() => navigate(`/logs/${log.id}`)}
                      className="flex-1 bg-brand-primary text-white border-4 border-black py-5 rounded-[28px] text-3xl font-black shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      상세보기
                      <ChevronRight size={32} />
                    </button>
                    {log.userId === user?.uid && (
                      <button onClick={(e) => handleDelete(log.id, e)} className="p-4 text-gray-300 active:text-red-500">
                        <Trash2 size={28} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center space-y-6">
              <PlusCircle size={80} className="mx-auto text-gray-400 opacity-20" />
              <p className="text-2xl font-bold text-gray-400">첫 일지를 작성해보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* Family Invite Modal */}
      <AnimatePresence>
        {showFamilyModal && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-black rounded-[48px] p-10 w-full max-w-[400px] space-y-8 relative"
            >
              <button onClick={() => setShowFamilyModal(false)} className="absolute top-6 right-6 text-gray-400 p-2"><X size={40} /></button>
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-gray-800">식구 초대</h2>
                <p className="text-xl font-bold text-gray-500">함께 일지를 관리할 가족을 모셔요</p>
              </div>
              <div className="bg-[#BACEE0]/30 p-6 rounded-3xl border-2 border-dashed border-[#BACEE0]">
                <p className="text-sm font-black text-[#556677] mb-2 uppercase tracking-tight">나의 고유 번호</p>
                <p className="text-lg font-mono font-black break-all text-gray-800">{user?.uid}</p>
              </div>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="식구의 번호를 입력하세요"
                  value={searchUid}
                  onChange={(e) => setSearchUid(e.target.value)}
                  className="w-full bg-gray-100 border-4 border-black rounded-[24px] py-6 px-6 text-2xl font-black focus:outline-none placeholder:text-gray-300"
                />
                <button 
                  onClick={handleAddFamily}
                  disabled={isSearching}
                  className="w-full bg-[#FEE500] border-4 border-black py-6 rounded-[32px] text-3xl font-black active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  <UserPlus size={40} />
                  식구 추가하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
