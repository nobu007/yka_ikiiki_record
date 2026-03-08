import { redirect } from 'next/navigation';
import React from 'react';

const Home = React.memo(function Home() {
  redirect('/landing');
  return null;
});

Home.displayName = 'Home';

export default Home;
