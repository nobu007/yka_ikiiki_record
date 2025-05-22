import { createServer, Model, Factory, Response } from "miragejs";
import { faker } from "@faker-js/faker/locale/ja";

// レコードの型定義
interface RecordAttributes {
  date: string;
  student: string;
  emotion: number;
  comment: string;
}

export function makeServer() {
  return createServer({
    models: {
      record: Model.extend<Partial<RecordAttributes>>({})
    },
    factories: {
      record: Factory.extend({
        date() {
          // 日付の範囲を定数として定義
          const DATE_RANGE = {
            from: "2024-04-01",
            to: "2025-03-31"
          } as const;

          return faker.date.between({
            from: DATE_RANGE.from,
            to: DATE_RANGE.to
          }).toISOString();
        },
        student() {
          return faker.person.fullName();
        },
        emotion() {
          // 感情値の範囲を定数として定義
          const EMOTION_RANGE = {
            min: 1,
            max: 5
          } as const;

          return faker.number.int({
            min: EMOTION_RANGE.min,
            max: EMOTION_RANGE.max
          });
        },
        comment() {
          return faker.lorem.sentence({ min: 12, max: 24 });
        },
      }),
    },
    routes() {
      this.namespace = "api";

      this.post("/seed", (_schema, request) => {
        try {
          const { students = 25, days = 365 } = JSON.parse(request.requestBody);

          // 入力値の検証
          if (students <= 0 || days <= 0) {
            return new Response(400, {}, {
              error: "Students and days must be positive numbers"
            });
          }

          const total = students * days;

          // 既存レコードの削除
          _schema.all("record").destroy();

          // ファクトリーを使用して指定数のレコードを生成
          Array.from({ length: total }).forEach(() => {
            this.create("record");
          });

          return new Response(201, {}, { total, students, days });
        } catch (error) {
          console.error("Seed error:", error);
          return new Response(500, {}, { error: "Internal server error" });
        }
      });

      this.get("/stats", (schema) => {
        try {
          const records = schema.all("record");
          const count = records.length;

          if (count === 0) {
            return { count: 0, avgEmotion: "0.00" };
          }

          // 感情値の集計
          const sum = records.models.reduce((acc, record) => {
            return acc + record.emotion;
          }, 0);

          const avgEmotion = (sum / count).toFixed(2);
          return {
            count,
            avgEmotion
          };
        } catch (error) {
          console.error("Stats error:", error);
          return new Response(500, {}, { error: "Internal server error" });
        }
      });
    }
  });
}