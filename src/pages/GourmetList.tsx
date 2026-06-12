import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

const categories = [
  {
    icon: '🍄',
    title: '자연의 맛, 버섯류',
    items: [
      { name: '표고 버섯', region: '경북 문경', badge: 'bg-red-100 text-red-600', desc: '참나무에서 자라난 깊은 향과 쫄깃한 식감의 표고버섯입니다. 국물이나 볶음 요리에 훌륭한 풍미를 더해줍니다.' },
      { name: '새송이 버섯', region: '충남 부여', badge: 'bg-red-100 text-red-600', desc: '탱글탱글한 식감이 일품인 새송이버섯입니다. 고기와 함께 구워드시면 고소한 육즙과 어우러져 더욱 맛있습니다.' },
      { name: '느타리 버섯', region: '경기 광주', badge: 'bg-orange-100 text-orange-600', desc: '국물 요리에 빠질 수 없는 부드러운 느타리버섯입니다. 찌개나 전, 무침으로 활용하기 좋습니다.' },
      { name: '양송이 버섯', region: '충남 보령', badge: 'bg-red-100 text-red-600', desc: '고기와 함께 구워 먹으면 진가를 발휘하는 양송이버섯입니다. 동그란 갓 안에 고이는 진한 버섯 즙을 느껴보세요.' },
      { name: '팽이 버섯', region: '경북 청도', badge: 'bg-red-100 text-red-600', desc: '아삭아삭한 식감으로 입맛을 돋우는 팽이버섯입니다. 전골, 볶음, 샐러드 등 다양한 요리에 어울립니다.' },
    ]
  },
  {
    icon: '🥬',
    title: '신선한 채소류',
    items: [
      { name: '배추', region: '강원 평창', badge: 'bg-orange-100 text-orange-600', desc: '고랭지에서 자라 속이 꽉 차고 단맛이 강한 배추입니다. 아삭한 식감이 살아있어 김치나 겉절이로 최고입니다.' },
      { name: '시금치', region: '경북 포항', badge: 'bg-orange-100 text-orange-600', desc: '겨울 바닷바람을 맞고 자라 단맛이 꽉 찬 포항초입니다. 살짝 데쳐 무쳐드시면 제철의 참맛을 느낄 수 있습니다.' },
      { name: '깻잎', region: '충남 금산', badge: 'bg-orange-100 text-orange-600', desc: '향긋한 내음이 입맛을 돋우는 신선한 깻잎입니다. 쌈 채소는 물론 장아찌, 무침 등으로 다양하게 즐겨보세요.' },
      { name: '애호박', region: '경남 진주', badge: 'bg-orange-100 text-orange-600', desc: '부드러운 식감과 은은한 단맛이 특징인 애호박입니다. 찌개, 전, 볶음 등 우리 밥상에 빠질 수 없는 식재료입니다.' },
      { name: '파프리카', region: '강원 철원', badge: 'bg-orange-100 text-orange-600', desc: '아삭한 식감과 상큼한 단맛을 자랑하는 파프리카입니다. 샐러드나 생과로 드시면 풍부한 비타민을 섭취할 수 있습니다.' },
    ]
  },
  {
    icon: '🧅',
    title: '든든한 뿌리채소',
    items: [
      { name: '양파', region: '전남 무안', badge: 'bg-red-100 text-red-600', desc: '게르마늄이 풍부한 황토에서 자라 단단하고 저장성이 좋은 양파입니다. 볶을수록 깊은 단맛이 우러납니다.' },
      { name: '당근', region: '제주 구좌', badge: 'bg-red-100 text-red-600', desc: '제주 화산토의 영양을 듬뿍 받아 달콤하고 아삭한 구좌 당근입니다. 주스나 샐러드로 생으로 드시기 아주 좋습니다.' },
      { name: '고구마', region: '전남 해남', badge: 'bg-red-100 text-red-600', desc: '따뜻한 햇살과 해풍을 맞고 자란 꿀고구마입니다. 숙성할수록 당도가 높아져 구워 드시면 진한 달콤함을 선사합니다.' },
      { name: '마늘', region: '경북 의성', badge: 'bg-red-100 text-red-600', desc: '알이 단단하고 즙이 많아 특유의 알싸한 향이 일품인 육쪽마늘입니다. 요리의 풍미를 한층 끌어올려 줍니다.' },
      { name: '감자', region: '강원 평창', badge: 'bg-red-100 text-red-600', desc: '큰 일교차 속에서 자라 전분이 많고 포슬포슬한 분질 감자입니다. 쪄서 드시거나 다양한 요리에 활용해 보세요.' },
    ]
  },
  {
    icon: '🍎',
    title: '달콤한 제철과일',
    items: [
      { name: '사과', region: '경북 청송', badge: 'bg-red-100 text-red-600', desc: '풍부한 일조량 덕분에 과육이 단단하고 과즙이 팡팡 터지는 청송 꿀사과입니다. 아침에 먹는 사과는 금사과입니다.' },
      { name: '배', region: '전남 나주', badge: 'bg-red-100 text-red-600', desc: '맑은 물과 기름진 흙에서 자라 시원하고 달콤한 과즙이 일품인 나주배입니다. 갈증 해소와 소화에 도움을 줍니다.' },
      { name: '복숭아', region: '충북 조치원', badge: 'bg-red-100 text-red-600', desc: '은은한 향과 함께 입안 가득 퍼지는 부드러운 달콤함을 가진 조치원 복숭아입니다. 여름철 잃어버린 입맛을 되찾아줍니다.' },
      { name: '포도', region: '경북 김천', badge: 'bg-red-100 text-red-600', desc: '당도가 높고 알맹이가 실한 김천 포도입니다. 탱글탱글한 과육이 피로 회복에 활력을 불어넣어 줍니다.' },
      { name: '귤', region: '제주 서귀포', badge: 'bg-red-100 text-red-600', desc: '제주 남쪽의 따뜻한 햇살을 받아 새콤달콤한 맛이 진한 서귀포 감귤입니다. 겨울철 비타민C 보충에 그만입니다.' },
    ]
  },
  {
    icon: '🌾',
    title: '구수한 곡물류',
    items: [
      { name: '쌀', region: '경기 이천', badge: 'bg-red-100 text-red-600', desc: '밥맛이 좋기로 유명한 임금님표 이천 쌀입니다. 찰기가 흐르고 윤기가 자르르 흘러 밥만 먹어도 맛있습니다.' },
      { name: '보리', region: '전북 고창', badge: 'bg-red-100 text-red-600', desc: '구수한 맛과 톡톡 터지는 식감이 매력적인 고창 찰보리입니다. 건강한 식단을 위한 훌륭한 선택입니다.' },
      { name: '현미', region: '전남 해남', badge: 'bg-red-100 text-red-600', desc: '영양분이 고스란히 살아있는 찰현미입니다. 씹을수록 고소하고 부드러워 건강한 밥상을 완성합니다.' },
      { name: '콩', region: '경북 안동', badge: 'bg-red-100 text-red-600', desc: '단백질이 풍부하고 고소한 맛이 진한 안동 생콩입니다. 두부, 콩물, 밥밑콩 등 다양하게 활용하기 좋습니다.' },
      { name: '참깨', region: '충북 제천', badge: 'bg-red-100 text-red-600', desc: '알이 굵고 고소한 향이 진동하는 제천 참깨입니다. 볶아서 요리에 솔솔 뿌리면 풍미가 배가됩니다.' },
    ]
  }
];

export default function GourmetList() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F6F9F6] min-h-screen font-sans flex flex-col pb-24 relative">
      {/* Header */}
      <header className="p-4 flex items-center gap-3 sticky top-0 bg-[#F6F9F6]/90 backdrop-blur-md z-40 border-b border-black/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#1E8449] active:scale-90 transition-all">
          <ChevronLeft size={32} strokeWidth={2.5} />
        </button>
        <h1 className="text-[19px] font-black text-[#2E4032]">미식광장 전체 리스트</h1>
      </header>

      <div className="px-5 pt-5 flex-1">
        
        {/* Intro Box */}
        <div className="bg-[#27743A] text-white rounded-[24px] p-6 mb-10 shadow-md">
          <h2 className="text-[18px] font-black mb-3">대한민국의 제철 식자재 전 품목</h2>
          <p className="text-[14px] font-medium leading-relaxed opacity-95 break-keep">
            전국 각지의 믿음직한 농부님들이 땀흘려 가꾼 신선하고 건강한 식재료를 한곳에서 만나보세요.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-10">
          {categories.map((category, idx) => (
            <section key={idx}>
              <h3 className="text-[20px] font-black text-[#1E8449] mb-4 flex items-center gap-2">
                <span className="text-2xl">{category.icon}</span> {category.title}
              </h3>
              
              <div className="space-y-4">
                {category.items.map((item, i) => (
                  <div key={i} className="bg-white p-5 rounded-[20px] shadow-sm border border-[#E8EDE6]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <h4 className="text-[16px] font-black text-gray-800">{item.name}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${item.badge}`}>
                        {item.region}
                      </span>
                    </div>
                    <p className="text-[14px] font-medium text-gray-600 leading-relaxed break-keep">
                      "{item.desc}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Home Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-gray-100 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => navigate('/')}
          className="w-full py-4 flex flex-col items-center justify-center gap-1 active:bg-gray-50 transition-colors"
        >
          <Home size={26} className="text-[#1E8449]" strokeWidth={2.5} />
          <span className="text-[12px] font-bold text-[#1E8449]">홈으로 돌아가기</span>
        </button>
      </div>
    </div>
  );
}
