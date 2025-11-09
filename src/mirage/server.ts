import { createServer, Factory, Model, Response } from 'miragejs';
import { calculateStats } from '@/utils/statsCalculator';

type Record = {
  emotion: number;
  date: string;
  student: string;
  comment: string;
};

export function makeServer({ environment = 'development' } = {}) {
  const server = createServer({
    environment,

    models: {
      record: Model.extend<Partial<Record>>({}),
    },

    factories: {
      record: Factory.extend({
        emotion() {
          // より自然な分布になるように調整
          const rand = Math.random();
          if (rand < 0.1) return 1 + Math.random(); // 10%
          if (rand < 0.3) return 2 + Math.random(); // 20%
          if (rand < 0.7) return 3 + Math.random(); // 40%
          if (rand < 0.9) return 4 + Math.random(); // 20%
          return 4 + Math.random(); // 10%
        },
        date() {
          const date = new Date();
          // より現実的な時間分布
          const hour = Math.floor(Math.random() * 24);
          const minutes = Math.floor(Math.random() * 60);
          date.setHours(hour, minutes);
          date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // 過去30日
          return date.toISOString();
        },
        student() {
          return `学生${Math.floor(Math.random() * 25) + 1}`;
        },
        comment() {
          const comments = [
            '今日は充実した一日でした',
            '少し疲れました',
            'とても楽しかったです',
            '難しい課題に取り組みました',
            'チームでの作業が上手くいきました',
          ];
          return comments[Math.floor(Math.random() * comments.length)];
        },
      }),
    },

    seeds() {
      // 初期データはシードAPIで生成するため、ここでは空にしています
    },

    routes() {
      this.namespace = 'api';

      this.post('/seed', function (schema) {
        try {
          // 既存のデータをクリア
          schema.db.emptyData();

          // 新しいデータを生成（25名×30日分）
          Array.from({ length: 750 }).forEach(() => {
            schema.create('record', {});
          });

          return new Response(200, {}, { message: 'Data seeded successfully' });
        } catch (error) {
          console.error('Seed Error:', error);
          return new Response(500, {}, { error: 'Failed to seed data' });
        }
      });

      this.get('/stats', (schema) => {
        try {
          const records = schema.all('record').models;
          
          // Transform Mirage records to match calculateStats expected format
          const transformedRecords = records.map((record: any) => ({
            date: new Date(record.date),
            emotion: record.emotion,
            student: parseInt(record.student.replace('学生', '')) - 1, // Convert "学生1" to 0
            hour: new Date(record.date).getHours()
          }));
          
          return calculateStats(transformedRecords);
        } catch (error) {
          console.error('Stats Error:', error);
          return new Response(500, {}, { error: 'Failed to calculate stats' });
        }
      });
    },
  });

  return server;
}