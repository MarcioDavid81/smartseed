"use client";

import { useQuery } from "@tanstack/react-query";
import { getWeather } from "@/services/weather/weather-service";

type Params = {
  city?: string | null;
  enabled?: boolean;
};

type WeatherData = Awaited<ReturnType<typeof getWeather>>;

export function useWeather({ city, enabled = true }: Params) {
  const normalizedCity = (city ?? "").trim();

  return useQuery<WeatherData>({
    queryKey: ["weather", normalizedCity],
    queryFn: () => getWeather(normalizedCity),
    enabled: enabled && normalizedCity.length > 0,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });
}