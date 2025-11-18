export interface CurrentWeather {
  temperature: number;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  condition: string;
  icon?: string;
  timestamp: string;
}

export interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon?: string;
  precipitationChance?: number;
}

export interface WeatherForecastResponse {
  location?: {
    name?: string;
    country?: string;
  };
  days: DailyForecast[];
}

export interface WeatherHazard {
  type: string;
  severity: string;
  description: string;
  validFrom: string;
  validTo?: string;
}

