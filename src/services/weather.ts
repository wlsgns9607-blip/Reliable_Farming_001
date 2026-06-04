export async function getWeatherForecast(lat: number = 37.5665, lon: number = 126.9780) {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`;
    const res = await fetch(weatherUrl);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.details || `Weather fetch failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn("Weather Service Warning (using dummy data):", error);
    // Return safe fallback data so the app doesn't crash
    return {
      current_weather: {
        temperature: 20,
        weathercode: 0,
        time: new Date().toISOString()
      },
      daily: {
        weathercode: [0, 0, 0, 0, 0],
        temperature_2m_max: [22, 23, 22, 21, 22],
        temperature_2m_min: [15, 16, 15, 14, 15],
        time: [new Date().toISOString()]
      }
    };
  }
}

export async function getLocalWeather() {
  return new Promise((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const w = await getWeatherForecast(position.coords.latitude, position.coords.longitude);
          resolve(w);
        },
        async (error) => {
          console.error("Geolocation error:", error);
          const w = await getWeatherForecast(); // fallback to Seoul
          resolve(w);
        },
        { timeout: 5000 }
      );
    } else {
      getWeatherForecast().then(resolve);
    }
  });
}

export function parseWeatherCode(code: number) {
  if (code === 0) return { label: '맑음', icon: 'Sun' };
  if (code === 1 || code === 2 || code === 3) return { label: '구름', icon: 'CloudSun' };
  if (code === 45 || code === 48) return { label: '안개', icon: 'Cloud' };
  if (code >= 51 && code <= 67) return { label: '비', icon: 'CloudRain' };
  if (code >= 71 && code <= 77) return { label: '눈', icon: 'Snowflake' };
  if (code >= 80 && code <= 82) return { label: '소나기', icon: 'CloudRain' };
  if (code >= 95 && code <= 99) return { label: '뇌우', icon: 'CloudLightning' };
  return { label: '흐림', icon: 'Cloud' };
}
