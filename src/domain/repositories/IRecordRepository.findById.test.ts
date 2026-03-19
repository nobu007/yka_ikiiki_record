import { IRecordRepository } from "@/domain/repositories/IRecordRepository";
import {
  createMockRepository,
  createTestRecord,
} from "./IRecordRepository.test.setup";

describe("IRecordRepository - findById", () => {
  let repository: IRecordRepository;

  beforeEach(() => {
    repository = createMockRepository();
  });

  describe("findById", () => {
    it("should return null when record does not exist", async () => {
      const result = await repository.findById(999);

      expect(result).toBeNull();
    });

    it("should find a record by id", async () => {
      const record = createTestRecord({
        emotion: 4.5,
        date: new Date("2026-03-16T10:00:00Z"),
        student: "学生1",
      });

      const saved = await repository.save(record);
      const found = await repository.findById(saved.id!);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(saved.id);
      expect(found!.emotion).toBe(record.emotion);
    });

    it("should return record with all properties", async () => {
      const record = createTestRecord({
        emotion: 3.8,
        date: new Date("2026-03-16T10:00:00Z"),
        student: "学生1",
      });

      const saved = await repository.save(record);
      const found = await repository.findById(saved.id!);

      expect(found).not.toBeNull();
      expect(found!.emotion).toBe(record.emotion);
      expect(found!.date).toEqual(record.date);
      expect(found!.student).toBe(record.student);
    });

    it("should return correct record when multiple records exist", async () => {
      const record1 = createTestRecord({ student: "学生1" });
      const record2 = createTestRecord({ student: "学生2" });

      const saved1 = await repository.save(record1);
      await repository.save(record2);

      const found = await repository.findById(saved1.id!);

      expect(found).not.toBeNull();
      expect(found!.student).toBe("学生1");
    });
  });
});
