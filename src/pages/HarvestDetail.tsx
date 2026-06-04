import React, { useEffect, useState } from 'react';
import { getHarvestRecommendation } from '../services/gemini';
import { motion } from 'motion/react';
import { Leaf, Info, MessageCircle, ArrowRight } from 'lucide-react';

export default function HarvestGuidePage() {
  const [recs, setRecs] = useState<any[]>([]);
  const month = new Date().getMonth() + 1;

  useEffect(() => {
    async function load() {
      const data = await getHarvestRecommendation(month);
      setRecs(data);
    }
    load();
  }, [month]);

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-brand-primary text-white p-8 rounded-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <ShoppingBasket size={120} />
        </div>
        <h2 className="text-3xl font-black mb-2">{month}월 수확 도우미</h2>
        <p className="text-xl font-medium opacity-90">가장 맛있는 작물들을 추천해드려요</p>
      </div>

      <div className="space-y-6">
        {recs.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card-large space-y-6"
          >
             <div className="flex items-center gap-4 border-b border-brand-primary/10 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-bg flex items-center justify-center text-3xl">
                   {getEmoji(item.name)}
                </div>
                <h3 className="text-3xl font-black text-brand-primary">{item.name}</h3>
             </div>

             <div className="space-y-4">
                <div className="flex gap-4">
                   <div className="p-3 bg-orange-50 rounded-2xl text-brand-accent">
                      <Info size={32} />
                   </div>
                   <div className="space-y-1">
                      <span className="block text-sm font-bold text-orange-400 uppercase">수확 꿀팁</span>
                      <p className="text-xl font-bold text-gray-800">{item.tip}</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="p-3 bg-green-50 rounded-2xl text-brand-secondary">
                      <Leaf size={32} />
                   </div>
                   <div className="space-y-1">
                      <span className="block text-sm font-bold text-brand-secondary uppercase">건강 효능</span>
                      <p className="text-xl font-bold text-gray-800">{item.benefit}</p>
                   </div>
                </div>
             </div>

             <button className="w-full bg-white border-2 border-brand-primary p-4 rounded-2xl text-brand-primary font-black text-xl flex items-center justify-center gap-3">
                <MessageCircle size={24} />
                농업기술센터에 문의하기
                <ArrowRight size={24} />
             </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function getEmoji(name: string) {
  if (name.includes('배추')) return '🥬';
  if (name.includes('무')) return '🥕';
  if (name.includes('고기')) return '🥩';
  if (name.includes('사과')) return '🍎';
  if (name.includes('포도')) return '🍇';
  if (name.includes('쌀')) return '🌾';
  if (name.includes('감자')) return '🥔';
  return '🌱';
}

function ShoppingBasket({ className, size }: { className?: string, size?: number }) {
    return <Leaf className={className} size={size} />;
}
