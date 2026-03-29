import { AnomalyDetectionService } from "@/domain/services/AnomalyDetectionService";
import { AnomalyType, AnomalySeverity } from "@/domain/entities/Anomaly";
import type { Record } from "@/schemas/api";

describe("AnomalyDetectionService", () => {
  let service: AnomalyDetectionService;

  beforeEach(() => {
    service = new AnomalyDetectionService();
  });

  describe("Emotion Spike Detection", () => {
    it("should detect emotion spikes above threshold", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 3.2,
          date: new Date("2026-01-02"),
          student: "Test Student",
        },
        {
          id: 3,
          emotion: 2.9,
          date: new Date("2026-01-03"),
          student: "Test Student",
        },
        {
          id: 4,
          emotion: 3.1,
          date: new Date("2026-01-04"),
          student: "Test Student",
        },
        {
          id: 5,
          emotion: 5.0, // Spike
          date: new Date("2026-01-05"),
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      const spikeAnomalies = anomalies.filter(
        (a) => a.type === AnomalyType.EMOTION_SPIKE,
      );
      expect(spikeAnomalies).toHaveLength(1);
      expect(spikeAnomalies[0].context.student).toBe("Test Student");
      expect(spikeAnomalies[0].context.actualValue).toBe(5.0);
    });

    it("should not detect spikes with insufficient records", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 5.0, // Would be spike but insufficient records
          date: new Date("2026-01-02"),
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      expect(anomalies).toHaveLength(0);
    });
  });

  describe("Emotion Drop Detection", () => {
    it("should detect emotion drops below threshold", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 3.2,
          date: new Date("2026-01-02"),
          student: "Test Student",
        },
        {
          id: 3,
          emotion: 2.9,
          date: new Date("2026-01-03"),
          student: "Test Student",
        },
        {
          id: 4,
          emotion: 3.1,
          date: new Date("2026-01-04"),
          student: "Test Student",
        },
        {
          id: 5,
          emotion: 1.0, // Drop
          date: new Date("2026-01-05"),
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      const dropAnomalies = anomalies.filter(
        (a) => a.type === AnomalyType.EMOTION_DROP,
      );
      expect(dropAnomalies).toHaveLength(1);
      expect(dropAnomalies[0].context.student).toBe("Test Student");
      expect(dropAnomalies[0].context.actualValue).toBe(1.0);
    });
  });

  describe("Unusual Pattern Detection", () => {
    it("should detect consecutive records above mean", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 2.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 2.2,
          date: new Date("2026-01-02"),
          student: "Test Student",
        },
        {
          id: 3,
          emotion: 4.5,
          date: new Date("2026-01-03"),
          student: "Test Student",
        },
        {
          id: 4,
          emotion: 4.6,
          date: new Date("2026-01-04"),
          student: "Test Student",
        },
        {
          id: 5,
          emotion: 4.7,
          date: new Date("2026-01-05"),
          student: "Test Student",
        },
        {
          id: 6,
          emotion: 2.1,
          date: new Date("2026-01-06"),
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      const patternAnomalies = anomalies.filter(
        (a) => a.type === AnomalyType.UNUSUAL_PATTERN,
      );
      expect(patternAnomalies).toHaveLength(1);
      expect(patternAnomalies[0].context.student).toBe("Test Student");
    });

    it("should not detect pattern with fewer than 3 consecutive records", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 2.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 4.5,
          date: new Date("2026-01-02"),
          student: "Test Student",
        },
        {
          id: 3,
          emotion: 4.6,
          date: new Date("2026-01-03"),
          student: "Test Student",
        },
        {
          id: 4,
          emotion: 2.1,
          date: new Date("2026-01-04"),
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      const patternAnomalies = anomalies.filter(
        (a) => a.type === AnomalyType.UNUSUAL_PATTERN,
      );
      expect(patternAnomalies).toHaveLength(0);
    });
  });

  describe("Data Gap Detection", () => {
    it("should detect gaps larger than configured threshold", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 3.1,
          date: new Date("2026-01-10"), // 9 day gap
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      const gapAnomalies = anomalies.filter(
        (a) => a.type === AnomalyType.DATA_GAP,
      );
      expect(gapAnomalies).toHaveLength(1);
      expect(gapAnomalies[0].context.student).toBe("Test Student");
      expect(gapAnomalies[0].context.metadata?.gapDays).toBe(9);
    });

    it("should not detect gaps within threshold", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 3.1,
          date: new Date("2026-01-05"), // 4 day gap
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      const gapAnomalies = anomalies.filter(
        (a) => a.type === AnomalyType.DATA_GAP,
      );
      expect(gapAnomalies).toHaveLength(0);
    });
  });

  describe("Multiple Students", () => {
    it("should detect anomalies separately for each student", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Student A",
        },
        {
          id: 2,
          emotion: 3.1,
          date: new Date("2026-01-02"),
          student: "Student A",
        },
        {
          id: 3,
          emotion: 5.0, // Spike for Student A
          date: new Date("2026-01-03"),
          student: "Student A",
        },
        {
          id: 4,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Student B",
        },
        {
          id: 5,
          emotion: 3.1,
          date: new Date("2026-01-02"),
          student: "Student B",
        },
        {
          id: 6,
          emotion: 1.0, // Drop for Student B
          date: new Date("2026-01-03"),
          student: "Student B",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      const studentAAnomalies = anomalies.filter(
        (a) => a.context.student === "Student A",
      );
      const studentBAnomalies = anomalies.filter(
        (a) => a.context.student === "Student B",
      );

      expect(studentAAnomalies).toHaveLength(1);
      expect(studentAAnomalies[0].type).toBe(AnomalyType.EMOTION_SPIKE);

      expect(studentBAnomalies).toHaveLength(1);
      expect(studentBAnomalies[0].type).toBe(AnomalyType.EMOTION_DROP);
    });
  });

  describe("Configuration", () => {
    it("should respect custom stdDevThreshold", async () => {
      const customService = new AnomalyDetectionService({
        stdDevThreshold: 3, // Higher threshold
      });

      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 3.1,
          date: new Date("2026-01-02"),
          student: "Test Student",
        },
        {
          id: 3,
          emotion: 2.9,
          date: new Date("2026-01-03"),
          student: "Test Student",
        },
        {
          id: 4,
          emotion: 3.0,
          date: new Date("2026-01-04"),
          student: "Test Student",
        },
        {
          id: 5,
          emotion: 5.0,
          date: new Date("2026-01-05"),
          student: "Test Student",
        },
      ];

      const defaultAnomalies = await service.detectAnomalies(records);
      const customAnomalies = await customService.detectAnomalies(records);

      // Higher threshold should detect fewer anomalies
      expect(customAnomalies.length).toBeLessThan(defaultAnomalies.length);
    });

    it("should respect minRecordsRequired", async () => {
      const customService = new AnomalyDetectionService({
        minRecordsRequired: 10, // Higher threshold
      });

      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 5.0,
          date: new Date("2026-01-02"),
          student: "Test Student",
        },
      ];

      const anomalies = await customService.detectAnomalies(records);

      // Should not detect anomalies with insufficient records
      expect(anomalies).toHaveLength(0);
    });

    it("should allow disabling specific detection types", async () => {
      const customService = new AnomalyDetectionService({
        enableEmotionSpikeDetection: false,
        enableEmotionDropDetection: false,
        enableUnusualPatternDetection: false,
        enableDataGapDetection: true,
      });

      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 3.1,
          date: new Date("2026-01-02"),
          student: "Test Student",
        },
        {
          id: 3,
          emotion: 2.9,
          date: new Date("2026-01-03"),
          student: "Test Student",
        },
        {
          id: 4,
          emotion: 3.0,
          date: new Date("2026-01-04"),
          student: "Test Student",
        },
        {
          id: 5,
          emotion: 5.0,
          date: new Date("2026-01-05"),
          student: "Test Student",
        },
      ];

      const anomalies = await customService.detectAnomalies(records);

      // Should not detect spikes
      const spikeAnomalies = anomalies.filter(
        (a) => a.type === AnomalyType.EMOTION_SPIKE,
      );
      expect(spikeAnomalies).toHaveLength(0);
    });
  });

  describe("Severity Calculation", () => {
    it("should assign CRITICAL severity for extreme deviations", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 3.0,
          date: new Date("2026-01-02"),
          student: "Test Student",
        },
        {
          id: 3,
          emotion: 3.0,
          date: new Date("2026-01-03"),
          student: "Test Student",
        },
        {
          id: 4,
          emotion: 3.0,
          date: new Date("2026-01-04"),
          student: "Test Student",
        },
        {
          id: 5,
          emotion: 5.0, // Extreme spike
          date: new Date("2026-01-05"),
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      expect(anomalies[0].severity).toBe(AnomalySeverity.CRITICAL);
    });

    it("should assign appropriate severity for data gaps", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 3.1,
          date: new Date("2026-01-22"), // 21 day gap (3x threshold)
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      const gapAnomalies = anomalies.filter(
        (a) => a.type === AnomalyType.DATA_GAP,
      );
      expect(gapAnomalies[0].severity).toBe(AnomalySeverity.CRITICAL);
    });
  });

  describe("Recommendations", () => {
    it("should provide recommendations for spikes", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 3.0,
          date: new Date("2026-01-02"),
          student: "Test Student",
        },
        {
          id: 3,
          emotion: 3.0,
          date: new Date("2026-01-03"),
          student: "Test Student",
        },
        {
          id: 4,
          emotion: 3.0,
          date: new Date("2026-01-04"),
          student: "Test Student",
        },
        {
          id: 5,
          emotion: 5.0,
          date: new Date("2026-01-05"),
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      const spikeAnomalies = anomalies.filter(
        (a) => a.type === AnomalyType.EMOTION_SPIKE,
      );
      expect(spikeAnomalies[0].recommendations.length).toBeGreaterThan(0);
      expect(
        spikeAnomalies[0].recommendations.some((r) =>
          r.includes("Verify the accuracy"),
        ),
      ).toBe(true);
    });

    it("should provide recommendations for drops", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 3.0,
          date: new Date("2026-01-02"),
          student: "Test Student",
        },
        {
          id: 3,
          emotion: 3.0,
          date: new Date("2026-01-03"),
          student: "Test Student",
        },
        {
          id: 4,
          emotion: 3.0,
          date: new Date("2026-01-04"),
          student: "Test Student",
        },
        {
          id: 5,
          emotion: 1.0,
          date: new Date("2026-01-05"),
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      const dropAnomalies = anomalies.filter(
        (a) => a.type === AnomalyType.EMOTION_DROP,
      );
      expect(dropAnomalies[0].recommendations.length).toBeGreaterThan(0);
      expect(
        dropAnomalies[0].recommendations.some((r) =>
          r.includes("stressors"),
        ),
      ).toBe(true);
    });

    it("should provide recommendations for data gaps", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 3.1,
          date: new Date("2026-01-15"),
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);

      const gapAnomalies = anomalies.filter(
        (a) => a.type === AnomalyType.DATA_GAP,
      );
      expect(gapAnomalies[0].recommendations.length).toBeGreaterThan(0);
      expect(
        gapAnomalies[0].recommendations.some((r) =>
          r.includes("consistent daily recording"),
        ),
      ).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty records array", async () => {
      const anomalies = await service.detectAnomalies([]);
      expect(anomalies).toHaveLength(0);
    });

    it("should handle records with no dates", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Test Student",
        },
        {
          id: 2,
          emotion: 5.0,
          date: new Date("2026-01-01"), // Same date
          student: "Test Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);
      // Should still detect anomalies based on emotion values
      expect(anomalies.length).toBeGreaterThan(0);
    });

    it("should handle single student", async () => {
      const records: Record[] = [
        {
          id: 1,
          emotion: 3.0,
          date: new Date("2026-01-01"),
          student: "Only Student",
        },
        {
          id: 2,
          emotion: 5.0,
          date: new Date("2026-01-02"),
          student: "Only Student",
        },
      ];

      const anomalies = await service.detectAnomalies(records);
      // Should not detect anomalies with insufficient records
      expect(anomalies).toHaveLength(0);
    });
  });
});
