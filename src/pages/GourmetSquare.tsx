import React from 'react';
import { motion } from 'motion/react';

const products = [
  {
    id: 1,
    title: '[자두 - 흑진주]',
    desc: '7월의 태양과 비가 키워낸 흑진주! 달콤함은 한여름 땡볕에 더욱 가장 맛있을 때 수확합니다. 자두의 여왕 흑진주를 만나보세요.',
    img: '/images/gourmet/Plums.png',
    badge: '신안군 천일염'
  },
  {
    id: 2,
    title: '[샤인머스켓]',
    desc: '7월의 눈부신 햇살을 머금고 자란 프리미엄 샤인머스켓! 톡 터지는 과즙과 망고 향이 일품입니다.',
    img: '/images/gourmet/Shine_Muscat.png',
    badge: '가야산 샤인'
  },
  {
    id: 3,
    title: '[찰토마토]',
    desc: '7월의 햇살처럼 싱그러운 찰토마토입니다. 단단하고 맛이 진해서 샐러드나 생과로 즐기기 좋습니다.',
    img: '/images/gourmet/Tomatoes.png',
    badge: '논산 토마토'
  },
  {
    id: 4,
    title: '[초당옥수수]',
    desc: '7월 무더위에 수확되는 톡 터지는 달콤한 초당옥수수! 생으로 먹어도 아삭하고 달콤합니다.',
    img: '/images/gourmet/Corn.png',
    badge: '제주 초당'
  }
];

export default function GourmetSquare() {
  return (
    <div className="bg-[#D1E8D1] min-h-screen font-sans flex flex-col pb-6 px-5 pt-6 relative">
      <div className="text-center space-y-2 mb-8 mt-2">
        <h2 className="text-[17px] font-black text-[#1E8449]">대한민국의 제철 맛을 잇다</h2>
        <p className="text-[13px] font-bold text-[#1E8449]/80 leading-relaxed max-w-[300px] mx-auto break-keep">
          전국 팔도로 직접 찾아가 엄선한 팜마켓의<br/>식재료들을 가장 신선할 때 만나보세요.
        </p>
      </div>

      <div className="bg-white/80 rounded-[32px] p-6 mb-10 shadow-sm border-2 border-white">
        <div className="flex justify-center gap-4 mb-4">
          <div className="bg-white rounded-2xl w-[90px] py-3 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
            <span className="font-bold text-gray-800 text-[13px] mb-1">경기<br/>강원</span>
            <span className="text-xl">🍠🌽</span>
          </div>
          <div className="bg-white rounded-2xl w-[90px] py-3 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
            <span className="font-bold text-gray-800 text-[13px] mb-1">충청<br/>북도</span>
            <span className="text-xl">🌰🍎</span>
          </div>
        </div>
        
        <div className="flex justify-center gap-3 mb-4">
          <div className="bg-white rounded-2xl w-[80px] py-2 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
            <span className="font-bold text-gray-800 text-xs mb-1">충청<br/>남도</span>
            <span className="text-lg">🍅</span>
          </div>
          <div className="bg-white rounded-2xl w-[80px] py-2 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
            <span className="font-bold text-gray-800 text-xs mb-1">경상<br/>북도</span>
            <span className="text-lg">🍎🍇</span>
          </div>
          <div className="bg-white rounded-2xl w-[80px] py-2 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
            <span className="font-bold text-gray-800 text-xs mb-1">경상<br/>남도</span>
            <span className="text-lg">🍑🍅</span>
          </div>
        </div>
        
        <div className="flex justify-center gap-3 mb-4">
          <div className="bg-white rounded-2xl w-[80px] py-2 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
            <span className="font-bold text-gray-800 text-xs mb-1">전라<br/>북도</span>
            <span className="text-lg">🍉🥕</span>
          </div>
          <div className="bg-white rounded-2xl w-[80px] py-2 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
            <span className="font-bold text-gray-800 text-xs mb-1">전라<br/>남도</span>
            <span className="text-lg">🥬🧅</span>
          </div>
          <div className="bg-white rounded-2xl w-[80px] py-2 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
            <span className="font-bold text-gray-800 text-xs mb-1">광주<br/>광역시</span>
            <span className="text-lg">🍑</span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <div className="bg-white rounded-2xl w-[100px] py-2 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
            <span className="font-bold text-gray-800 text-xs mb-1">제주<br/>도</span>
            <span className="text-lg">🍊🥕</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-4 px-2">
        <div>
          <h3 className="text-[17px] font-black text-[#1E8449]">제철의 수확</h3>
          <p className="text-[12px] font-bold text-[#1E8449]/80 mt-1">🌿 당일 농장 직배송 (무료)</p>
        </div>
        <button className="text-[13px] font-black text-[#1E8449]">더보기 +</button>
      </div>

      <div className="space-y-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-[32px] overflow-hidden shadow-md border-2 border-white">
            <div className="relative h-[280px] bg-gray-200">
              <img src={product.img} alt={product.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-black text-gray-800 shadow-sm">
                {product.badge}
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-[19px] font-black text-gray-900 mb-2.5">{product.title}</h4>
              <p className="text-[14px] font-bold text-gray-500 leading-relaxed break-keep">
                {product.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
