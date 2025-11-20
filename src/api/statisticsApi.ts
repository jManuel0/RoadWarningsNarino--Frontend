import { API_BASE } from "@/api/baseUrl";
import {
  UserStatistics,
  LeaderboardEntry,
  UserBadgeSummary,
} from "@/types/UserStatistics";

function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem("auth-storage");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

function buildQuery(params: { limit?: number }): string {
  const search = new URLSearchParams();
  if (typeof params.limit === "number") {
    search.append("limit", String(params.limit));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const statisticsApi = {
  async getMyStatistics(): Promise<UserStatistics> {
    const res = await fetch(`${API_BASE}/api/statistics/me`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener tus estadísticas");
    }

    return res.json();
  },

  async getUserStatistics(userId: number): Promise<UserStatistics> {
    const res = await fetch(`${API_BASE}/api/statistics/user/${userId}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener estadísticas del usuario");
    }

    return res.json();
  },

  async getLeaderboardReputation(limit?: number): Promise<LeaderboardEntry[]> {
    const query = buildQuery({ limit });

    const res = await fetch(
      `${API_BASE}/api/statistics/leaderboard/reputation${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener ranking por reputación");
    }

    return res.json();
  },

  async getLeaderboardAlerts(limit?: number): Promise<LeaderboardEntry[]> {
    const query = buildQuery({ limit });

    const res = await fetch(
      `${API_BASE}/api/statistics/leaderboard/alerts${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener ranking por alertas");
    }

    return res.json();
  },

  async getLeaderboardUpvotes(limit?: number): Promise<LeaderboardEntry[]> {
    const query = buildQuery({ limit });

    const res = await fetch(
      `${API_BASE}/api/statistics/leaderboard/upvotes${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener ranking por votos positivos");
    }

    return res.json();
  },

  async getMyBadges(): Promise<UserBadgeSummary[]> {
    const res = await fetch(`${API_BASE}/api/statistics/badges/me`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener tus insignias");
    }

    return res.json();
  },

  async getUserBadges(userId: number): Promise<UserBadgeSummary[]> {
    const res = await fetch(
      `${API_BASE}/api/statistics/badges/user/${userId}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener insignias del usuario");
    }

    return res.json();
  },
};
