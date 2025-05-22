"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stats } from '@/types/stats';

export const useDataGeneration = (setStats: (stats: Stats) => void) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const generateData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ students: 25, days: 365 })
      });

      if (res.ok) {
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          const newStats = await statsRes.json();
          setStats(newStats);
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error generating data:", error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, generateData };
};