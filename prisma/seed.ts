import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMMENTS = [
  '今日は充実した一日でした',
  '少し疲れました',
  'とても楽しかったです',
  '難しい課題に取り組みました',
  'チームでの作業が上手くいきました',
];

async function main() {
  console.log('Start seeding...');

  await prisma.record.deleteMany({});

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
      comment,
    };
  });

  await prisma.record.createMany({
    data: records,
  });

  console.log(`Seeding finished with ${records.length} records.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
