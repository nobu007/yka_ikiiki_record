// Simplified API route for seed data generation

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, normalizeError, logError } from '@/lib/errors';
import { generateBaseEmotion, calculateSeasonalEffect, calculateEventEffect, clampEmotion, getRandomHour } from '@/lib/utils';
import { APP_CONFIG, EMOTION_CONFIG } from '@/lib/config';

// Simple validation schema
const SeedRequestSchema = z.object({
  config: z.object({
    periodDays: z.number().min(1).max(365).default(APP_CONFIG.generation.defaultPeriodDays),
    studentCount: z.number().min(1).max(100).default(APP_CONFIG.generation.defaultStudentCount),
    distributionPattern: z.enum(['normal', 'bimodal', 'stress', 'happy']).default(APP_CONFIG.generation.defaultPattern),
    classCharacteristics: z.object({
      volatility: z.number().min(0).max(1).default(0.5),
      baselineEmotion: z.number().min(1).max(5).default(3.0)
    }).optional(),
    seasonalEffects: z.boolean().default(true),
    eventEffects: z.array(z.object({
      startDate: z.string(),
      endDate: z.string(),
      impact: z.number().min(-1).max(1)
    })).default([])
  })
});

// Simple in-memory storage (in production, use a proper database)
let storedStats: any = null;

// Simplified emotion generation
const generateEmotion = (config: any, date: Date, studentIndex: number): number => {
  let emotion = generateBaseEmotion(config.distributionPattern);
  
  // Apply class characteristics
  if (config.classCharacteristics) {
    emotion = emotion * (1 + (config.classCharacteristics.volatility - 0.5) * 0.4);
    emotion += (config.classCharacteristics.baselineEmotion - 3.0) * 0.5;
  }
  
  // Apply seasonal effects
  if (config.seasonalEffects) {
    emotion += calculateSeasonalEffect(date);
  }
  
  // Apply event effects
  const events = config.eventEffects.map((event: any) => ({
    ...event,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate)
  }));
  emotion += calculateEventEffect(date, events);
  
  return clampEmotion(emotion);
};

// Generate statistics data
const generateStats = (config: any) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - config.periodDays);
  const allEmotions: Array<{date: Date; student: number; emotion: number; hour: number}> = [];

  for (let studentIndex = 0; studentIndex < config.studentCount; studentIndex++) {
    for (let day = 0; day < config.periodDays; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      const recordCount = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < recordCount; i++) {
        allEmotions.push({
          date,
          student: studentIndex,
          emotion: generateEmotion(config, date, studentIndex),
          hour: getRandomHour()
        });
      }
    }
  }

  // Calculate statistics
  const emotions = allEmotions.map(e => e.emotion);
  const avgEmotion = emotions.reduce((sum, val) => sum + val, 0) / emotions.length;

  // Monthly stats
  const monthlyStats = new Map<string, number[]>();
  allEmotions.forEach(({ date, emotion }) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const values = monthlyStats.get(key) || [];
    values.push(emotion);
    monthlyStats.set(key, values);
  });

  // Student stats
  const studentStats = new Map<number, number[]>();
  allEmotions.forEach(({ emotion, student }) => {
    const values = studentStats.get(student) || [];
    values.push(emotion);
    studentStats.set(student, values);
  });

  return {
    overview: {
      count: allEmotions.length,
      avgEmotion: Number(avgEmotion.toFixed(1))
    },
    monthlyStats: Array.from(monthlyStats.entries()).map(([month, monthEmotions]) => ({
      month,
      avgEmotion: Number((monthEmotions.reduce((sum, val) => sum + val, 0) / monthEmotions.length).toFixed(1)),
      count: monthEmotions.length
    })).sort((a, b) => a.month.localeCompare(b.month)),
    studentStats: Array.from(studentStats.entries()).map(([student, studentEmotions]) => ({
      student: `学生${student + 1}`,
      recordCount: studentEmotions.length,
      avgEmotion: Number((studentEmotions.reduce((sum, val) => sum + val, 0) / studentEmotions.length).toFixed(1)),
      trendline: studentEmotions.slice(-7).map(score => Number((score || 0).toFixed(1)))
    })).sort((a, b) => a.student.localeCompare(b.student)),
    dayOfWeekStats: ['日', '月', '火', '水', '木', '金', '土'].map(day => {
      const dayEmotions = allEmotions.filter(({ date }) => {
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        return dayNames[date.getDay()] === day;
      });
      return {
        day,
        avgEmotion: dayEmotions.length > 0 ? Number((dayEmotions.reduce((sum, e) => sum + e.emotion, 0) / dayEmotions.length).toFixed(1)) : 0,
        count: dayEmotions.length
      };
    }),
    emotionDistribution: [0, 0, 0, 0, 0].map((_, index) => 
      emotions.filter(emotion => Math.floor(emotion) - 1 === index).length
    ),
    timeOfDayStats: {
      morning: Number((allEmotions.filter(({ hour }) => hour >= 5 && hour < 12).reduce((sum, e) => sum + e.emotion, 0) / Math.max(1, allEmotions.filter(({ hour }) => hour >= 5 && hour < 12).length)).toFixed(1)),
      afternoon: Number((allEmotions.filter(({ hour }) => hour >= 12 && hour < 18).reduce((sum, e) => sum + e.emotion, 0) / Math.max(1, allEmotions.filter(({ hour }) => hour >= 12 && hour < 18).length)).toFixed(1)),
      evening: Number((allEmotions.filter(({ hour }) => (hour >= 18 && hour < 24) || hour < 5).reduce((sum, e) => sum + e.emotion, 0) / Math.max(1, allEmotions.filter(({ hour }) => (hour >= 18 && hour < 24) || hour < 5).length)).toFixed(1))
    }
  };
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { config } = SeedRequestSchema.parse(body);
    
    const stats = generateStats(config);
    storedStats = stats;

    return NextResponse.json({
      success: true,
      message: 'テストデータの生成が完了しました',
      data: stats
    });
  } catch (error) {
    const appError = normalizeError(error);
    logError(appError, 'API:seed:POST');
    
    return NextResponse.json(
      { 
        success: false, 
        error: appError.message 
      },
      { status: appError.statusCode || 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    if (!storedStats) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'データがありません。まずPOSTリクエストでデータを生成してください。' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: storedStats
    });
  } catch (error) {
    const appError = normalizeError(error);
    logError(appError, 'API:seed:GET');
    
    return NextResponse.json(
      { 
        success: false, 
        error: appError.message 
      },
      { status: appError.statusCode || 500 }
    );
  }
}