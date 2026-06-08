import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { saveLogComment, subscribeToLogMessages } from '../services/db';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  ArrowLeft, Share2, Volume2, Plus, Send, Camera, Image as ImageIcon, X, Mic, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LogDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedAiContent, setCopiedAiContent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const text = localStorage.getItem('copied_ai_expert_content');
    const timeStr = localStorage.getItem('copied_ai_expert_time');
    if (text) {
      if (timeStr) {
        const time = parseInt(timeStr, 10);
        if (Date.now() - time < 3600000) { // Valid for 1 hour
          setCopiedAiContent(text);
          return;
        }
      }
      localStorage.removeItem('copied_ai_expert_content');
      localStorage.removeItem('copied_ai_expert_time');
    }
  }, []);

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'ko-KR';
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        setNewMessage(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
        toast.success('말씀하신 내용이 글자로 적혔습니다!');
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        toast.error('음성 인식 중 오류가 발생했습니다.');
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);
    }

    if (!recognitionRef.current) {
      toast.error('음성 인식을 지원하지 않는 브라우저입니다.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    async function loadLog() {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'logs', id));
        if (docSnap.exists()) {
          setLog({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadLog();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToLogMessages(id, (newMessages) => {
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedImage) || isSending || !id) return;
    
    setIsSending(true);
    try {
      await saveLogComment(id, newMessage, selectedImage || undefined, user?.uid, user?.displayName || "가족");
      setNewMessage('');
      setSelectedImage(null);
    } catch (e) {
      toast.error('전송 실패');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    if (!log) return;
    const shareData = {
      title: log.title || '농사일지',
      text: log.content,
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 복사되었습니다!');
    }
  };

  if (loading) return (
    <div className="bg-[#D1E8D1] min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-[#BACEE0] h-screen flex flex-col font-sans max-w-[480px] mx-auto overflow-hidden relative">
      {/* Chat Header */}
      <div className="px-4 pt-10 pb-4 bg-[#BACEE0] flex items-center justify-between z-20 sticky top-0 shadow-sm border-b border-black/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/logs')} className="p-2 -ml-1 text-gray-700 active:scale-95">
            <ArrowLeft size={38} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 line-clamp-1">{log?.title || '농사식구 비밀방'}</h1>
            <p className="text-sm font-bold text-gray-600">#{log?.category} 참여 중</p>
          </div>
        </div>
        <button onClick={handleShare} className="p-3 bg-white/30 rounded-2xl border-2 border-black/10 active:scale-90">
          <Share2 size={26} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="shrink-0 px-4 pt-4 pb-2 z-10 bg-[#BACEE0]">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="어떤 내용을 찾으시나요? (검색)"
            className="w-full bg-white border-2 border-black/20 rounded-[16px] pl-12 pr-10 h-[56px] text-lg font-bold outline-none placeholder:text-gray-400 text-gray-800 shadow-sm"
          />
          <Search size={24} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-300 rounded-full p-1 active:scale-95"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Message Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth pb-36"
      >
        {/* Initial Log Content */}
        {(!searchTerm || (log?.content || '').toLowerCase().includes(searchTerm.toLowerCase()) || (log?.title || '').toLowerCase().includes(searchTerm.toLowerCase())) && (
        <div className="flex flex-col items-center mb-10">
          <div className="bg-black/10 text-white text-base font-bold px-5 py-1.5 rounded-full mb-6">
            {log?.timestamp ? format(log.timestamp.toDate(), 'yyyy년 M월 d일 eeee', { locale: ko }) : ''}
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border-4 border-black rounded-[32px] p-6 max-w-[95%] space-y-4 shadow-md w-full">
            <h2 className="text-3xl font-black">{log?.title}</h2>
            <p className="text-2xl font-bold text-gray-800 leading-relaxed">{log?.content}</p>
            {log?.imageUrl && <img src={log.imageUrl} alt="현장사진" className="w-full rounded-2xl border border-black/5" />}
            <button 
              onClick={() => handleSpeak(log.content)}
              className="flex items-center gap-2 bg-[#2E7D32]/10 text-[#2E7D32] hover:bg-[#2E7D32]/15 py-3 px-5 rounded-2xl border-2 border-[#2E7D32]/20 font-black text-xl active:scale-95 transition-all shadow-sm"
            >
              <Volume2 size={28} /> 크게 듣기
            </button>
          </motion.div>
        </div>
        )}

        {/* Real-time Messages */}
        {messages
          .filter(msg => !searchTerm || (msg.content || '').toLowerCase().includes(searchTerm.toLowerCase()))
          .map((msg, idx) => {
          const isMe = msg.userId === user?.uid;
          return (
            <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
              {!isMe && (
                <div className="flex items-center gap-2 mb-1 px-1">
                  <div className="w-10 h-10 bg-white rounded-xl border border-black/10 flex items-center justify-center text-sm font-black uppercase text-gray-600 shadow-sm">
                    {msg.userName?.charAt(0)}
                  </div>
                  <span className="text-base font-black text-gray-700">{msg.userName}</span>
                </div>
              )}
              
              <div className={`max-w-[92%] flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                <div className={`p-5 rounded-2xl border-2 border-black/10 shadow-sm ${
                  isMe 
                    ? 'bg-[#FEE500] text-black rounded-tr-none' 
                    : 'bg-white text-black rounded-tl-none'
                }`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="사진" className="w-full rounded-xl mb-3 border border-black/5" />
                  )}
                  <div className="flex items-start justify-between gap-4">
                    {msg.content && <p className="text-[23px] font-extrabold leading-snug whitespace-pre-wrap flex-1 text-black">{msg.content}</p>}
                    {msg.content && (
                      <button 
                        onClick={() => handleSpeak(msg.content)}
                        className={`p-3 rounded-full border border-black/10 active:scale-90 transition-all shrink-0 shadow-md ${
                          isMe 
                            ? 'bg-black/10 hover:bg-black/15 text-black' 
                            : 'bg-green-50 hover:bg-green-100 text-[#2E7D32]'
                        }`}
                        title="소리로 듣기"
                      >
                        <Volume2 size={26} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-600 mb-1 shrink-0">
                  {msg.createdAt ? format(msg.createdAt.toDate(), 'a h:mm', { locale: ko }) : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#BACEE0] p-4 pb-10 z-30 border-t border-black/5">
        {copiedAiContent && (
          <div className="mb-3 p-4 bg-[#FF9800]/10 border-2 border-[#FF9800] rounded-2xl flex items-center justify-between gap-3 shadow-md max-w-[480px] mx-auto">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-black text-[#E65100]">💡 복사해온 박사님 답변이 있어요!</span>
              <p className="text-base font-bold text-gray-800 truncate mt-0.5">{copiedAiContent}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => {
                  setNewMessage(copiedAiContent);
                  setCopiedAiContent(null);
                  localStorage.removeItem('copied_ai_expert_content');
                  localStorage.removeItem('copied_ai_expert_time');
                  toast.success('박사님 답변을 아래 적는 칸에 넣었습니다!');
                }}
                className="bg-[#FF9800] hover:bg-[#F57C00] text-white font-black py-2 px-3 rounded-xl text-sm shadow-sm active:scale-95 transition-all animate-pulse"
              >
                여기에 넣기
              </button>
              <button 
                onClick={() => {
                  setCopiedAiContent(null);
                  localStorage.removeItem('copied_ai_expert_content');
                  localStorage.removeItem('copied_ai_expert_time');
                }}
                className="text-gray-500 hover:text-gray-700 p-1.5 border border-black/10 rounded-full bg-white active:scale-90"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img src={selectedImage} alt="preview" className="w-24 h-24 rounded-xl border-2 border-black object-cover" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 max-w-[480px] mx-auto w-full px-1">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="group w-16 h-16 bg-white border-2 border-black rounded-[20px] flex items-center justify-center active:scale-95 shadow-sm shrink-0 relative"
          >
            <Camera size={32} />
            <span className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black text-white text-base font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border-2 border-white z-50 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-black">
              사진 찍기
            </span>
          </button>
          
          <div className="flex-1 min-w-0 bg-white rounded-[20px] py-3 px-4 shadow-sm flex items-end gap-3 border-2 border-black">
            <textarea 
              rows={1}
              placeholder="식구에게 하고 싶은 말..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              className="flex-1 min-w-0 bg-transparent py-2 text-2xl font-extrabold focus:outline-none resize-none max-h-32 text-gray-800 placeholder:text-gray-300"
            />
            {/* Mic inside the Chat Input Bar */}
            <button 
              onClick={toggleRecording}
              className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all shrink-0 active:scale-90 ${
                isRecording 
                  ? 'bg-red-500 border-red-600 text-white animate-pulse shadow-md' 
                  : 'bg-white border-gray-300 text-gray-800 shadow-sm'
              }`}
              title="음성으로 쓰기"
            >
              <Mic size={28} strokeWidth={2.5} />
            </button>
            <button 
              onClick={handleSend}
              disabled={(!newMessage.trim() && !selectedImage) || isSending}
              className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all shrink-0 active:scale-90 ${newMessage.trim() || selectedImage ? 'bg-[#FEE500] text-black border-black/10 shadow-sm' : 'border-gray-200 text-gray-300 pointer-events-none'}`}
            >
              <Send size={26} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


