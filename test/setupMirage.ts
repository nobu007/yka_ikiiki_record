import { createServer, Factory, Model, Response } from 'miragejs';
import { calculateStats } from '@/utils/statsCalculator';

type Record = {
  emotion: number;
  date: string;
  student: string;
  comment: string;
};

const createTestServer = ({ environment = 'test' } = {}) => {
  const server = createServer({
    environment,

    models: {
      record: Model.extend<Partial<Record>>({}),
    },

    factories: {
      record: Factory.extend({
        emotion() {
          const rand = Math.random();
          if (rand < 0.1) return 1 + Math.random();
          if (rand < 0.3) return 2 + Math.random();
          if (rand < 0.7) return 3 + Math.random();
          if (rand < 0.9) return 4 + Math.random();
          return 4 + Math.random();
        },
        date() {
          const date = new Date();
          const hour = Math.floor(Math.random() * 24);
          const minutes = Math.floor(Math.random() * 60);
          date.setHours(hour, minutes);
          date.setDate(date.getDate() - Math.floor(Math.random() * 30));
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

    routes() {
      this.namespace = 'api';

      this.post('/seed', function (schema) {
        try {
          schema.db.emptyData();
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
          return calculateStats(records);
        } catch (error) {
          console.error('Stats Error:', error);
          return new Response(500, {}, { error: 'Failed to calculate stats' });
        }
      });
    },
  });

  return server;
};

// Jest setup用のグローバル設定
beforeEach(() => {
  createTestServer();
});

// テスト終了時にサーバーをシャットダウン
afterEach(() => {
  if (window.server) {
    window.server.shutdown();
  }
});

export { createTestServer };