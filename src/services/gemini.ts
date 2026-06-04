export async function processVoiceLog(transcript: string) {
  // Keeping this for potential future use or if we add a route for it
  // For now, it's not explicitly used in the UI we checked
  return {
    summary: transcript,
    category: "기타",
    suggestion: "일지가 기록되었습니다."
  };
}

export const FALLBACK_HARVEST: Record<number, any[]> = {
  1: [
    { name: "딸기", tip: "저온에서도 잘 자라요", benefit: "비타민 C 풍부" },
    { name: "시금치", tip: "찬바람을 맞아야 달아요", benefit: "철분 보충" },
    { name: "무", tip: "얼기 전에 수확하세요", benefit: "소화 촉진" }
  ],
  2: [
    { name: "한라봉", tip: "껍질이 얇은 것이 맛있어요", benefit: "피로 회복" },
    { name: "봄동", tip: "속잎이 노란 것을 고르세요", benefit: "비타민 A 풍부" },
    { name: "더덕", tip: "향이 진한 것이 좋아요", benefit: "기관지 건강" }
  ],
  3: [
    { name: "달래", tip: "뿌리 쪽을 잘 씻어주세요", benefit: "식욕 증진" },
    { name: "냉이", tip: "뿌리가 굵고 연한 것", benefit: "춘곤증 예방" },
    { name: "쑥", tip: "연한 잎 위주로 채취하세요", benefit: "면역력 강화" }
  ],
  4: [
    { name: "두릅", tip: "순이 연할 때 따세요", benefit: "활력 증진" },
    { name: "죽순", tip: "껍질이 싱싱한 것", benefit: "혈압 조절" },
    { name: "취나물", tip: "어린 잎이 부드러워요", benefit: "염증 완화" }
  ],
  5: [
    { name: "매실", tip: "초록색이 선명할 때 수확해요", benefit: "소화 도움" },
    { name: "마늘", tip: "줄기가 마르기 시작할 때", benefit: "면역력 강화" },
    { name: "양파", tip: "줄기가 7~80% 쓰러질 때", benefit: "혈관 건강" }
  ],
  6: [
    { name: "감자", tip: "잎이 노랗게 변할 때 수확해요", benefit: "에너지 보충" },
    { name: "완두콩", tip: "꼬투리가 통통할 때", benefit: "두뇌 발달" },
    { name: "보리", tip: "낟알이 단단해질 때", benefit: "식이섬유 풍부" }
  ],
  7: [
    { name: "옥수수", tip: "수염이 마르면 수확하세요", benefit: "식이섬유 풍부" },
    { name: "토마토", tip: "붉게 익었을 때 수확해요", benefit: "노화 방지" },
    { name: "수박", tip: "줄무늬가 선명한 것", benefit: "수분 보충" }
  ],
  8: [
    { name: "포도", tip: "알이 탱탱할 때 수확해요", benefit: "항산화 작용" },
    { name: "참외", tip: "향이 달콤한 것", benefit: "피로 해소" },
    { name: "복숭아", tip: "부드럽고 향이 진한 것", benefit: "피부 미용" }
  ],
  9: [
    { name: "사과", tip: "색이 붉고 향이 진한 것", benefit: "장 건강" },
    { name: "배", tip: "크기가 크고 묵직한 것", benefit: "기관지 보호" },
    { name: "고구마", tip: "서리 내리기 전에 수확", benefit: "변비 예방" }
  ],
  10: [
    { name: "배추", tip: "결속이 잘 된 것", benefit: "비타민 C 풍부" },
    { name: "무", tip: "단단하고 매끄러운 것", benefit: "해독 작용" },
    { name: "단감", tip: "꼭지가 싱싱한 것을 고르세요", benefit: "비타민 A 풍부" }
  ],
  11: [
    { name: "유자", tip: "향이 강하고 겉이 깨끗한 것", benefit: "감기 예방" },
    { name: "들깨", tip: "꼬투리가 갈색일 때", benefit: "뇌 기능 활성화" },
    { name: "콩", tip: "잎이 떨어지고 꼬투리가 마를 때", benefit: "단백질 공급" }
  ],
  12: [
    { name: "귤", tip: "노란색이 고르게 퍼진 것", benefit: "감기 예방" },
    { name: "우엉", tip: "뿌리가 갈라지지 않은 것", benefit: "당뇨 개선" },
    { name: "연근", tip: "마디가 짧고 통통한 것", benefit: "혈액 순환" }
  ]
};

export async function getHarvestRecommendation(month: number) {
  const year = new Date().getFullYear();
  const cacheKey = `harvestRec_v2_${year}_${month}`; // Versioned key to bypass old bad data
  
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed.slice(0, 3);
      }
    }
  } catch(e) {
    console.warn("Cache read error", e);
  }

  try {
    const response = await fetch('/api/harvest-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month })
    });
    
    let result: any[] = [];
    if (response.ok) {
      const data = await response.json();
      result = Array.isArray(data) ? data : [];
    }

    // Ensure we have exactly 3 items
    const fb = FALLBACK_HARVEST[month] || [];
    if (result.length < 3) {
      const combined = [...result];
      for (const item of fb) {
        if (combined.length >= 3) break;
        if (!combined.some(c => c.name === item.name)) {
          combined.push(item);
        }
      }
      result = combined;
    }
    
    result = result.slice(0, 3);

    try {
      if (result.length >= 3) {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      }
    } catch(e) {
      console.warn("Cache write error", e);
    }
    
    return result;
  } catch (error) {
    return FALLBACK_HARVEST[month]?.slice(0, 3) || [];
  }
}

export async function askFarmingDoctor(question: string) {
  try {
    const response = await fetch('/api/ask-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.answer || "죄송합니다. 답변을 생성하는 중에 오류가 발생했습니다.";
  } catch (error) {
    console.error("Farming Doctor error:", error);
    return "현재 AI 박사님과 연결이 원활하지 않습니다. 나중에 다시 시도해주세요.";
  }
}
