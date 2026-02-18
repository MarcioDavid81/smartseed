type OpenWeatherErrorBody = {
  message?: string;
};

function getWeatherApiKey() {
  const key = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  if (!key) throw new Error("WEATHER_API_KEY_NOT_CONFIGURED");
  return key;
}

function buildOpenWeatherUrl(params: {
  endpoint: "weather" | "forecast";
  city: string;
  key: string;
}) {
  const url = new URL(
    `https://api.openweathermap.org/data/2.5/${params.endpoint}`,
  );
  url.searchParams.set("q", params.city);
  url.searchParams.set("appid", params.key);
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "pt_br");
  return url.toString();
}

async function fetchOpenWeather<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, init);

  if (!res.ok) {
    let message = `OPENWEATHER_REQUEST_FAILED_${res.status}`;
    try {
      const body = (await res.json()) as OpenWeatherErrorBody;
      if (body?.message) message = body.message;
    } catch {
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export async function getCurrentWeather(city: string, init?: RequestInit) {
  const normalized = city.trim();
  if (!normalized) throw new Error("CITY_REQUIRED");

  const key = getWeatherApiKey();
  const url = buildOpenWeatherUrl({
    endpoint: "weather",
    city: normalized,
    key,
  });

  return fetchOpenWeather<unknown>(url, init);
}

export async function getForecastFiveDays(city: string, init?: RequestInit) {
  const normalized = city.trim();
  if (!normalized) throw new Error("CITY_REQUIRED");

  const key = getWeatherApiKey();
  const url = buildOpenWeatherUrl({
    endpoint: "forecast",
    city: normalized,
    key,
  });

  return fetchOpenWeather<unknown>(url, init);
}

export async function getWeather(city: string, init?: RequestInit) {
  const [data, datafivedays] = await Promise.all([
    getCurrentWeather(city, init),
    getForecastFiveDays(city, init),
  ]);

  return { data, datafivedays };
}