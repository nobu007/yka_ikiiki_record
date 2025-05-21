import Link from "next/link";

export default function Landing() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold">イキイキレコード デモ</h1>
      <Link
        href="/dashboard"
        className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        教師ダッシュボードを見る
      </Link>
    </main>
  );
}
