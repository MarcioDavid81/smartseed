"use client";

import { useMemo, useState } from "react";
import { useWeather } from "@/queries/weather/use-weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CityOption = { label: string; value: string };

const cities: CityOption[] = [
  { label: "Jóia - RS", value: "Jóia,BR" },
  { label: "Santiago - RS", value: "Santiago,BR" },
  { label: "Tupanciretã - RS", value: "Tupanciretã,BR" },
  { label: "Cruz Alta	- RS", value: "Cruz Alta,BR" },
  { label: "Santa Maria - RS", value: "Santa Maria,BR" },
  { label: "Jaguari - RS", value: "Jaguari,BR" },
  { label: "Passo Fundo - RS", value: "Passo Fundo,BR" },
  { label: "Ijuí - RS", value: "Ijuí,BR" },
];

type CurrentWeather = {
  name?: string;
  sys?: { country?: string };
  main?: { temp?: number; feels_like?: number; humidity?: number };
  wind?: { speed?: number };
  weather?: Array<{ description?: string; icon?: string }>;
};

type ForecastResponse = {
  city?: { timezone?: number };
  list?: Array<{
    dt?: number;
    main?: { temp_min?: number; temp_max?: number };
    weather?: Array<{ description?: string; icon?: string }>;
  }>;
};

function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function formatTemp(v: unknown) {
  const n = asNumber(v);
  if (n === null) return "—";
  return `${Math.round(n)}°C`;
}

function formatWind(v: unknown) {
  const n = asNumber(v);
  if (n === null) return "—";
  return `${n.toFixed(2)} m/s`;
}

function toLocalDateKey(dtSeconds: number, tzSeconds: number) {
  const d = new Date((dtSeconds + tzSeconds) * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toLocalDate(dtSeconds: number, tzSeconds: number) {
  return new Date((dtSeconds + tzSeconds) * 1000);
}

type DailyForecast = {
  date: Date;
  min: number | null;
  max: number | null;
  description: string;
  icon: string | null;
};

function pickFiveDaysForecast(data: ForecastResponse): DailyForecast[] {
  const tz = asNumber(data.city?.timezone) ?? 0;
  const list = Array.isArray(data.list) ? data.list : [];
  if (list.length === 0) return [];

  const byDay = new Map<
    string,
    Array<{
      dt: number;
      tempMin: number | null;
      tempMax: number | null;
      description: string;
      icon: string | null;
      localDate: Date;
    }>
  >();

  for (const item of list) {
    const dt = asNumber(item.dt);
    if (dt === null) continue;

    const localDate = toLocalDate(dt, tz);
    const key = toLocalDateKey(dt, tz);

    const tempMin = asNumber(item.main?.temp_min);
    const tempMax = asNumber(item.main?.temp_max);

    const w0 = Array.isArray(item.weather) ? item.weather[0] : undefined;
    const description = (w0?.description ?? "—").toString();
    const icon = (w0?.icon ?? null) as string | null;

    const dayItems = byDay.get(key) ?? [];
    dayItems.push({ dt, tempMin, tempMax, description, icon, localDate });
    byDay.set(key, dayItems);
  }

  const days = Array.from(byDay.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(0, 5);

  return days.map(([, items]) => {
    const date = items[0]?.localDate ?? new Date();

    let min: number | null = null;
    let max: number | null = null;

    for (const it of items) {
      if (it.tempMin !== null) min = min === null ? it.tempMin : Math.min(min, it.tempMin);
      if (it.tempMax !== null) max = max === null ? it.tempMax : Math.max(max, it.tempMax);
    }

    const targetHour = 12;
    let chosen = items[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const it of items) {
      const hour = it.localDate.getUTCHours();
      const dist = Math.abs(hour - targetHour);
      if (dist < bestDistance) {
        bestDistance = dist;
        chosen = it;
      }
    }

    return {
      date,
      min,
      max,
      description: chosen?.description ?? "—",
      icon: chosen?.icon ?? null,
    };
  });
}

export default function WeatherForecast() {
  const [city, setCity] = useState<string>(cities[0]?.value ?? "");

  const { data, isLoading, isError } = useWeather({ city });

  const current = (data?.data ?? null) as CurrentWeather | null;
  const forecastRaw = (data?.datafivedays ?? null) as ForecastResponse | null;

  const forecast = useMemo(() => {
    if (!forecastRaw) return [];
    return pickFiveDaysForecast(forecastRaw);
  }, [forecastRaw]);

  const currentDescription =
    (Array.isArray(current?.weather) ? current?.weather?.[0]?.description : undefined) ?? "—";
  const currentIcon =
    (Array.isArray(current?.weather) ? current?.weather?.[0]?.icon : undefined) ?? null;

  const titleCity =
    current?.name && current?.sys?.country
      ? `${current.name}, ${current.sys.country}`
      : current?.name ?? "—";

  return (
    <section id="weather" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Previsão do <span className='text-green'>Tempo</span>
          </h2>
          <p className="text-lg text-gray-600">
            Manter-se informado sobre as condições climáticas é essencial.
          </p>
        </div>
        <div className="mt-6 flex items-center justify-center">
          <div className="w-full max-w-sm text-center">
            <div className="font-semibold">Selecione sua cidade</div>
            <div className="mt-3">
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Card className="mt-6 container">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Carregando previsão…</div>
            ) : isError ? (
              <div className="text-sm text-destructive">
                Não foi possível carregar a previsão do tempo.
              </div>
            ) : !current ? (
              <div className="text-sm text-muted-foreground">Selecione uma cidade para ver os dados.</div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="text-xl font-semibold">{titleCity}</div>
                <div className="flex items-center justify-center gap-4">
                  {currentIcon ? (
                    <img
                      src={`https://openweathermap.org/img/wn/${currentIcon}@2x.png`}
                      alt={currentDescription}
                      width={72}
                      height={72}
                    />
                  ) : null}
                  <div className="text-5xl font-semibold tabular-nums">
                    {formatTemp(current.main?.temp)}
                  </div>
                </div>
                <div className="text-base text-muted-foreground capitalize">{currentDescription}</div>
                <div className="mt-4 grid w-full grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="text-center text-sm">
                    <div className="text-muted-foreground">Sensação Térmica</div>
                    <div className="font-medium tabular-nums">
                      {formatTemp(current.main?.feels_like)}
                    </div>
                  </div>
                  <div className="text-center text-sm">
                    <div className="text-muted-foreground">Umidade do Ar</div>
                    <div className="font-medium tabular-nums">
                      {asNumber(current.main?.humidity) ?? "—"}%
                    </div>
                  </div>
                  <div className="text-center text-sm">
                    <div className="text-muted-foreground">Velocidade do Vento</div>
                    <div className="font-medium tabular-nums">
                      {formatWind(current.wind?.speed)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="mt-6 container flex flex-col items-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-lg">Previsão para os próximos 5 dias</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Carregando…</div>
            ) : forecast.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sem dados de previsão.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
                  {forecast.map((d) => {
                    const weekday = d.date.toLocaleDateString("pt-BR", { weekday: "long" });
                    const day = d.date.toLocaleDateString("pt-BR", { day: "2-digit" });
                    return (
                      <Card key={d.date.toISOString()} className="min-w-[180px] bg-cyan-50/40">
                        <CardContent className="p-5 text-center">
                          <div className="capitalize font-medium">
                            {weekday} {day}
                          </div>
                          <div className="mt-2 flex items-center justify-center">
                            {d.icon ? (
                              <img
                                src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                                alt={d.description}
                                width={56}
                                height={56}
                              />
                            ) : null}
                          </div>
                          <div className="mt-2 text-sm tabular-nums">
                            {d.min === null || d.max === null
                              ? "—"
                              : `${Math.round(d.min)}°C - ${Math.round(d.max)}°C`}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground capitalize">
                            {d.description}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}