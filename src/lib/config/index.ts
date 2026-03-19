import { GENERATION_DEFAULTS } from "@/lib/constants";

export const APP_CONFIG = {
  name: "イキイキレコード デモ",
  description: "生徒の学習データを生成・管理するダッシュボードです",
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    endpoints: {
      seed: "/seed",
    },
  },
  generation: {
    defaultPeriodDays: GENERATION_DEFAULTS.PERIOD_DAYS,
    defaultStudentCount: GENERATION_DEFAULTS.STUDENT_COUNT,
    defaultPattern: "normal" as const,
  },
} as const;

export const EMOTION_CONFIG = {
  min: 1,
  max: 5,
  defaultStddev: 0.5,
  seasonalImpact: 0.3,
  maxEventImpact: 0.8,
  seasonalFactors: [0.2, 0.1, 0.3, 0.4, 0.5, 0.3, 0.2, 0.1, 0.3, 0.4, 0.3, 0.1],
  baseEmotions: {
    normal: 3.0,
    bimodal: 2.0,
    stress: 2.5,
    happy: 3.5,
  },
} as const;

export const UI_CONFIG = {
  timeRanges: {
    morning: { start: 5, end: 12 },
    afternoon: { start: 12, end: 18 },
    evening: { start: 18, end: 24 },
  },
  daysOfWeek: ["日", "月", "火", "水", "木", "金", "土"],
  buttonStyles: {
    primary:
      "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors",
    secondary:
      "bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors",
  },
} as const;

export const CHART_COLORS = {
  PRIMARY: "#4F46E5",
  BLUE: "#3B82F6",
  GREEN: "#10B981",
  YELLOW: "#F59E0B",
  RED: "#EF4444",
  PURPLE: "#8B5CF6",
  PINK: "#EC4899",
  GRAY_DARK: "#4b5563",
  GRAY_MEDIUM: "#6B7280",
  GRAY_LIGHT: "#9ca3af",
  GRAY_BORDER: "#E5E7EB",
  BORDER_LIGHT: "#f1f1f1",
  BORDER_DARK: "#374151",
  BG_DARK: "#1f2937",
  BG_LIGHT: "#ffffff",
  PALETTE: [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ] as const,
} as const;
