import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, 
  UserRound, 
  Bot, 
  Tractor, 
  Users, 
  MapPin, 
  MessageCircleQuestion, 
  Sun, 
  CloudSun, 
  Cloud,
  CloudFog,
  CloudRain,
  Snowflake,
  CloudLightning,
  ChevronRight,
  ArrowLeft,
  X,
  Mail,
  Lock,
  Eye,
  Calendar,
  Phone,
  UserCircle,
  AlertTriangle,
  Car
} from 'lucide-react';
import { getLocalWeather, parseWeatherCode } from '../services/weather';
import { toast } from 'react-hot-toast';
import SOSModal from '../components/SOSModal';
import { FALLBACK_HARVEST } from '../services/gemini';

export default function Login() {
  const { loginAnonymously, loginWithGoogle, loginWithNaver, loading } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showSignupScreen, setShowSignupScreen] = useState(false);
  const [showAnonScreen, setShowAnonScreen] = useState(false);
  const [anonName, setAnonName] = useState('');
  const [anonBirth, setAnonBirth] = useState('');
  const [anonPhone, setAnonPhone] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [showRainModal, setShowRainModal] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);

  const month = new Date().getMonth() + 1;
  const currentRecs = FALLBACK_HARVEST[month]?.slice(0, 3) || [];

  const getCropEmoji = (name: string) => {
    if (name.includes('딸기')) return '🍓';
    if (name.includes('사과')) return '🍎';
    if (name.includes('매실')) return '🍏';
    if (name.includes('수박')) return '🍉';
    if (name.includes('감자')) return '🥔';
    if (name.includes('고구마')) return '🍠';
    if (name.includes('당근')) return '🥕';
    if (name.includes('양파')) return '🧅';
    if (name.includes('마늘')) return '🧄';
    if (name.includes('고추')) return '🌶️';
    if (name.includes('토마토')) return '🍅';
    if (name.includes('포도')) return '🍇';
    if (name.includes('복숭아')) return '🍑';
    if (name.includes('배')) return '🍐';
    if (name.includes('귤') || name.includes('한라봉')) return '🍊';
    return '🌱';
  };

  const playSafetySpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const playSiren = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = 'triangle';
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      const now = context.currentTime;
      // High-low siren effect
      for (let i = 0; i < 5; i++) {
        oscillator.frequency.setValueAtTime(600, now + i * 1);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + i * 1 + 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + (i + 1) * 1);
      }

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 5);

      oscillator.start();
      oscillator.stop(now + 5);
      
      toast.error("🚨 SOS 사이렌이 울립니다!", {
        duration: 5000,
        style: {
          background: '#ff0000',
          color: '#fff',
          fontWeight: 'black',
          fontSize: '24px',
          border: '4px solid black'
        }
      });
    } catch (e) {
      console.error(e);
      alert("SOS 사이렌 작동!");
    }
  };

  // Get next 5 days for forecast labels
  const getNextDays = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() + i);
      return days[date.getDay()];
    });
  };

  const nextDays = getNextDays();

  useEffect(() => {
    async function loadWeather() {
      const w: any = await getLocalWeather();
      setWeatherData(w);

      if (w && w.current_weather) {
        const code = w.current_weather.weathercode;
        const isRaining = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);
        if (isRaining) {
          const hasShownRainModal = sessionStorage.getItem('shown_rain_modal');
          if (!hasShownRainModal) {
            setShowRainModal(true);
            sessionStorage.setItem('shown_rain_modal', 'true');
            setTimeout(() => {
              playSafetySpeech("안전 유의 안내. 오늘은 비가 옵니다! 안전에 유의해 주세요!");
            }, 800);
          }
        }
      }
    }
    loadWeather();
  }, []);

  return (
    <div className="min-h-screen bg-[#C8E6C9] flex justify-center">
      <div className="flex flex-col p-6 space-y-6 w-full max-w-[430px] bg-[#C8E6C9] relative shadow-2xl min-h-screen">
        {/* Top Logo */}
        <div className="flex justify-start">
          <div className="w-12 h-12 bg-[#2E7D32] rounded-full border-4 border-black flex items-center justify-center shadow-sm">
            <Tractor size={24} className="text-white" />
          </div>
        </div>

      {/* Weather Card */}
      <section className="weather-header">
        <div className="flex justify-between items-start z-10 relative">
          <div className="space-y-1">
            <h2 className="text-3xl font-black">주간 날씨</h2>
            <p className="text-lg font-bold opacity-90">
              {weatherData?.current_weather ? parseWeatherCode(weatherData.current_weather.weathercode).label : '불러오는 중...'}
            </p>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="text-6xl font-black">
              {weatherData?.current_weather ? Math.round(weatherData.current_weather.temperature) : '--'}°
            </div>
            <div className="flex items-center gap-1 text-lg font-bold">
               <div className="flex flex-col items-center">
                  <div className="h-4 w-1 bg-white/40 rounded-full" />
                  <span className="text-xs">
                    {weatherData?.daily?.temperature_2m_max?.[0] ? Math.round(weatherData.daily.temperature_2m_max[0]) : '--'}° /
                  </span>
               </div>
               <div className="flex flex-col items-center">
                  <div className="h-8 w-1 bg-white rounded-full" />
                  <span className="text-xs">
                    {weatherData?.daily?.temperature_2m_min?.[0] ? Math.round(weatherData.daily.temperature_2m_min[0]) : '--'}°
                  </span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-10 z-10 relative">
          {nextDays.map((day, ix) => {
            const code = weatherData?.daily?.weathercode?.[ix];
            const parsed = typeof code === 'number' ? parseWeatherCode(code) : null;
            let Icon = Cloud;
            if (parsed?.icon === 'Sun') Icon = Sun;
            if (parsed?.icon === 'CloudSun') Icon = CloudSun;
            if (parsed?.icon === 'CloudFog') Icon = CloudFog;
            if (parsed?.icon === 'CloudRain') Icon = CloudRain;
            if (parsed?.icon === 'Snowflake') Icon = Snowflake;
            if (parsed?.icon === 'CloudLightning') Icon = CloudLightning;
            
            const maxTemp = weatherData?.daily?.temperature_2m_max?.[ix] ? Math.round(weatherData.daily.temperature_2m_max[ix]) : '--';
            
            return (
              <WeatherDay 
                key={ix}
                day={day} 
                temp={maxTemp + '°'} 
                icon={<Icon size={32} />} 
              />
            )
          })}
        </div>
      </section>

      {/* Notice Section */}
      <div className="bg-[#FFF9C4] border-4 border-black rounded-[32px] p-5 shadow-[4px_4px_0_0_#000] flex items-center gap-4">
        <div className="bg-[#FBC02D] p-2.5 rounded-full border-2 border-black shrink-0">
           <AlertTriangle size={28} className="text-black" strokeWidth={3} />
        </div>
        <div className="text-left">
          <h3 className="text-xl font-black text-gray-800 mb-0.5">📢 알림 (공지사항)</h3>
          <p className="text-lg font-bold text-gray-700 leading-relaxed">
            <span className="text-[#E64A19] font-black">SOS 버튼</span>은 위험할 때 큰 소리가 납니다.
          </p>
        </div>
      </div>

      {/* Login Options */}
      <div className="space-y-4">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="btn-figma-white"
        >
          <LogIn size={36} />
          <span>로그인하기</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAnonScreen(true)}
          className="btn-figma-white"
          disabled={loading}
        >
          <UserRound size={36} />
          <span>익명로그인</span>
        </motion.button>
      </div>

      {/* AI Button */}
      <button 
        onClick={() => setShowModal(true)}
        className="btn-figma-ai h-28 !rounded-[32px]"
      >
        <div className="bg-white/20 p-2 rounded-2xl">
          <Bot size={40} />
        </div>
        <span className="text-left py-2 font-black leading-tight text-2xl">
          AI 척척박사에게<br />물어 보기
        </span>
      </button>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4 pb-4">
        <MenuCard 
          icon={<Tractor size={40} className="text-black" />} 
          label={<><span className="whitespace-nowrap">여행 및 휴식</span><br />일정</>} 
          onClick={() => setShowModal(true)}
        />
        <MenuCard 
          icon={<Users size={40} className="text-black" />} 
          label={<><span className="whitespace-nowrap">우리밭 식구들</span></>} 
          onClick={() => setShowModal(true)}
        />
        <motion.button
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0px 0px 25px 5px rgba(255, 152, 0, 0.6)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsSOSModalOpen(true)}
          className="bg-white flex flex-col items-center justify-center p-4 text-center h-40 space-y-2 border-4 border-black rounded-[28px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all duration-300 w-full active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-[#FFFDE7]"
        >
          <div className="flex flex-col items-center text-[#FF9800] mb-1">
            <div className="flex justify-center -mb-2 scale-110">
              <div className="w-1.5 h-3 bg-[#FFB74D] opacity-30 rounded-full mx-0.5" />
              <div className="w-1.5 h-5 bg-[#FFB74D] rounded-full mx-0.5" />
              <div className="w-1.5 h-3 bg-[#FFB74D] opacity-30 rounded-full mx-0.5" />
            </div>
            <div className="mt-2 flex flex-col items-center">
              <div className="flex gap-1 mb-1">
                <div className="w-6 h-1 bg-[#FF9800] rounded-full" />
                <div className="w-6 h-1 bg-[#FF9800] rounded-full" />
                <div className="w-6 h-1 bg-[#FF9800] rounded-full" />
              </div>
              <MapPin size={40} fill="currentColor" strokeWidth={1} />
            </div>
          </div>
          <span className="text-2xl font-black text-[#FF9800] tracking-wider">SOS</span>
        </motion.button>
        <MenuCard 
          icon={<MessageCircleQuestion size={40} className="text-black" />} 
          label={<>농심(農心)<br />해결소</>} 
          onClick={() => setShowModal(true)}
        />
      </div>

      {/* Harvest Guide */}
      <section className="bg-white p-6 rounded-[40px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 text-center">
        <h3 className="text-3xl font-black text-gray-800 leading-tight">
          이달의 추천<br />수확 작물
        </h3>
        <div className="grid grid-cols-3 gap-3 pt-2">
          {currentRecs.map((rec: any, idx: number) => (
            <div key={idx} className="bg-[#E8F5E9] p-3 rounded-2xl border-2 border-black flex flex-col items-center gap-1 shadow-[2px_2px_0_0_#000]">
               <span className="text-3xl">{getCropEmoji(rec.name)}</span>
               <span className="text-lg font-black text-gray-800">{rec.name}</span>
            </div>
          ))}
        </div>
        <p className="text-lg font-bold text-gray-500 leading-relaxed pt-2">
          지금이 바로 수확하기 가장 좋은 시기예요!
        </p>
      </section>

      <div className="h-12" />

      {/* Modals and Other screens */}
      {/* Login Modal (Screen 02) - Resized for Smartphone */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-[#2D3F2D]/40 backdrop-blur-sm"
            />
            {/* Modal Container */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-[400px] rounded-[48px] border-4 border-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative"
            >
              {/* Modal Header */}
              <div className="p-5 flex items-center justify-between border-b-4 border-black bg-gray-50">
                 <button onClick={() => setShowModal(false)} className="text-black p-1 active:scale-90 transition-all">
                    <ArrowLeft size={28} strokeWidth={3} />
                 </button>
                 <h2 className="text-2xl font-black text-black">로그인</h2>
                 <button onClick={() => setShowModal(false)} className="text-black p-1 active:scale-90 transition-all">
                    <X size={28} strokeWidth={3} />
                 </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                 {/* Greeting */}
                 <div className="text-center space-y-1">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">반가워요!</h3>
                    <p className="text-base font-bold text-gray-400">우리밭 식구 계정으로 로그인</p>
                 </div>

                 {/* Form Fields */}
                 <div className="space-y-3">
                    <div className="space-y-1">
                       <label className="text-xs font-black text-gray-700 ml-2">아이디</label>
                       <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                             <Mail size={18} />
                          </div>
                          <input 
                            type="email" 
                            placeholder="이메일 주소"
                            className="w-full bg-[#F3F3F3] border-4 border-black rounded-[20px] py-3 pl-12 pr-4 text-base font-black focus:outline-none focus:bg-white transition-all text-gray-800 shadow-[3px_3px_0_0_#000]"
                          />
                       </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-xs font-black text-gray-700 ml-2">비밀번호</label>
                       <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                             <Lock size={18} />
                          </div>
                          <input 
                            type="password" 
                            placeholder="비밀번호"
                            className="w-full bg-[#F3F3F3] border-4 border-black rounded-[20px] py-3 pl-12 pr-12 text-base font-black focus:outline-none focus:bg-white transition-all text-gray-800 shadow-[3px_3px_0_0_#000]"
                          />
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                             <Eye size={18} />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Primary Action Button */}
                 <button 
                   onClick={() => toast.error("아이디/비밀번호 로그인은 준비 중입니다. 구글 로그인이나 익명로그인을 이용해 주세요!")}
                   className="w-full bg-[#4CAF50] text-white py-3 rounded-full border-4 border-black text-lg font-black shadow-[3px_3px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                 >
                    로그인
                 </button>

                 {/* Divider */}
                 <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                       <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs font-bold">
                       <span className="bg-white px-3 text-gray-400 text-sm">또는 계정 연동하기</span>
                    </div>
                 </div>

                 {/* Social Buttons */}
                 <div className="space-y-2">
                    <button 
                      onClick={() => { loginWithGoogle(); setShowModal(false); }}
                      className="w-full bg-white border-4 border-black py-3 rounded-full flex items-center justify-center gap-3 text-lg font-black text-gray-800 shadow-[3px_3px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                       <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                       구글 로그인
                    </button>
                    <button 
                      onClick={() => { 
                        loginAnonymously("네이버 임시접속"); 
                        setShowModal(false); 
                        setTimeout(() => toast.error("네이버 로그인은 준비 중입니다. 임시 계정으로 접속되었습니다.", { icon: '🚧' }), 500);
                      }}
                      className="w-full bg-[#03C75A] border-4 border-black py-3 rounded-full flex items-center justify-center gap-3 text-lg font-black text-white shadow-[3px_3px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                       <div className="w-5 h-5 bg-white flex items-center justify-center rounded-sm">
                         <span className="text-[#03C75A] text-[14px] font-black leading-none">N</span>
                       </div>
                       네이버 로그인
                    </button>
                    <button 
                      onClick={() => { setShowModal(false); setShowSignupScreen(true); }}
                      className="w-full bg-[#2E7D32] border-4 border-black py-3 rounded-full flex items-center justify-center gap-3 text-lg font-black text-white shadow-[3px_3px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                       <UserRound size={20} />
                       회원 가입
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Signup Screen - Focused Modal without scrolling */}
      <AnimatePresence>
        {showSignupScreen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignupScreen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#FCF8F8] w-full max-w-[390px] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col border-2 border-white/50"
            >
              {/* Header */}
              <div className="px-6 h-12 flex items-center border-b border-gray-100 bg-white shrink-0">
                <button 
                  onClick={() => setShowSignupScreen(false)} 
                  className="text-gray-800 p-1 active:scale-90 transition-all font-black"
                >
                  <ArrowLeft size={24} strokeWidth={2.5} />
                </button>
                <h2 className="text-xl font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">회원가입</h2>
              </div>
              
              <div className="flex-1 px-5 pt-3 space-y-2 pb-5">
                 {/* Compact Green Banner */}
                 <div className="bg-[#2E7D32] text-white py-2 rounded-[20px] text-lg font-bold text-center shadow-md">
                    회원가입
                 </div>
  
                 {/* Compact Form */}
                 <div className="space-y-1.5">
                    <div className="space-y-0">
                       <label className="text-sm font-bold text-gray-700 ml-2 text-xs">성명</label>
                       <div className="relative">
                          <input type="text" placeholder="예: 홍길동" className="w-full border-2 border-[#D1D9D1] bg-white rounded-full py-1.5 px-5 text-base font-bold focus:outline-none focus:border-[#2E7D32] text-gray-800" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"><UserCircle size={18} strokeWidth={2} /></div>
                       </div>
                    </div>
                    <div className="space-y-0">
                       <label className="text-sm font-bold text-gray-700 ml-2 text-xs">생년월일</label>
                       <div className="relative">
                          <input type="text" placeholder="예: 030303" className="w-full border-2 border-[#D1D9D1] bg-white rounded-full py-1.5 px-5 text-base font-bold focus:outline-none focus:border-[#2E7D32] text-gray-800" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"><Calendar size={18} strokeWidth={2} /></div>
                       </div>
                    </div>
                    <div className="space-y-0">
                       <label className="text-sm font-bold text-gray-700 ml-2 text-xs">전화번호</label>
                       <div className="relative">
                          <input type="text" placeholder="예: 01012345678" className="w-full border-2 border-[#D1D9D1] bg-white rounded-full py-1.5 px-5 text-base font-bold focus:outline-none focus:border-[#2E7D32] text-gray-800" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 opacity-60"><Phone size={16} strokeWidth={2} /></div>
                       </div>
                    </div>
                    <div className="space-y-0">
                       <label className="text-sm font-bold text-gray-700 ml-2 text-xs">닉네임</label>
                       <div className="relative">
                          <input type="text" className="w-full border-2 border-[#D1D9D1] bg-white rounded-full py-1.5 px-5 text-base font-bold focus:outline-none focus:border-[#2E7D32] text-gray-800" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"><Car size={18} strokeWidth={2} /></div>
                       </div>
                    </div>
                    <div className="space-y-0">
                       <label className="text-sm font-bold text-gray-700 ml-2 text-xs">아이디</label>
                       <div className="relative">
                          <input type="text" placeholder="아이디를 입력하세요" className="w-full border-2 border-[#D1D9D1] bg-white rounded-full py-1.5 px-5 text-base font-bold focus:outline-none focus:border-[#2E7D32] text-gray-800" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"><UserCircle size={18} strokeWidth={2} /></div>
                       </div>
                    </div>
                    <div className="space-y-0">
                       <label className="text-sm font-bold text-gray-700 ml-2 text-xs">비밀번호</label>
                       <div className="relative">
                          <input type="password" placeholder="비밀번호를 입력하세요" className="w-full border-2 border-[#D1D9D1] bg-white rounded-full py-1.5 px-5 text-base font-bold focus:outline-none focus:border-[#2E7D32] text-gray-800" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"><Lock size={18} strokeWidth={2} /></div>
                       </div>
                    </div>
                 </div>
  
                 {/* Signup Button */}
                 <div className="pt-1">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        toast.success("회원가입이 완료되었습니다!");
                        setShowSignupScreen(false);
                      }}
                      className="w-full bg-[#2E7D32] text-white py-3 rounded-full border-2 border-black/10 flex items-center justify-center gap-2 text-lg font-bold shadow-lg active:translate-y-1 transition-all"
                    >
                       <span>회원가입 완료</span>
                       <ChevronRight size={18} strokeWidth={3} />
                    </motion.button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Anonymous Login Modal - Large Popup for Elderly Users */}
      <AnimatePresence>
        {showAnonScreen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAnonScreen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-[#FCF8F8] w-full max-w-[400px] rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col border-4 border-white scroll-py-4"
            >
              {/* Modal Header */}
              <div className="px-6 h-14 flex items-center border-b-2 border-gray-100 bg-white shrink-0">
                <button 
                  onClick={() => setShowAnonScreen(false)} 
                  className="text-black p-1 active:scale-90 transition-all font-black"
                >
                  <ArrowLeft size={30} strokeWidth={3} />
                </button>
                <h2 className="text-xl font-black text-gray-800 absolute left-1/2 -translate-x-1/2">익명로그인</h2>
              </div>
              
              <div className="p-4 space-y-3">
                 {/* Green Title Banner */}
                 <div className="bg-[#2E7D32] text-white py-3 rounded-[24px] shadow-md flex items-center justify-center">
                    <h3 className="text-xl font-black tracking-tight">익명로그인</h3>
                 </div>
  
                 {/* Form Fields - More compact */}
                 <div className="space-y-2">
                    <div className="space-y-0.5">
                       <label className="text-sm font-bold text-gray-700 ml-4 italic">성명</label>
                       <div className="relative">
                          <input 
                            type="text" 
                            placeholder="예: 홍길동" 
                            value={anonName}
                            onChange={(e) => setAnonName(e.target.value)}
                            className="w-full border-4 border-[#D1D9D1] bg-white rounded-full py-2 px-5 text-base font-bold focus:outline-none focus:border-[#2E7D32] transition-colors text-gray-800 placeholder:text-gray-300"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                            <UserCircle size={20} strokeWidth={2} />
                          </div>
                       </div>
                    </div>
  
                    <div className="space-y-0.5">
                       <label className="text-sm font-bold text-gray-700 ml-4 italic">생년월일</label>
                       <div className="relative">
                          <input 
                            type="text" 
                            placeholder="예: 660102" 
                            value={anonBirth}
                            onChange={(e) => setAnonBirth(e.target.value)}
                            className="w-full border-4 border-[#D1D9D1] bg-white rounded-full py-2 px-5 text-base font-bold focus:outline-none focus:border-[#2E7D32] transition-colors text-gray-800 placeholder:text-gray-300"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                            <Calendar size={20} strokeWidth={2} />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-0.5">
                       <label className="text-sm font-bold text-gray-700 ml-4 italic">전화번호</label>
                       <div className="relative">
                          <input 
                            type="text" 
                            placeholder="예: 01012345678" 
                            value={anonPhone}
                            onChange={(e) => setAnonPhone(e.target.value)}
                            className="w-full border-4 border-[#D1D9D1] bg-white rounded-full py-2 px-5 text-base font-bold focus:outline-none focus:border-[#2E7D32] transition-colors text-gray-800 placeholder:text-gray-300"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                            <Phone size={20} strokeWidth={2} />
                          </div>
                       </div>
                    </div>
                 </div>
  
                 {/* Bottom Action Button */}
                 <div className="flex justify-end pt-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!anonName.trim()) {
                          toast.error("성명을 입력해 주세요!");
                          return;
                        }
                        loginAnonymously(anonName);
                        setShowAnonScreen(false);
                      }}
                      className="bg-[#2E7D32] text-white py-2.5 px-6 rounded-full flex items-center gap-2 text-xl font-black shadow-xl active:translate-y-1 active:shadow-none transition-all"
                    >
                       <span>익명로그인</span>
                       <ChevronRight size={28} strokeWidth={4} />
                    </motion.button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showRainModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowRainModal(false);
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white border-4 border-black rounded-[48px] p-8 w-full max-w-sm relative z-10 shadow-2xl flex flex-col items-center text-center space-y-6"
            >
              <button 
                onClick={() => {
                  setShowRainModal(false);
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                }}
                className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
                id="close-rain-modal"
              >
                <X size={32} strokeWidth={3} />
              </button>
              
              {/* Green Warning Circle */}
              <div className="w-24 h-24 bg-[#A3E4D7] rounded-full flex items-center justify-center border-4 border-black text-[#196F3D] shadow-md mt-4">
                <AlertTriangle size={56} strokeWidth={3} className="text-[#196F3D]" />
              </div>
              
              <div className="space-y-4 w-full">
                <h3 className="text-4xl font-black text-gray-800 tracking-tight">
                  안전 유의 안내
                </h3>
                <div className="space-y-3 pt-2">
                  <p className="text-3xl font-extrabold text-[#C62828] leading-tight">
                    오늘은 비가 옵니다!!
                  </p>
                  <p className="text-2xl font-black text-[#C29200]">
                    안전에 유의하세요!!
                  </p>
                  <p className="text-xl font-bold text-gray-600 leading-relaxed border-t-2 border-dashed border-gray-100 pt-4 px-1">
                    안전을 위해 오늘 야외 밭일은 편히 쉬시고, 논뚝 확인이나 수로 정비도 비가 갠 뒤에 안전하게 하시는 것이 좋습니다! ☔
                  </p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowRainModal(false);
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                }}
                className="w-full bg-[#7DCEA0] hover:bg-[#52BE80] text-[#1E8449] py-5 rounded-[24px] border-4 border-black text-2xl font-black shadow-[0_6px_0_0_#1E8449] active:translate-y-1 active:shadow-none transition-all"
                id="confirm-rain-modal"
              >
                확인
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SOSModal 
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        onSiren={playSiren}
        isSirenActive={false}
        onStopSiren={() => {}}
      />
      </div>
    </div>
  );
}

function WeatherDay({ day, temp, icon }: { day: string; temp: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-lg font-bold">{day}</span>
      <div className="text-white">
        {icon}
      </div>
      <span className="text-sm font-black">{temp}</span>
    </div>
  );
}

function MenuCard({ icon, label, className, onClick }: { icon: React.ReactNode; label?: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white flex flex-col items-center justify-center p-4 text-center h-40 space-y-3 w-full rounded-[28px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${className}`}
    >
      <div className="flex-1 flex items-center justify-center">
        {icon}
      </div>
      {label && <span className="text-xl font-black text-gray-800 leading-tight">{label}</span>}
    </motion.button>
  );
}
