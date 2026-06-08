import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function createServer() {
  const app = express();
  
  app.use(express.json({ limit: '10mb' }));

  // Gemini Initialization
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY as string,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const GEMINI_MODEL = "gemini-flash-latest"; // Using latest stable flash model

  // Helper to retry calls on transient errors
  const withRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        // Check for common retryable status codes:
        // 502 (Bad Gateway), 503 (Service Unavailable), 504 (Gateway Timeout), 429 (Too Many Requests)
        const status = error?.status || (error instanceof Error && (error as any).response?.status);
        const isRetryable = [429, 502, 503, 504].includes(status) || 
                            error?.message?.includes("high demand") ||
                            error?.message?.includes("failed with status 502") ||
                            error?.message?.includes("failed with status 503") ||
                            error?.message?.includes("failed with status 504");

        if (isRetryable && i < retries - 1) {
          console.warn(`[Retry] Attempt ${i + 1} failed. Retrying in ${delay * (i + 1)}ms... (Error: ${error?.message || status})`);
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  };

  // Helper to parse JSON from Gemini response (handles markdown blocks)
  const parseGeminiJson = (text: string) => {
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse Error on Gemini text:", text);
      return null;
    }
  };

  // API Routes
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      const latitude = lat || "37.5665";
      const longitude = lon || "126.9780";
      
      console.log(`[Weather] Fetching for: ${latitude}, ${longitude}`);
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`;
      
      const data = await withRetry(async () => {
        const response = await fetch(weatherUrl);
        if (!response.ok) {
          const text = await response.text();
          console.error(`[Weather] API Error ${response.status}: ${text}`);
          // Create an error that looks like what withRetry expects
          const err = new Error(`Weather API failed with status ${response.status}`);
          (err as any).status = response.status;
          throw err;
        }
        return await response.json();
      });
      
      res.json(data);
    } catch (error) {
      console.error("[Weather] Server Error after retries:", error);
      res.status(500).json({ error: "Failed to fetch weather", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/ai-expert", async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      console.error("[AI-Expert] Missing GEMINI_API_KEY");
      return res.json({ answer: "Gemini API 키가 설정되지 않았습니다. 관리자에게 문의하거나 설정에서 API 키를 추가해 주세요." });
    }

    try {
      const { message, image } = req.body;
      let prompt = message || "이 이미지를 분석해 주세요.";
      prompt += `\n\n[시스템 지침]
당신은 대한민국 기후와 토양에 정통한 숙련된 농업 전문가인 'AI 척척박사'입니다. 
- 농업, 농사, 작물 재배, 토양 관리, 병해충 등 **농업과 직접적인 관련이 있는 질문**에만 답변합니다.
- 농업과 무관한 질문(예: 연예, 정치, 게임, 농사와 상관없는 일반 상식 등)이 들어오면 "저는 농업 전문가라 농사와 관련된 질문에만 도움을 드릴 수 있습니다. 무엇을 도와드릴까요?"라고 답변하고 거절하세요.
- 우리 농민들에게 친절하고 전문적인 조언을 제공합니다. 사용자(기획자)를 부를 때는 '기획자님'이라는 호칭을 사용합니다.
- 답변 시 '네 어르신'이라는 표현은 절대 사용하지 마세요.
- 대한민국 상황에 맞는 실용적인 팁을 포함하세요. 제철 농산물(마늘, 양파, 고추, 배추, 사과, 배 등)을 우선적으로 추천합니다.
- 망고, 아보카도, 파파야, 아스파라거스 같은 외래 작물은 추천 목록에서 절대 제외합니다.`;

      let parts: any[] = [{ text: prompt }];
      if (image) {
        const base64Data = image.split(',')[1];
        parts.push({ inlineData: { data: base64Data, mimeType: "image/jpeg" } });
      }

      console.log(`[AI-Expert] Generating content... (Image: ${!!image})`);
      const result = await withRetry(() => ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: { parts }
      }));
      
      const aiResponse = result.text;
      if (!aiResponse) throw new Error("Empty response from Gemini");
      
      res.json({ answer: aiResponse });
    } catch (error: any) {
      console.error("[AI-Expert] Gemini Error:", error);
      res.json({ answer: "죄송합니다. 현재 박사님과 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요. (오류: " + (error.message || "알 수 없는 오류") + ")" });
    }
  });

  app.post("/api/harvest-recommendation", async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("[Harvest] Missing GEMINI_API_KEY - returning empty");
      return res.json([]);
    }

    try {
      const { month } = req.body;
      const prompt = `대한민국 기후와 농업 환경을 기준으로 ${month}월에 수확하기 가장 좋은 한국의 전통적인 제철 작물 '정확히 3가지'를 추천해줘. 
      주의: 망고, 아보카도, 파파야, 아스파라거스 등 한국 노지나 일반 시설에서 흔히 재배되지 않는 외래 작물은 '절대' 제외하고 오직 한국적인 제철 작물(채소, 과일, 곡식)만 추천해.
      각 작물에 대해 이름, 수확 팁, 건강 효능을 포함해줘.
      결과는 JSON 배열 형식으로 반환해:
      [{ "name": "작물명", "tip": "수확 팁", "benefit": "효능" }]`;

      console.log(`[Harvest] Generating recommendations for month: ${month}`);
      const result = await withRetry(() => ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      }));
      
      const parsedData = parseGeminiJson(result.text || "[]");
      res.json(Array.isArray(parsedData) ? parsedData.slice(0, 3) : []);
    } catch (error: any) {
      console.error("[Harvest] Gemini Error:", error);
      res.json([]);
    }
  });

  app.post("/api/ask-doctor", async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      console.error("[Ask-Doctor] Missing GEMINI_API_KEY");
      return res.json({ answer: "Gemini API 키가 설정되지 않았습니다." });
    }

    try {
      const { question } = req.body;
      const prompt = `당신은 대한민국 기후와 토양에 정통한 숙련된 한국 농업 전문가인 'AI 척척박사'입니다.
      
      [금지 사항 및 지침]
      - 농업(작물, 토양, 기후, 병해충 등)과 관련 없는 질문에는 절대 답변하지 마세요.
      - 비농업적 질문이 들어올 경우 "죄송합니다. 저는 대한민국 농업 전문가로서 농사와 관련된 고민만 해결해 드릴 수 있습니다. 궁금한 농기구나 작물에 대해 물어봐 주세요."라고 답변하세요.
      - 외래 작물(망고, 아보카도 등) 추천은 금지하며 한국 농촌 상황에 맞는 답변만 하세요. 제철 농산물(마늘, 양파, 고추, 배추 등)을 우선적으로 추천하세요.
      - 사용자(기획자)를 부를 때는 '기획자님'이라고 부르고, '네 어르신'이라는 표현은 절대 사용하지 마세요.
 
      질문: "${question}"
      답변은 한국 농업 상황에 맞게 2-3문장 내외로 명확하게 작성해주세요.`;

      console.log(`[Ask-Doctor] Generating answer for question: ${question.substring(0, 20)}...`);
      const result = await withRetry(() => ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt
      }));
      
      res.json({ answer: result.text || "답변을 생성할 수 없습니다." });
    } catch (error: any) {
      console.error("[Ask-Doctor] Gemini Error:", error);
      res.json({ answer: "죄송합니다. 현재 박사님과 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요." });
    }
  });

  // Naver Auth Routes
  app.get("/api/auth/naver/url", (req, res) => {
    const clientId = process.env.NAVER_CLIENT_ID;
    
    // Vercel 등에서 동적으로 호스트 파악
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const appUrl = process.env.APP_URL || `${protocol}://${host}`;
    
    const redirectUri = `${appUrl}/api/auth/naver/callback`;
    const state = Math.random().toString(36).substring(7);
    
    if (!clientId) {
      return res.status(500).json({ error: "네이버 클라이언트 ID가 설정되지 않았습니다." });
    }

    const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    res.json({ url: authUrl });
  });

  app.get("/api/auth/naver/callback", async (req, res) => {
    const { code, state, error, error_description } = req.query;

    if (error) {
      return res.send(`
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'NAVER_AUTH_ERROR', error: '${error_description}' }, '*');
            window.close();
          }
        </script>
      `);
    }

    try {
      const clientId = process.env.NAVER_CLIENT_ID;
      const clientSecret = process.env.NAVER_CLIENT_SECRET;
      
      // 1. Get access token
      const tokenUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&state=${state}`;
      const tokenResponse = await fetch(tokenUrl);
      const tokenData: any = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(tokenData.error_description);
      }

      // 2. Get user profile
      const profileResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      });
      const profileData: any = await profileResponse.json();

      if (profileData.resultcode !== "00") {
        throw new Error(profileData.message);
      }

      const user = profileData.response; 

      res.send(`
        <html>
          <head>
            <meta charset="UTF-8">
            <style>body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }</style>
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'NAVER_AUTH_SUCCESS', 
                  user: ${JSON.stringify(user)} 
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>네이버 로그인 성공! 창이 자동으로 닫힙니다.</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Naver Callback Error:", err);
      res.send(`
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'NAVER_AUTH_ERROR', error: '${err.message}' }, '*');
            window.close();
          }
        </script>
      `);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (process.env.VERCEL !== "1") {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

// For local development and Cloud Run
if (process.env.VERCEL !== "1") {
  createServer().then((app) => {
    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  });
}

// Export for Vercel
export default createServer;
