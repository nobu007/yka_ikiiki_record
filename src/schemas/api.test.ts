import { RecordSchema } from "./api";
import { EMOTION_RANGES } from "@/lib/constants";

describe("RecordSchema", () => {
  describe("valid records", () => {
    it("should accept a valid record with all fields", () => {
      const validRecord = {
        id: 1,
        emotion: 3.5,
        date: new Date("2026-03-20"),
        student: "Student1",
        comment: "Good progress",
        createdAt: new Date("2026-03-20"),
        updatedAt: new Date("2026-03-20"),
      };

      const result = RecordSchema.safeParse(validRecord);

      expect(result.success).toBe(true);
    });

    it("should accept a valid record with only required fields", () => {
      const minimalRecord = {
        emotion: 3.0,
        date: new Date("2026-03-20"),
        student: "Student1",
      };

      const result = RecordSchema.safeParse(minimalRecord);

      expect(result.success).toBe(true);
    });

    it("should accept emotion at minimum boundary", () => {
      const record = {
        emotion: EMOTION_RANGES.MIN,
        date: new Date("2026-03-20"),
        student: "Student1",
      };

      const result = RecordSchema.safeParse(record);

      expect(result.success).toBe(true);
    });

    it("should accept emotion at maximum boundary", () => {
      const record = {
        emotion: EMOTION_RANGES.MAX,
        date: new Date("2026-03-20"),
        student: "Student1",
      };

      const result = RecordSchema.safeParse(record);

      expect(result.success).toBe(true);
    });

    it("should accept comment at maximum length", () => {
      const record = {
        emotion: 3.0,
        date: new Date("2026-03-20"),
        student: "Student1",
        comment: "x".repeat(500),
      };

      const result = RecordSchema.safeParse(record);

      expect(result.success).toBe(true);
    });
  });

  describe("invalid records", () => {
    it("should reject record with emotion below minimum", () => {
      const invalidRecord = {
        emotion: EMOTION_RANGES.MIN - 0.1,
        date: new Date("2026-03-20"),
        student: "Student1",
      };

      const result = RecordSchema.safeParse(invalidRecord);

      expect(result.success).toBe(false);
      if (!result.success) {
        const firstError = result.error.errors[0];
        expect(firstError?.message).toMatch(/greater than or equal to/);
      }
    });

    it("should reject record with emotion above maximum", () => {
      const invalidRecord = {
        emotion: EMOTION_RANGES.MAX + 0.1,
        date: new Date("2026-03-20"),
        student: "Student1",
      };

      const result = RecordSchema.safeParse(invalidRecord);

      expect(result.success).toBe(false);
    });

    it("should reject record with empty student name", () => {
      const invalidRecord = {
        emotion: 3.0,
        date: new Date("2026-03-20"),
        student: "",
      };

      const result = RecordSchema.safeParse(invalidRecord);

      expect(result.success).toBe(false);
    });

    it("should reject record with student name too long", () => {
      const invalidRecord = {
        emotion: 3.0,
        date: new Date("2026-03-20"),
        student: "x".repeat(101),
      };

      const result = RecordSchema.safeParse(invalidRecord);

      expect(result.success).toBe(false);
    });

    it("should reject record with comment too long", () => {
      const invalidRecord = {
        emotion: 3.0,
        date: new Date("2026-03-20"),
        student: "Student1",
        comment: "x".repeat(501),
      };

      const result = RecordSchema.safeParse(invalidRecord);

      expect(result.success).toBe(false);
    });

    it("should reject record with invalid id (zero)", () => {
      const invalidRecord = {
        id: 0,
        emotion: 3.0,
        date: new Date("2026-03-20"),
        student: "Student1",
      };

      const result = RecordSchema.safeParse(invalidRecord);

      expect(result.success).toBe(false);
    });

    it("should reject record with invalid id (negative)", () => {
      const invalidRecord = {
        id: -1,
        emotion: 3.0,
        date: new Date("2026-03-20"),
        student: "Student1",
      };

      const result = RecordSchema.safeParse(invalidRecord);

      expect(result.success).toBe(false);
    });

    it("should reject record with missing required fields", () => {
      const incompleteRecord = {
        emotion: 3.0,
      };

      const result = RecordSchema.safeParse(incompleteRecord);

      expect(result.success).toBe(false);
    });
  });

  describe("type inference", () => {
    it("should correctly infer TypeScript type", () => {
      const record = {
        id: 1,
        emotion: 3.5,
        date: new Date("2026-03-20"),
        student: "Student1",
        comment: "Good progress",
      };

      const result = RecordSchema.safeParse(record);

      expect(result.success).toBe(true);
    });
  });
});
