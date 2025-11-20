import { API_BASE } from "@/api/baseUrl";
import {
  AnalyticsStats,
  AlertsByTypeEntry,
  AlertsBySeverityEntry,
  AlertsByStatusEntry,
  TrendEntry,
  HotspotEntry,
  TopContributorEntry,
  PeakHourEntry,
  DayOfWeekEntry,
  AvgResolutionTime,
  AnalyticsDashboard,
} from "@/types/Analytics";

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

export const analyticsApi = {
  async getStats(): Promise<AnalyticsStats> {
    const res = await fetch(`${API_BASE}/analytics/stats`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener estadísticas generales");
    }

    return res.json();
  },

  async getAlertsByType(): Promise<AlertsByTypeEntry[]> {
    const res = await fetch(`${API_BASE}/analytics/alerts-by-type`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener alertas por tipo");
    }

    return res.json();
  },

  async getAlertsBySeverity(): Promise<AlertsBySeverityEntry[]> {
    const res = await fetch(`${API_BASE}/analytics/alerts-by-severity`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener alertas por severidad");
    }

    return res.json();
  },

  async getAlertsByStatus(): Promise<AlertsByStatusEntry[]> {
    const res = await fetch(`${API_BASE}/analytics/alerts-by-status`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener alertas por estado");
    }

    return res.json();
  },

  async getTrend(days: number): Promise<TrendEntry[]> {
    const res = await fetch(`${API_BASE}/analytics/trend?days=${days}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener tendencia de alertas");
    }

    return res.json();
  },

  async getHotspots(limit?: number): Promise<HotspotEntry[]> {
    const query = typeof limit === "number" ? `?limit=${limit}` : "";

    const res = await fetch(`${API_BASE}/analytics/hotspots${query}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener hotspots");
    }

    return res.json();
  },

  async getTopContributors(limit?: number): Promise<TopContributorEntry[]> {
    const query = typeof limit === "number" ? `?limit=${limit}` : "";

    const res = await fetch(`${API_BASE}/analytics/top-contributors${query}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener top de contribuidores");
    }

    return res.json();
  },

  async getPeakHours(): Promise<PeakHourEntry[]> {
    const res = await fetch(`${API_BASE}/analytics/peak-hours`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener horas pico");
    }

    return res.json();
  },

  async getByDayOfWeek(): Promise<DayOfWeekEntry[]> {
    const res = await fetch(`${API_BASE}/analytics/by-day-of-week`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener datos por día de la semana");
    }

    return res.json();
  },

  async getAvgResolutionTime(): Promise<AvgResolutionTime> {
    const res = await fetch(`${API_BASE}/analytics/avg-resolution-time`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener tiempo promedio de resolución");
    }

    return res.json();
  },

  async getDashboard(): Promise<AnalyticsDashboard> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener datos del dashboard");
    }

    return res.json();
  },
};
