import { InMemoryAnomalyRepository } from "./InMemoryAnomalyRepository";
import {
  AnomalySeverity,
  AnomalyType,
  type Anomaly,
} from "@/domain/entities/Anomaly";

describe("InMemoryAnomalyRepository", () => {
  let repository: InMemoryAnomalyRepository;

  beforeEach(() => {
    repository = new InMemoryAnomalyRepository();
    repository.clear();
  });

  describe("save", () => {
    it("should assign sequential auto-incrementing IDs to new anomalies", async () => {
      const anomaly1 = createMockAnomaly({ id: undefined });
      const anomaly2 = createMockAnomaly({ id: undefined });

      const saved1 = await repository.save(anomaly1);
      const saved2 = await repository.save(anomaly2);

      expect(saved1.id).toBe("anomaly-1");
      expect(saved2.id).toBe("anomaly-2");
      expect(saved2.id).toBe(`${saved1.id!.split("-")[0]}-${parseInt(saved1.id!.split("-")[1]!) + 1}`);
    });

    it("should create new anomaly without id", async () => {
      const anomaly = createMockAnomaly({ id: undefined });
      const saved = await repository.save(anomaly);

      expect(saved.id).toBeDefined();
      expect(saved.id).toMatch(/^anomaly-\d+$/);
      expect(saved.detectedAt).toBeInstanceOf(Date);
    });

    it("should update existing anomaly with id", async () => {
      const anomaly = createMockAnomaly({ id: undefined });
      const saved = await repository.save(anomaly);

      const updated = await repository.save({
        ...saved,
        description: "Updated description",
      });

      expect(updated.id).toBe(saved.id);
      expect(updated.description).toBe("Updated description");
    });
  });

  describe("findById", () => {
    it("should return anomaly if found", async () => {
      const anomaly = createMockAnomaly({ id: undefined });
      const saved = await repository.save(anomaly);

      const found = await repository.findById(saved.id!);

      expect(found).toEqual(saved);
    });

    it("should return null if not found", async () => {
      const found = await repository.findById("non-existent-id");

      expect(found).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all stored anomalies", async () => {
      const anomaly1 = createMockAnomaly({ id: undefined });
      const anomaly2 = createMockAnomaly({ id: undefined });

      await repository.save(anomaly1);
      await repository.save(anomaly2);

      const all = await repository.findAll();

      expect(all).toHaveLength(2);
    });

    it("should return empty array if no storage", async () => {
      const all = await repository.findAll();

      expect(all).toEqual([]);
    });
  });

  describe("findByType", () => {
    it("should return anomalies matching type", async () => {
      const anomaly1 = createMockAnomaly({
        id: undefined,
        type: AnomalyType.EMOTION_SPIKE,
      });
      const anomaly2 = createMockAnomaly({
        id: undefined,
        type: AnomalyType.EMOTION_DROP,
      });

      await repository.save(anomaly1);
      await repository.save(anomaly2);

      const found = await repository.findByType(AnomalyType.EMOTION_SPIKE);

      expect(found).toHaveLength(1);
      expect(found[0].type).toBe(AnomalyType.EMOTION_SPIKE);
    });

    it("should return empty array if no match", async () => {
      const found = await repository.findByType(AnomalyType.EMOTION_SPIKE);

      expect(found).toEqual([]);
    });
  });

  describe("findBySeverity", () => {
    it("should return anomalies matching severity", async () => {
      const anomaly1 = createMockAnomaly({
        id: undefined,
        severity: AnomalySeverity.HIGH,
      });
      const anomaly2 = createMockAnomaly({
        id: undefined,
        severity: AnomalySeverity.LOW,
      });

      await repository.save(anomaly1);
      await repository.save(anomaly2);

      const found = await repository.findBySeverity(AnomalySeverity.HIGH);

      expect(found).toHaveLength(1);
      expect(found[0].severity).toBe(AnomalySeverity.HIGH);
    });

    it("should return empty array if no match", async () => {
      const found = await repository.findBySeverity(AnomalySeverity.CRITICAL);

      expect(found).toEqual([]);
    });
  });

  describe("findRecent", () => {
    it("should return anomalies detected within last N days", async () => {
      const now = new Date();
      const oldAnomaly = createMockAnomaly({
        id: undefined,
        detectedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      });
      const recentAnomaly = createMockAnomaly({
        id: undefined,
        detectedAt: new Date(now.getTime() - 1000), // 1 second ago
      });

      await repository.save(oldAnomaly);
      const savedRecent = await repository.save(recentAnomaly);

      const found = await repository.findRecent(7);

      expect(found).toHaveLength(1);
      expect(found[0].id).toBe(savedRecent.id);
    });

    it("should return empty array for days=0", async () => {
      const now = new Date();
      const anomaly = createMockAnomaly({
        id: undefined,
        detectedAt: new Date(now.getTime() - 1000), // 1 second ago
      });
      await repository.save(anomaly);

      const found = await repository.findRecent(0);

      expect(found).toEqual([]);
    });
  });

  describe("delete", () => {
    it("should delete anomaly and return true", async () => {
      const anomaly = createMockAnomaly({ id: undefined });
      const saved = await repository.save(anomaly);

      const deleted = await repository.delete(saved.id!);

      expect(deleted).toBe(true);
      const found = await repository.findById(saved.id!);
      expect(found).toBeNull();
    });

    it("should return false for non-existent id", async () => {
      const deleted = await repository.delete("non-existent-id");

      expect(deleted).toBe(false);
    });

    it("should handle delete(999) without throwing", async () => {
      const deleted = await repository.delete("999");

      expect(deleted).toBe(false);
    });
  });

  describe("clear", () => {
    it("should clear all storage and reset counter", async () => {
      const anomaly1 = createMockAnomaly({ id: undefined });
      const anomaly2 = createMockAnomaly({ id: undefined });

      await repository.save(anomaly1);
      await repository.save(anomaly2);

      repository.clear();

      const all = await repository.findAll();
      expect(all).toEqual([]);

      const anomaly3 = createMockAnomaly({ id: undefined });
      const saved = await repository.save(anomaly3);

      expect(saved.id).toBe("anomaly-1");
    });
  });
});

function createMockAnomaly(overrides?: Partial<Anomaly>): Anomaly {
  return {
    id: overrides?.id,
    type: overrides?.type ?? AnomalyType.EMOTION_SPIKE,
    severity: overrides?.severity ?? AnomalySeverity.MEDIUM,
    description: overrides?.description ?? "Test anomaly",
    detectedAt: overrides?.detectedAt ?? new Date(),
    context: {
      student: overrides?.context?.student ?? "Test Student",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-31"),
      actualValue: overrides?.context?.actualValue ?? 4.5,
      expectedValue: overrides?.context?.expectedValue ?? 3.0,
      deviation: overrides?.context?.deviation ?? 1.5,
      metadata: overrides?.context?.metadata,
    },
    recommendations: overrides?.recommendations ?? ["Recommendation 1"],
    acknowledged: overrides?.acknowledged ?? false,
  };
}
