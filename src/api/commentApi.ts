import {
  Comment,
  CommentRequestDTO,
  CommentUpdateDTO,
  CommentPaginationParams,
  PaginatedCommentsResponse,
} from "@/types/Comment";
import { API_BASE } from "./baseUrl";

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

function authHeaders(json: boolean = false): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (json) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

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

export const commentApi = {
  async createComment(data: CommentRequestDTO): Promise<Comment> {
    const res = await fetch(`${API_BASE}/api/comments`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al crear comentario");
    }

    return res.json();
  },

  async getCommentsByAlert(alertId: number): Promise<Comment[]> {
    const res = await fetch(`${API_BASE}/api/comments/alert/${alertId}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener comentarios");
    }

    return res.json();
  },

  async getCommentsByAlertPaginated(
    alertId: number,
    params: CommentPaginationParams = {}
  ): Promise<PaginatedCommentsResponse> {
    const query = buildQuery(params);

    const res = await fetch(
      `${API_BASE}/api/comments/alert/${alertId}/paginated${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener comentarios paginados");
    }

    return res.json();
  },

  async getCommentsByUser(userId: number): Promise<Comment[]> {
    const res = await fetch(`${API_BASE}/api/comments/user/${userId}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener comentarios del usuario");
    }

    return res.json();
  },

  async getCommentById(id: number): Promise<Comment> {
    const res = await fetch(`${API_BASE}/api/comments/${id}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener comentario");
    }

    return res.json();
  },

  async updateComment(
    id: number,
    data: CommentUpdateDTO
  ): Promise<Comment> {
    const res = await fetch(`${API_BASE}/api/comments/${id}`, {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar comentario");
    }

    return res.json();
  },

  async deleteComment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/comments/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al eliminar comentario");
    }
  },

  async markHelpful(id: number): Promise<Comment> {
    const res = await fetch(`${API_BASE}/api/comments/${id}/helpful`, {
      method: "POST",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al marcar comentario como útil");
    }

    return res.json();
  },

  async getTopHelpfulByAlert(
    alertId: number,
    limit?: number
  ): Promise<Comment[]> {
    const query = buildQuery({ limit });

    const res = await fetch(
      `${API_BASE}/api/comments/alert/${alertId}/top-helpful${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener comentarios más útiles");
    }

    return res.json();
  },
};

