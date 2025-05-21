import DashboardContent from "./_components/DashboardContent";

const initialStats = {
  count: 0,
  avgEmotion: "0"
};

export default function Page() {
  return <DashboardContent initialStats={initialStats} />;
}