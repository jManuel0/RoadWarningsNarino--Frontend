export interface AnalyticsStats {
  // Objeto flexible con estadísticas globales
  [key: string]: number | string | null | undefined;
}

export interface AlertsByTypeEntry {
  type: string;
  count: number;
}

export interface AlertsBySeverityEntry {
  severity: string;
  count: number;
}

export interface AlertsByStatusEntry {
  status: string;
  count: number;
}

export interface TrendEntry {
  date: string; // ISO date
  count: number;
}

export interface HotspotEntry {
  latitude: number;
  longitude: number;
  count: number;
}

export interface TopContributorEntry {
  userId: number;
  username: string;
  alertCount: number;
}

export interface PeakHourEntry {
  hour: number; // 0-23
  count: number;
}

export interface DayOfWeekEntry {
  dayOfWeek: number; // 0-6 o 1-7, según backend
  label?: string;
  count: number;
}

export interface AvgResolutionTime {
  averageHours: number;
}

export interface AnalyticsDashboard {
  stats?: AnalyticsStats;
  alertsByType?: AlertsByTypeEntry[];
  alertsBySeverity?: AlertsBySeverityEntry[];
  alertsByStatus?: AlertsByStatusEntry[];
  trend?: TrendEntry[];
  hotspots?: HotspotEntry[];
  topContributors?: TopContributorEntry[];
  peakHours?: PeakHourEntry[];
  byDayOfWeek?: DayOfWeekEntry[];
  avgResolutionTime?: AvgResolutionTime;
  // Campos adicionales flexibles
  [key: string]:
    | AnalyticsStats
    | AlertsByTypeEntry[]
    | AlertsBySeverityEntry[]
    | AlertsByStatusEntry[]
    | TrendEntry[]
    | HotspotEntry[]
    | TopContributorEntry[]
    | PeakHourEntry[]
    | DayOfWeekEntry[]
    | AvgResolutionTime
    | unknown;
}

