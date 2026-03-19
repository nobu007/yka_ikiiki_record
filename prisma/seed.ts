import { PrismaClient } from '@prisma/client';
import { globalLogger } from '../src/lib/resilience/structured-logger';

const prisma = new PrismaClient();

const SEED_CONFIG = {
  RECORD_COUNT: 750,
  STUDENT_COUNT: 25,
  DAYS_BACK: 30,
  EMOTION_THRESHOLDS: {
    LEVEL_1: 0.1,
    LEVEL_2: 0.3,
    LEVEL_3: 0.7,
    LEVEL_4: 0.9,
  },
  TIME: {
    HOURS_IN_DAY: 24,
    MINUTES_IN_HOUR: 60,
  },
} as const;

const COMMENTS = [
  '今日は充実した一日でした',
  '少し疲れました',
  'とても楽しかったです',
  '難しい課題に取り組みました',
  'チームでの作業が上手くいきました',
] as const;

function generateEmotionValue(): number {
  const emotion = Math.random();
  const { EMOTION_THRESHOLDS } = SEED_CONFIG;

  if (emotion < EMOTION_THRESHOLDS.LEVEL_1) {
    return 1 + Math.random();
  } else if (emotion < EMOTION_THRESHOLDS.LEVEL_2) {
    return 2 + Math.random();
  } else if (emotion < EMOTION_THRESHOLDS.LEVEL_3) {
    return 3 + Math.random();
  } else if (emotion < EMOTION_THRESHOLDS.LEVEL_4) {
    return 4 + Math.random();
  } else {
    return 4 + Math.random();
  }
}

function generateRandomDate(): Date {
  const date = new Date();
  const { TIME, DAYS_BACK } = SEED_CONFIG;

  const hour = Math.floor(Math.random() * TIME.HOURS_IN_DAY);
  const minutes = Math.floor(Math.random() * TIME.MINUTES_IN_HOUR);
  date.setHours(hour, minutes);
  date.setDate(date.getDate() - Math.floor(Math.random() * DAYS_BACK));

  return date;
}

function generateStudentName(): string {
  const studentIndex = Math.floor(Math.random() * SEED_CONFIG.STUDENT_COUNT) + 1;
  return `学生${studentIndex}`;
}

function generateRecord() {
  return {
    emotion: generateEmotionValue(),
    date: generateRandomDate(),
    student: generateStudentName(),
    comment: COMMENTS[Math.floor(Math.random() * COMMENTS.length)] || null,
  };
}

async function main() {
  globalLogger.info('SEED', 'START', { recordCount: SEED_CONFIG.RECORD_COUNT });

  await prisma.record.deleteMany({});

  const records = Array.from({ length: SEED_CONFIG.RECORD_COUNT }, generateRecord);

  await prisma.record.createMany({
    data: records,
  });

  globalLogger.info('SEED', 'COMPLETE', { recordCount: records.length });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    globalLogger.error('SEED', 'ERROR', { error: (e as Error).message });
    await prisma.$disconnect();
    process.exit(1);
  });
