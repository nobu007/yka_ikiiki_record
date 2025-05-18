"use client";
import { useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    await fetch("/api/seed", {
      method: "POST",
      body: JSON.stringify({ students: 25 })
    });
    await fetch("/api/stats");
    location.reload();
  };

  return (
    <div className="p-4">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "生成中..." : "📊 Demo データ生成"}
      </button>
    </div>
  );
}