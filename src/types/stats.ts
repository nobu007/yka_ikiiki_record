export interface Stats {
  overview: {
    count: number;
    avgEmotion: string;
  };
  monthlyStats: {
    month: string;
    count: number;
    avgEmotion: string;
  }[];
  studentStats: {
    student: string;
    recordCount: number;
    avgEmotion: string;
    trendline: number[];
  }[];
  dayOfWeekStats: {
    day: string;
    avgEmotion: string;
    count: number;
  }[];
  emotionDistribution: number[];
  timeOfDayStats: {
    morning: string;
    afternoon: string;
    evening: string;
  };
}