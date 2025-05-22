import DashboardContent from "./_components/DashboardContent";

const initialStats = {
  overview: {
    count: 0,
    avgEmotion: "0.00"
  },
  monthlyStats: [],
  dayOfWeekStats: [],
  timeOfDayStats: {
    morning: "0.00",
    afternoon: "0.00",
    evening: "0.00"
  }
};

export default function Page() {
  return <DashboardContent initialStats={initialStats} />;
}