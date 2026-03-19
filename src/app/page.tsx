import { redirect } from "next/navigation";
import { memo } from "react";

const Home = memo(function Home() {
  redirect("/landing");
  return null;
});

Home.displayName = "Home";

export default Home;
