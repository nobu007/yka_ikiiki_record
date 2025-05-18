import { createServer, Model, Factory, Response } from "miragejs";
import { faker } from "@faker-js/faker/locale/ja";

export function makeServer() {
  return createServer({
    models: {
      record: Model,
    },
    factories: {
      record: Factory.extend({
        date() { return faker.date.recent({ days: 365 }).toISOString(); },
        student() { return faker.person.fullName(); },
        emotion() { return faker.helpers.arrayElement([1,2,3,4,5]); },
        comment() { return faker.lorem.sentence({ min: 12, max: 24 }); },
      }),
    },
    routes() {
      this.namespace = "api";

      this.post("/seed", (_schema, request) => {
        const { students = 25 } = JSON.parse(request.requestBody);
        const total = students * 365;
        _schema.all("record").destroy();
        Array.from({ length: total }).forEach(() => {
          _schema.create("record");
        });
        return new Response(201, {}, { total });
      });

      this.get("/stats", (schema) => {
        const records = schema.all("record").models;
        // 例: 日次平均感情スコアを集計
        const avg = records.reduce((s,r)=>s+r.emotion,0)/records.length;
        return { count: records.length, avgEmotion: avg.toFixed(2) };
      });
    }
  });
}