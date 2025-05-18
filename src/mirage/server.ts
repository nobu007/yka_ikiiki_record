import { createServer, Model, Factory, Response } from "miragejs";
import { faker } from "@faker-js/faker/locale/ja";

export function makeServer() {
  return createServer({
    models: {
      record: Model,
    },
    factories: {
      record: Factory.extend({
        date() { return faker.date.between({ from: "2024-04-01", to: "2025-03-31" }).toISOString(); },
        student() { return faker.person.fullName(); },
        emotion() { return faker.number.int({min: 1, max: 5}); },
        comment() { return faker.lorem.sentence({ min: 12, max: 24 }); },
      }),
    },
    routes() {
      this.namespace = "api";

      this.post("/seed", (_schema, request) => {
        const { students = 25, days = 365 } = JSON.parse(request.requestBody);
        const total = students * days;
        _schema.all("record").destroy();
        Array.from({ length: total }).forEach(() => {
          _schema.create("record");
        });
        return new Response(201, {}, { total });
      });

      this.get("/stats", (schema) => {
        const records = schema.all("record").models;
        if (records.length === 0) {
          return { count: 0, avgEmotion: "0.00" };
        }
        // 例: 日次平均感情スコアを集計
        const avg = records.reduce((s,r)=>s+r.emotion,0)/records.length;
        return { count: records.length, avgEmotion: avg.toFixed(2) };
      });
    }
  });
}