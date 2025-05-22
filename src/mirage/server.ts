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
    environment: process.env.NODE_ENV ?? "development",

    models: {
      record: Model.extend<Partial<RecordAttributes>>({})
    },

    timing: 0, // 即時レスポンス
    factories: {
      record: Factory.extend({
        date() {
          // 現在の日付から1年間の範囲を設定
          const today = new Date();
          const oneYearLater = new Date();
          oneYearLater.setFullYear(today.getFullYear() + 1);

          // 日付範囲をISOString形式で保持
          const DATE_RANGE = {
            from: today.toISOString(),
            to: oneYearLater.toISOString()
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
          // ベース感情値（1-5）に微細な変動を加える
          const baseEmotion = faker.number.int({ min: 1, max: 5 });
          const variation = faker.number.float({ min: -0.2, max: 0.2 });

          // 1-5の範囲内に収める
          return Math.max(1, Math.min(5, baseEmotion + variation));
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
          const records = schema.all("record").models;
          const count = records.length;

          if (count === 0) {
            return new Response(200, {}, {
              count: 0,
              avgEmotion: "0.00",
              monthlyStats: []
            });
          }

          // 感情値の全体平均を計算
          const sum = records.reduce((acc, record) => {
            return acc + record.attrs.emotion;
          }, 0);

          // 月別の統計を計算
          const monthlyData = new Map();

          records.forEach(record => {
            const date = new Date(record.attrs.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData.has(monthKey)) {
              monthlyData.set(monthKey, {
                month: monthKey,
                count: 0,
                sum: 0
              });
            }

            const monthStats = monthlyData.get(monthKey);
            monthStats.count++;
            monthStats.sum += record.attrs.emotion;
          });

          // 月別平均を計算し、配列に変換
          const monthlyStats = Array.from(monthlyData.values())
            .map(({ month, count, sum }) => ({
              month,
              avgEmotion: (sum / count).toFixed(2),
              count
            }))
            .sort((a, b) => a.month.localeCompare(b.month));

          return new Response(200, {}, {
            count,
            avgEmotion: (sum / count).toFixed(2),
            monthlyStats
          });
        } catch (error) {
          console.error("Stats error:", error);
          return new Response(500, {}, { error: "Internal server error" });
        }
      });
    }
  });
}