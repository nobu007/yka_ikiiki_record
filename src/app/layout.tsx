import { makeServer } from '@/mirage/server';
import './globals.css';

if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MOCK === 'true') {
  makeServer({ environment: 'development' });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: 'Dashboard',
  description: 'ダッシュボードアプリケーション',
};
