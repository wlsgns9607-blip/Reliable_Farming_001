import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, Volume2, X, Camera, Mic, Home, CalendarDays, FileText, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import toast from 'react-hot-toast';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  deleteDoc, 
  doc, 
  limit 
} from 'firebase/firestore';

interface Message {
  id?: string;
  role: 'user' | 'model';
  content: string;
  image?: string | null;
  createdAt?: any;
}

export default function AiExpert() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Subscribe to messages from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'ai_chat_history'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      if (history.length === 0) {
        setMessages([{ role: 'model', content: '안녕하세요! 무엇이든 물어보세요.' }]);
      } else {
        setMessages(history);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const selectedImageRef = useRef(selectedImage);
  useEffect(() => { selectedImageRef.current = selectedImage; }, [selectedImage]);

  const handleMessageSubmitRef = useRef((text: string, image: string | null) => {});

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // 마크다운 기호 제거 (음성 출력 시 불필요한 기호를 읽지 않도록 함)
      const cleanText = text
        .replace(/[#*`_~\[\]()|>]/g, '') // 마크다운 기호 제거
        .replace(/\n+/g, ' ')           // 줄바꿈을 공백으로 변경
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0; // 보통 속도
      utterance.pitch = 1.0; // 보통 높낮이
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMessageSubmit = async (messageText: string, imageToUpload: string | null) => {
    if ((!messageText.trim() && !imageToUpload) || isLoading || !user) return;

    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      await addDoc(collection(db, 'users', user.uid, 'ai_chat_history'), {
        role: 'user',
        content: messageText || '이미지를 보냈습니다.',
        image: imageToUpload,
        createdAt: serverTimestamp()
      });

      const response = await fetch('/api/ai-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          image: imageToUpload
        })
      });

      if (!response.ok) throw new Error('API server error');
      
      const data = await response.json();
      const aiResponse = data.answer || '죄송합니다. 답변을 생성하는 중에 오류가 발생했습니다.';

      await addDoc(collection(db, 'users', user.uid, 'ai_chat_history'), {
        role: 'model',
        content: aiResponse,
        createdAt: serverTimestamp()
      });

      speak(aiResponse);

    } catch (error) {
      console.error('Gemini or Firestore Error:', error);
      toast.error('앗! 박사님과 연결이 끊겼습니다. 인터넷을 확인하시거나 잠시 후 다시 말씀해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { handleMessageSubmitRef.current = handleMessageSubmit; }, [handleMessageSubmit]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'ko-KR';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        setIsRecording(false);
        
        const cleanText = transcript.replace(/\s+/g, '');
        if (cleanText.includes('홈으로') || cleanText.includes('뒤로')) {
          navigate('/');
          return;
        }
        if (cleanText.includes('농사일지') || cleanText.includes('일지')) {
          navigate('/logs');
          return;
        }
        if (cleanText.includes('일정관리') || cleanText.includes('일정') || cleanText.includes('달력')) {
          navigate('/schedule');
          return;
        }
        if (cleanText.includes('민원')) {
          navigate('/complaint');
          return;
        }
        if (cleanText.includes('사진') || cleanText.includes('카메라')) {
          handleImageClick();
          return;
        }
        if (cleanText.includes('멈춰') || cleanText.includes('그만') || cleanText.includes('조용')) {
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
          return;
        }

        handleMessageSubmitRef.current(transcript, selectedImageRef.current);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
    }
  }, [navigate]);

  const toggleRecording = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);
    }
    
    if (!recognitionRef.current) {
      alert('음성 인식을 지원하지 않는 브라우저입니다.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMessage = async (id?: string) => {
    if (!user || !id) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'ai_chat_history', id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleSend = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);
    }
    handleMessageSubmit(input, selectedImage);
  };

  return (
    <div className="flex flex-col h-full relative bg-[#DDE1E7]">
      {/* Search Bar */}
      <div className="shrink-0 px-6 pt-4 pb-2 z-10">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="어떤 대화를 찾으시나요? (검색)"
            className="w-full bg-white border-2 border-black rounded-[20px] pl-14 pr-12 h-[60px] text-[22px] font-bold outline-none placeholder:text-gray-400 text-gray-800 shadow-sm"
          />
          <Search size={28} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-300 rounded-full p-1 active:scale-95 border border-black"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 space-y-8 pb-10 scroll-smooth pt-2"
      >
        <AnimatePresence>
          {messages
            .filter(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full relative"
            >
              <div className={`p-8 rounded-[40px] border-2 border-black shadow-sm relative min-h-[160px] flex flex-col ${
                msg.role === 'user' 
                  ? 'bg-[#1D2E44] text-white' 
                  : 'bg-[#F5F4E8] text-gray-800'
              }`}>
                {/* Header with Title and Close Button */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-[32px] font-bold">
                    {msg.role === 'user' ? '궁금한점' : 'AI 농사박사 답변'}
                  </h3>
                  <button 
                    onClick={() => removeMessage(msg.id)}
                    className="group opacity-30 hover:opacity-100 transition-opacity relative"
                  >
                    <X size={28} strokeWidth={2.5} />
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-base font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border-2 border-white z-50 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-black">
                      삭제하기
                    </span>
                  </button>
                </div>

                {/* Content */}
                <div className={`text-[28px] font-medium leading-tight flex-1 ${msg.role === 'model' ? 'markdown-body' : ''}`}>
                  {(msg as any).image && (
                    <div className="mb-4 rounded-[20px] overflow-hidden border-2 border-black/20">
                      <img src={(msg as any).image} alt="User upload" className="w-full h-auto max-h-60 object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  {msg.role === 'model' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-end mt-6">
                  {msg.role === 'model' && (
                    <button 
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(msg.content);
                        } catch (e) {
                          const el = document.createElement('textarea');
                          el.value = msg.content;
                          document.body.appendChild(el);
                          el.select();
                          document.execCommand('copy');
                          document.body.removeChild(el);
                        }
                        localStorage.setItem('copied_ai_expert_content', msg.content);
                        localStorage.setItem('copied_ai_expert_time', Date.now().toString());
                        toast.success('답변 글을 복사했습니다! 이제 농사일지 채팅방으로 가서 붙여넣으세요.');
                        navigate('/logs');
                      }}
                      className="flex items-center gap-3 py-3 px-6 rounded-full border-2 border-black font-black text-2xl active:scale-95 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-[#FF9800] hover:bg-[#FFB74D] text-white"
                    >
                      <FileText size={36} className="shrink-0" />
                      <span>내 일지에 저장하기</span>
                    </button>
                  )}
                  <button 
                    onClick={() => speak(msg.content)}
                    className={`flex items-center gap-3 py-3 px-6 rounded-full border-2 border-black font-black text-2xl active:scale-95 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                      msg.role === 'user' 
                        ? 'bg-white text-black' 
                        : 'bg-[#2E7D32] text-white'
                    }`}
                  >
                    <Volume2 size={36} className="shrink-0" />
                    <span>소리로 듣기</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-20 flex items-center justify-center"
          >
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area Overlay */}
      <div className="shrink-0 p-6 pt-4 flex flex-col gap-4 bg-white border-t-2 border-black rounded-t-[40px] z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageChange} 
          accept="image/*" 
          capture="environment"
          className="hidden" 
        />

        {selectedImage && (
          <div className="relative w-24 h-24 border-2 border-black rounded-[16px] overflow-hidden">
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="group absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 relative"
            >
              <X size={16} />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md border border-white z-50 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-black">
                지우기
              </span>
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Top Row: Camera & Mic buttons (Large) */}
          <div className="flex gap-3">
            <button 
              onClick={handleImageClick}
              className={`flex-1 h-[70px] border-2 border-black rounded-[20px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md ${
                selectedImage ? 'bg-green-100 border-green-600 text-green-600' : 'bg-white text-gray-800'
              }`}
            >
              <Camera size={32} />
              <span className="text-[22px] font-bold">{selectedImage ? '사진 변경' : '사진 첨부'}</span>
            </button>
            
            <button 
              onClick={toggleRecording}
              className={`flex-1 h-[70px] rounded-[20px] flex items-center justify-center gap-2 border-2 border-black transition-all active:scale-95 shadow-md ${
                isRecording 
                  ? 'bg-red-500 border-red-600 text-white animate-pulse' 
                  : 'bg-white text-gray-800'
              }`}
            >
              <Mic size={32} />
              <span className="text-[22px] font-bold">{isRecording ? '듣는 중...' : '음성으로 묻기'}</span>
            </button>
          </div>

          {/* Bottom Row: Text input & Send */}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="여기를 눌러 질문하기..."
              className="flex-1 bg-white border-2 border-black rounded-[20px] px-5 h-[70px] text-[24px] font-bold outline-none placeholder:text-gray-500 text-gray-800 shadow-inner"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="h-[70px] px-6 bg-[#2E7D32] border-2 border-black text-white rounded-[20px] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 transition-all shadow-md shrink-0"
            >
              <Send size={28} className="rotate-[-45deg] -mt-1" />
              <span className="text-[24px] font-bold">전송</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
