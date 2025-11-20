import { API_BASE } from "@/api/baseUrl";
import {
  CurrentWeather,
  WeatherForecastResponse,
  WeatherHazard,
} from "@/types/Weather";

function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.append(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export const weatherApi = {
  async getCurrent(lat: number, lon: number): Promise<CurrentWeather> {
    const query = buildQuery({ lat, lon });

    const res = await fetch(`${API_BASE}/api/weather/current${query}`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Error al obtener el clima actual");
    }

    return res.json();
  },

  async getForecast(
    lat: number,
    lon: number,
    days: number
  ): Promise<WeatherForecastResponse> {
    const query = buildQuery({ lat, lon, days });

    const res = await fetch(`${API_BASE}/api/weather/forecast${query}`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Error al obtener el pronóstico del clima");
    }

    return res.json();
  },

  async getHazards(lat: number, lon: number): Promise<WeatherHazard[]> {
    const query = buildQuery({ lat, lon });

    const res = await fetch(`${API_BASE}/api/weather/hazards${query}`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Error al obtener alertas meteorológicas");
    }

    return res.json();
  },
};
