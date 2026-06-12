import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
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
  LogOut,
  Plane,
  ChevronRight,
  Home,
  Bot as AI_Icon,
  BookOpen,
  Sparkles,
  CalendarDays,
  BookText,
  AlertTriangle,
  Award,
  Store
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHarvestRecommendation } from '../services/gemini';
import { auth } from '../services/firebase';
import { getTodayOngoingSchedule } from '../services/db';
import { getLocalWeather, parseWeatherCode } from '../services/weather';
import { toast } from 'react-hot-toast';
import SOSModal from '../components/SOSModal';
import { AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [harvestInfo, setHarvestInfo] = useState<any[]>([]);
  const [onBreak, setOnBreak] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<any>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const sirenRef = React.useRef<{ context: AudioContext, oscillator: OscillatorNode, interval: any } | null>(null);

  const month = new Date().getMonth() + 1;

  const playSafetySpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerRainModal = () => {
    playSafetySpeech("안전 유의 안내. 오늘은 비가 옵니다! 안전에 유의해 주세요!");
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
    let logoutListener: () => void;

    async function load() {
      const schedule = await getTodayOngoingSchedule(user?.uid);
      if (schedule) {
        setOnBreak(true);
        setActiveSchedule(schedule);
        setShowWelcomeModal(true);
      } else {
        setOnBreak(false);
      }
      
      const recs = await getHarvestRecommendation(month);
      setHarvestInfo(recs.slice(0, 3));

      const w: any = await getLocalWeather();
      setWeatherData(w);
    }

    load();
  }, [month]);

  const handleLogoutClick = () => {
    auth.signOut();
  };

  const playSiren = () => {
    if (isSirenActive) return;
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
      
      const startSirenLoop = () => {
        const t = context.currentTime;
        oscillator.frequency.cancelScheduledValues(t);
        oscillator.frequency.setValueAtTime(600, t);
        oscillator.frequency.exponentialRampToValueAtTime(1200, t + 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(600, t + 1);
      };

      startSirenLoop();
      const interval = setInterval(startSirenLoop, 1000);

      gainNode.gain.setValueAtTime(0.3, now);
      oscillator.start();
      
      sirenRef.current = { context, oscillator, interval };
      setIsSirenActive(true);
      
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

  const stopSiren = () => {
    if (sirenRef.current) {
      const { oscillator, context, interval } = sirenRef.current;
      clearInterval(interval);
      try {
        oscillator.stop();
        context.close();
      } catch (e) {
        console.error("Error stopping siren:", e);
      }
      sirenRef.current = null;
      setIsSirenActive(false);
      toast.success("사이렌을 껐습니다.", {
        style: {
          border: '4px solid black',
          fontWeight: 'bold'
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#C8E6C9] flex justify-center">
      <div className="bg-[#C8E6C9] w-full max-w-[430px] shadow-2xl min-h-screen relative overflow-y-auto animate-in fade-in duration-500 pb-10">
        {/* Top Bar with Logo and Logout */}
        <div className="px-6 pt-6 mb-4 flex justify-between items-center">
          <div className="w-12 h-12 bg-[#2E7D32] rounded-full border-4 border-black flex items-center justify-center shadow-sm">
            <Tractor size={24} className="text-white" />
          </div>
          {profile && (
            <button 
              onClick={handleLogoutClick}
              className="flex items-center gap-2 text-2xl font-bold text-gray-800"
            >
              로그아웃 <LogOut size={28} strokeWidth={3} />
            </button>
          )}
        </div>

      {/* Welcome Break Modal */}
      <AnimatePresence>
        {showWelcomeModal && activeSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWelcomeModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black rounded-[48px] p-10 w-full max-w-sm relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
                id="close-welcome-modal"
              >
                <X size={32} strokeWidth={3} />
              </button>
              
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                  {activeSchedule.type === 'travel' ? <Plane size={48} strokeWidth={2.5} /> : <Sun size={48} strokeWidth={2.5} />}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-gray-800 leading-tight">
                    오늘은<br />
                    <span className="text-brand-primary">"{activeSchedule.title}"</span><br />
                    이세요!
                  </h3>
                  <p className="text-2xl font-bold text-gray-600 leading-relaxed">
                    오늘만큼은 농사 걱정일랑 푹 놓으시고<br />
                    편안한 {activeSchedule.type === 'travel' ? '여행' : '휴식'} 되세요! 🌴
                  </p>
                </div>

                <button 
                  onClick={() => setShowWelcomeModal(false)}
                  className="w-full bg-brand-primary text-white py-5 rounded-[24px] border-4 border-black text-2xl font-black shadow-[0_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all"
                  id="confirm-welcome-modal"
                >
                  네, 알겠습니다!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Weather Header */}
      <div className="px-5 mb-8">
        <section className="weather-header">
          <div className="flex justify-between items-start z-10 relative mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-5xl font-bold tracking-tight">주간 날씨</h2>
              </div>
              <p className="text-2xl font-bold opacity-90">
                {weatherData?.current_weather ? parseWeatherCode(weatherData.current_weather.weathercode).label : '불러오는 중...'}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-7xl font-bold">
                {weatherData?.current_weather ? Math.round(weatherData.current_weather.temperature) : '--'}°
              </div>
              <div className="flex items-center gap-2 mt-2 leading-none">
                 <div className="flex flex-col items-center">
                    <div className="h-4 w-1 bg-white opacity-40 rounded-full" />
                    <div className="h-4 w-1 bg-white opacity-40 rounded-full mt-0.5" />
                 </div>
                 <span className="text-3xl font-bold">
                   {weatherData?.daily?.temperature_2m_max?.[0] ? Math.round(weatherData.daily.temperature_2m_max[0]) : '--'}° /
                 </span>
                 <div className="flex flex-col items-center">
                    <div className="h-10 w-1 bg-white rounded-full" />
                 </div>
                 <span className="text-3xl font-bold">
                   {weatherData?.daily?.temperature_2m_min?.[0] ? Math.round(weatherData.daily.temperature_2m_min[0]) : '--'}°
                 </span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-6 flex justify-between z-10 relative text-center">
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
                  icon={<Icon size={36} fill="white" />} 
                  active={ix === 0} 
                />
              )
            })}
          </div>
        </section>
      </div>

      {/* Notice Section */}
      <div className="px-5 mb-8">
        <div className="bg-[#FFF9C4] border-4 border-black rounded-[32px] p-6 shadow-[4px_4px_0_0_#000] flex items-center gap-4 animate-in slide-in-from-bottom duration-700">
          <div className="bg-[#FBC02D] p-3 rounded-full border-2 border-black shrink-0">
             <AlertTriangle size={32} className="text-black" strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 mb-1">📢 알림 (공지사항)</h3>
            <p className="text-xl font-bold text-gray-700 leading-relaxed">
              <span className="text-[#E64A19] font-black">SOS 버튼</span>은 위험할 때 큰 소리를 내고, <span className="text-brand-primary font-black">스피커 버튼</span>은 누르면 화면 사용법을 말로 친절하게 설명해 드려요!
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* AI Action Button (Match Green Style) */}
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/ai-expert')}
          className="btn-figma-ai h-28 !rounded-[24px]"
        >
          <Bot size={40} />
          <span className="text-3xl font-bold leading-tight">
            AI 척척박사에게<br />물어 보기
          </span>
        </motion.button>

        {/* Action Grid (Match Icon Colors) */}
        <div className="grid grid-cols-2 gap-4">
          <MenuCard 
            icon={<Tractor size={48} className="text-black" />} 
            label={<><span className="whitespace-nowrap">여행 및 휴식</span><br />일정</>} 
            className="h-48"
            onClick={() => navigate('/schedule')}
          />
          <MenuCard 
            icon={<Users size={48} className="text-black" />} 
            label={<><span className="whitespace-nowrap">우리 식구</span></>} 
            className="h-48"
            onClick={() => navigate('/logs')}
          />
          
          {/* SOS Card (Exact Match) */}
          <motion.button
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0px 0px 25px 10px rgba(255, 152, 0, 0.5)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setIsSOSModalOpen(true);
              playSiren();
            }}
            className="bg-white flex flex-col items-center justify-center h-48 space-y-2 border-4 border-black rounded-[32px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all duration-300 w-full active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-[#FFFDE7]"
          >
             <div className="flex flex-col items-center text-[#FF9800] mb-1">
                <div className="flex justify-center -mb-2 scale-110">
                   <div className="w-2 h-4 bg-[#FFB74D] opacity-30 rounded-full mx-0.5" />
                   <div className="w-2 h-6 bg-[#FFB74D] rounded-full mx-0.5" />
                   <div className="w-2 h-4 bg-[#FFB74D] opacity-30 rounded-full mx-0.5" />
                </div>
                <div className="mt-4 flex flex-col items-center">
                   <div className="flex gap-1 mb-1">
                      <div className="w-8 h-1.5 bg-[#FF9800] rounded-full" />
                      <div className="w-8 h-1.5 bg-[#FF9800] rounded-full" />
                      <div className="w-8 h-1.5 bg-[#FF9800] rounded-full" />
                   </div>
                   <MapPin size={50} fill="currentColor" strokeWidth={1} />
                </div>
             </div>
             <span className="text-3xl font-black text-[#FF9800] tracking-wider">SOS</span>
          </motion.button>

          <MenuCard 
            icon={<MessageCircleQuestion size={48} className="text-black" />} 
            label={<>농심(農心)<br />해결소</>} 
            className="h-48"
            onClick={() => navigate('/complaint')}
          />
          <MenuCard 
            icon={<Award size={48} className="text-black" />} 
            label={<>든든 자랑</>} 
            className="h-48"
            onClick={() => navigate('/boast')}
          />
          <MenuCard 
            icon={<Store size={48} className="text-black" />} 
            label={<>든든 미식광장</>} 
            className="h-48"
            onClick={() => navigate('/gourmet')}
          />
        </div>

        {/* Harvest Summary Card */}
        <section className="bg-white p-5 rounded-[40px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-8 min-h-[350px]">
          {onBreak ? (
            <div className="flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
               <div className="w-32 h-32 bg-[#E1F5FE] rounded-full flex items-center justify-center text-[#0288D1]">
                  <Plane size={64} strokeWidth={2.5} />
               </div>
               <div className="text-center space-y-4">
                  <h3 className="text-5xl font-black text-[#0288D1] leading-tight">
                    편안한 휴식 시간!
                  </h3>
                  <p className="text-3xl font-bold text-gray-600 leading-relaxed">
                    AI 척척박사가 농사 걱정을<br />잠시 멈추고 기다릴게요.<br />푹 쉬고 오세요! 🌴
                  </p>
               </div>
            </div>
          ) : (
            <>
              <h3 className="text-4xl font-black text-gray-800 text-center leading-tight">
                이번 달 추천<br />수확 작물
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                {harvestInfo.length > 0 ? (
                  harvestInfo.slice(0, 3).map((item, idx) => {
                    const colors = ['bg-[#E8F5E9]', 'bg-[#FFF3E0]', 'bg-[#F1F8E9]'];
                    return (
                      <div key={idx} className={`${colors[idx % colors.length]} p-3 rounded-2xl border-4 border-black flex flex-col items-center justify-center gap-2 shadow-[3px_3px_0_0_#000] min-h-[110px]`}>
                         <span className="text-5xl leading-none flex items-center justify-center h-12 w-12">{getCropEmoji(item.name)}</span>
                         <span className="text-xl font-black text-gray-800 text-center truncate w-full px-1">{item.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="bg-[#E8F5E9] p-3 rounded-2xl border-4 border-black flex flex-col items-center justify-center gap-2 shadow-[3px_3px_0_0_#000] min-h-[110px]">
                       <span className="text-5xl leading-none h-12 w-12 flex items-center justify-center">🧄</span>
                       <span className="text-xl font-black text-gray-800">마늘</span>
                    </div>
                    <div className="bg-[#FFF3E0] p-3 rounded-2xl border-4 border-black flex flex-col items-center justify-center gap-2 shadow-[3px_3px_0_0_#000] min-h-[110px]">
                       <span className="text-5xl leading-none h-12 w-12 flex items-center justify-center">🧅</span>
                       <span className="text-xl font-black text-gray-800">양파</span>
                    </div>
                    <div className="bg-[#F1F8E9] p-3 rounded-2xl border-4 border-black flex flex-col items-center justify-center gap-2 shadow-[3px_3px_0_0_#000] min-h-[110px]">
                       <span className="text-5xl leading-none h-12 w-12 flex items-center justify-center">🍏</span>
                       <span className="text-xl font-black text-gray-800">매실</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-500 leading-relaxed text-center pt-2">
                지금이 바로 수확하기<br />가장 좋은 시기예요!
              </p>
            </>
          )}
        </section>
      </div>

      <SOSModal 
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        onSiren={playSiren}
        isSirenActive={isSirenActive}
        onStopSiren={stopSiren}
      />
      </div>
    </div>
  );
}

function WeatherDay({ day, temp, icon, active }: { day: string; temp: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all ${active ? 'bg-white/20 text-white' : 'text-white/80'}`}>
      <span className={`text-xl font-bold ${active ? 'text-white' : ''}`}>{day}</span>
      <div className={active ? 'text-white scale-110' : 'text-white/70'}>
        {icon}
      </div>
      <span className={`text-lg font-black ${active ? 'text-white underline decoration-2 underline-offset-4' : ''}`}>{temp}</span>
    </div>
  );
}

function MenuCard({ icon, label, onClick, className }: { icon: React.ReactNode; label?: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white p-6 text-center h-48 space-y-4 rounded-[32px] w-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${className}`}
    >
      <div className="flex-1 flex items-center justify-center">
        {icon}
      </div>
      {label && <span className="text-2xl font-black text-gray-800 leading-tight">{label}</span>}
    </motion.button>
  );
}

function getCropEmoji(name: string) {
  if (name.includes('딸기')) return '🍓';
  if (name.includes('사과')) return '🍎';
  if (name.includes('매실') || name.includes('청매실')) return '🍏';
  if (name.includes('수박')) return '🍉';
  if (name.includes('감자')) return '🥔';
  if (name.includes('고구마')) return '🍠';
  if (name.includes('당근')) return '🥕';
  if (name.includes('양파')) return '🧅';
  if (name.includes('마늘')) return '🧄';
  if (name.includes('고추')) return '🌶️';
  if (name.includes('토마토')) return '🍅';
  if (name.includes('포도') || name.includes('샤인머스켓')) return '🍇';
  if (name.includes('복숭아')) return '🍑';
  if (name.includes('옥수수')) return '🌽';
  if (name.includes('배추')) return '🥬';
  if (name.includes('무')) return '🥗'; // Improved from rice bowl
  if (name.includes('호박')) return '🎃';
  if (name.includes('콩') || name.includes('완두콩')) return '🌿'; // Using safe herb/seedling emoji
  if (name.includes('오이')) return '🥒';
  if (name.includes('가지')) return '🍆';
  if (name.includes('밤')) return '🌰';
  if (name.includes('땅콩')) return '🥜';
  if (name.includes('배')) return '🍐';
  if (name.includes('참외') || name.includes('메론')) return '🍈';
  if (name.includes('버섯')) return '🍄';
  if (name.includes('시금치') || name.includes('취나물') || name.includes('쑥') || name.includes('봄동')) return '🌿';
  if (name.includes('달래') || name.includes('냉이') || name.includes('두릅')) return '🪴';
  if (name.includes('죽순')) return '🎋';
  if (name.includes('보리') || name.includes('밀')) return '🌾';
  if (name.includes('유자') || name.includes('귤') || name.includes('한라봉')) return '🍊';
  if (name.includes('더덕') || name.includes('우엉') || name.includes('연근')) return '🪵';
  return '🌱';
}
