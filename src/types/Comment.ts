export interface Comment {
  id: number;
  alertId: number;
  userId: number;
  username: string;
  content: string;
  likes: number;
  createdAt: string;
  isEdited?: boolean;
}

export interface CommentRequestDTO {
  alertId: number;
  content: string;
}

export interface CommentUpdateDTO {
  content: string;
}

export interface CommentPaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | "ASC" | "DESC";
}

export interface PaginatedCommentsResponse {
  content: Comment[];
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}

