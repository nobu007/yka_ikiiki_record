import { prisma } from '@/lib/prisma';
import { withDatabaseTimeout } from '@/lib/resilience/timeout';

const SEED_RECORD_COUNT = 750;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const DAYS_LOOK_BACK = 30;
const STUDENT_COUNT = 25;

const EMOTION_THRESHOLDS = {
  VERY_LOW: 0.1,
  LOW: 0.3,
  HIGH: 0.7,
  VERY_HIGH: 0.9
} as const;

const COMMENTS = [
  '今日は充実した一日でした',
  '少し疲れました',
  'とても楽しかったです',
  '難しい課題に取り組みました',
  'チームでの作業が上手くいきました',
] as const;

export async function generateSeedData() {
  await withDatabaseTimeout(prisma.record.deleteMany({}));

  const records = Array.from({ length: SEED_RECORD_COUNT }, () => {
    const emotion = Math.random();
    let emotionValue: number;

    if (emotion < EMOTION_THRESHOLDS.VERY_LOW) emotionValue = 1 + Math.random();
    else if (emotion < EMOTION_THRESHOLDS.LOW) emotionValue = 2 + Math.random();
    else if (emotion < EMOTION_THRESHOLDS.HIGH) emotionValue = 3 + Math.random();
    else if (emotion < EMOTION_THRESHOLDS.VERY_HIGH) emotionValue = 4 + Math.random();
    else emotionValue = 4 + Math.random();

    const date = new Date();
    const hour = Math.floor(Math.random() * HOURS_PER_DAY);
    const minutes = Math.floor(Math.random() * MINUTES_PER_HOUR);
    date.setHours(hour, minutes);
    date.setDate(date.getDate() - Math.floor(Math.random() * DAYS_LOOK_BACK));

    const student = `学生${Math.floor(Math.random() * STUDENT_COUNT) + 1}`;
    const comment = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];

    return {
      emotion: emotionValue,
      date,
      student,
      comment: comment || null,
    };
  });

  await withDatabaseTimeout(prisma.record.createMany({
    data: records,
  }));

  return records.length;
}
