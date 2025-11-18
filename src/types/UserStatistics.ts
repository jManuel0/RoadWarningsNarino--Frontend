export interface UserStatistics {
  userId: number;
  username: string;
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  reputation: number;
  upvotesReceived: number;
  downvotesReceived?: number;
  badgesCount?: number;
  [key: string]: number | string | undefined;
}

export interface LeaderboardEntry {
  userId: number;
  username: string;
  value: number;
  rank?: number;
  [key: string]: number | string | undefined;
}

export type LeaderboardType = "reputation" | "alerts" | "upvotes";

export interface UserBadgeSummary {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  earnedAt?: string;
}

