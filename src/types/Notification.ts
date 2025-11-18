export interface NotificationDTO {
  id: number;
  userId: number;
  title: string;
  message: string;
  type?: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface DeviceTokenRequestDTO {
  token: string;
  platform?: "web" | "android" | "ios";
  deviceId?: string;
}

export interface NotificationPaginationParams {
  page?: number;
  size?: number;
}

export interface PaginatedNotificationsResponse {
  content: NotificationDTO[];
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}

