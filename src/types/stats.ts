export interface Stats {
  overview: {
    count: number;
    avgEmotion: string;
  };
  monthlyStats: Array<{
    month: string;
    count: number;
    avgEmotion: string;
  }>;
  dayOfWeekStats: Array<{
    day: string;
    count: number;
    avgEmotion: string;
  }>;
  timeOfDayStats: {
    morning: string;
    afternoon: string;
    evening: string;
  }
}