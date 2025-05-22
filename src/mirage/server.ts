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
        date(i: number) {
          const today = new Date();
          const startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);

          // インデックスから日付を計算（25名の学生で1日分のデータ）
          const dayOffset = Math.floor(i / 25);
          startDate.setDate(startDate.getDate() + dayOffset);

          return startDate.toISOString();
        },
        student(i: number) {
          // 学生IDを固定（1-25をループ）
          return `Student ${String(i % 25 + 1).padStart(2, '0')}`;
        },
        emotion(i: number) {
          // 日付を再計算
          const today = new Date();
          const startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);
          const dayOffset = Math.floor(i / 25);
          startDate.setDate(startDate.getDate() + dayOffset);

          const month = startDate.getMonth();
          const studentId = i % 25;

          // 月ごとの基準感情値
          const monthlyBase = [
            3.5,  // 4月: 新学期で期待と不安
            3.8,  // 5月: GW明けで活気
            3.2,  // 6月: 梅雨で少し下降
            3.0,  // 7月: テスト期間でストレス
            4.0,  // 8月: 夏休みで上昇
            3.5,  // 9月: 2学期開始
            3.3,  // 10月: 秋の疲れ
            3.2,  // 11月: 寒さの影響
            3.0,  // 12月: テスト・年末で忙しい
            3.8,  // 1月: 新年で回復
            3.2,  // 2月: 寒さのピーク
            3.7   // 3月: 春の訪れ
          ];

          // 学生ごとの基本性格（0-1の範囲で固定）
          const studentPersonality = studentId / 24;

          // 学生の性格による変動幅（-0.5～+0.5）
          const personalityEffect = studentPersonality - 0.5;

          // 日々の変動（-0.3～+0.3）
          const dailyVariation = faker.number.float({ min: -0.3, max: 0.3 });

          // 最終的な感情値を計算（1-5の範囲に収める）
          return Math.max(1, Math.min(5,
            monthlyBase[month] + personalityEffect + dailyVariation
          ));
        },
        comment() {
          return faker.lorem.sentence({ min: 12, max: 24 });
        }
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