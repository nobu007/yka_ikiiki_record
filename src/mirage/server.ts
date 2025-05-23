import { createServer, Factory, Model, Response } from 'miragejs';

type StatData = {
  id: number;
  date: string;
  value: number;
};

export function makeServer({ environment = 'development' } = {}) {
  return createServer({
    environment,

    models: {
      stat: Model.extend<Partial<StatData>>({}),
    },

    factories: {
      stat: Factory.extend<Partial<StatData>>({
        id(i: number) {
          return i + 1;
        },
        date() {
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 30));
          return date.toISOString().split('T')[0];
        },
        value() {
          return Math.floor(Math.random() * 1000);
        },
      }),
    },

    seeds() {
      // 初期データはシードAPIで生成するため、ここでは空にしています
    },

    routes() {
      this.namespace = 'api';

      this.post('/seed', function (schema) {
        // 既存のデータをクリア
        schema.db.emptyData();

        // 新しいデータを生成
        Array.from({ length: 30 }).forEach(() => {
          schema.create('stat', {});
        });

        return new Response(200, {}, { message: 'Data seeded successfully' });
      });

      this.get('/stats', (schema) => {
        return schema.all('stat');
      });
    },
  });
}