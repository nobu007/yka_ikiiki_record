import { prisma } from '@/lib/prisma';
import { withDatabaseTimeout } from '@/lib/resilience/timeout';

const COMMENTS = [
  '今日は充実した一日でした',
  '少し疲れました',
  'とても楽しかったです',
  '難しい課題に取り組みました',
  'チームでの作業が上手くいきました',
] as const;

export async function generateSeedData() {
  await withDatabaseTimeout(prisma.record.deleteMany({}));

  const records = Array.from({ length: 750 }, () => {
    const emotion = Math.random();
    let emotionValue: number;

    if (emotion < 0.1) emotionValue = 1 + Math.random();
    else if (emotion < 0.3) emotionValue = 2 + Math.random();
    else if (emotion < 0.7) emotionValue = 3 + Math.random();
    else if (emotion < 0.9) emotionValue = 4 + Math.random();
    else emotionValue = 4 + Math.random();

    const date = new Date();
    const hour = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    date.setHours(hour, minutes);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    const student = `学生${Math.floor(Math.random() * 25) + 1}`;
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
