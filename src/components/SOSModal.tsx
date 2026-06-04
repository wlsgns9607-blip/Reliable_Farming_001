import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiren: () => void;
  isSirenActive?: boolean;
  onStopSiren?: () => void;
}

export default function SOSModal({ 
  isOpen, 
  onClose, 
  onSiren, 
  isSirenActive, 
  onStopSiren,
}: SOSModalProps) {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white w-full max-w-[430px] rounded-t-[48px] border-t-8 border-x-8 border-black shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col p-8 pb-12 relative z-10"
          >
            {/* Handle Bar */}
            <div className="w-16 h-2 bg-gray-200 rounded-full mx-auto mb-8" />
            
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 border-4 border-black">
                <AlertCircle size={56} strokeWidth={3} />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-gray-900 leading-tight">
                  긴급 도움 요청
                </h2>
                <p className="text-2xl font-bold text-gray-500">
                  도움이 필요한 곳에<br />바로 연락하실 수 있어요.
                </p>
              </div>

              <div className="w-full space-y-4">
                {/* Siren Button */}
                <button 
                  onClick={() => {
                    if (isSirenActive && onStopSiren) {
                      onStopSiren();
                    } else {
                      onSiren();
                    }
                  }}
                  className={`w-full ${isSirenActive ? 'bg-gray-100 text-black' : 'bg-[#FF9800] text-white'} py-6 rounded-[28px] border-4 border-black text-2xl font-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4`}
                >
                  {isSirenActive ? '❌ 경고음 끄기' : '📣 큰 경고음 울리기'}
                </button>

                {/* Call Child */}
                <button 
                  onClick={() => handleCall('010-0000-0000')}
                  className="w-full bg-white text-black py-6 rounded-[28px] border-4 border-black text-2xl font-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4"
                >
                  <div className="bg-gray-100 p-2 rounded-full border-2 border-black">
                    <Phone size={32} />
                  </div>
                  자녀에게 전화하기
                </button>

                {/* Call 119 */}
                <button 
                  onClick={() => toast.success('119 긴급 연락 기능은 실제 배포 시 활성화됩니다.', {
                    icon: '🚑',
                    style: {
                      border: '4px solid black',
                      padding: '16px',
                      color: '#000',
                      fontWeight: 'bold',
                      fontSize: '20px',
                      borderRadius: '24px'
                    },
                  })}
                  className="w-full bg-[#C62828] text-white py-6 rounded-[28px] border-4 border-black text-2xl font-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4"
                >
                  <div className="bg-white/20 p-2 rounded-full border-2 border-white/40">
                    <Phone size={32} fill="white" />
                  </div>
                  119 안전센터 전화
                </button>
              </div>

              <button 
                onClick={onClose}
                className="text-2xl font-black text-gray-400 hover:text-black transition-colors pt-4"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
