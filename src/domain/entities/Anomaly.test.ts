import {
  AnomalySchema,
  AnomalySeverity,
  AnomalyType,
  DEFAULT_ANOMALY_DETECTION_CONFIG,
  type Anomaly,
  type AnomalyContext,
  type AnomalyDetectionConfig,
} from "@/domain/entities/Anomaly";

describe("Anomaly Domain Entity", () => {
  describe("AnomalySeverity Enum", () => {
    it("should have all severity levels", () => {
      expect(AnomalySeverity.LOW).toBe("low");
      expect(AnomalySeverity.MEDIUM).toBe("medium");
      expect(AnomalySeverity.HIGH).toBe("high");
      expect(AnomalySeverity.CRITICAL).toBe("critical");
    });

    it("should have exactly 4 severity levels", () => {
      const severities = Object.values(AnomalySeverity);
      expect(severities).toHaveLength(4);
    });
  });

  describe("AnomalyType Enum", () => {
    it("should have all anomaly types", () => {
      expect(AnomalyType.EMOTION_SPIKE).toBe("emotion_spike");
      expect(AnomalyType.EMOTION_DROP).toBe("emotion_drop");
      expect(AnomalyType.UNUSUAL_PATTERN).toBe("unusual_pattern");
      expect(AnomalyType.DATA_GAP).toBe("data_gap");
      expect(AnomalyType.OUTLIER).toBe("outlier");
    });

    it("should have exactly 5 anomaly types", () => {
      const types = Object.values(AnomalyType);
      expect(types).toHaveLength(5);
    });
  });

  describe("AnomalySchema Validation", () => {
    const validAnomaly = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: AnomalyType.EMOTION_SPIKE,
      severity: AnomalySeverity.HIGH,
      description: "Test anomaly",
      detectedAt: new Date(),
      context: {
        student: "Test Student",
        startDate: new Date(),
        endDate: new Date(),
        actualValue: 5,
        expectedValue: 3,
        deviation: 2,
      },
      recommendations: ["Test recommendation"],
      acknowledged: false,
    };

    it("should validate a correct anomaly object", () => {
      const result = AnomalySchema.safeParse(validAnomaly);
      expect(result.success).toBe(true);
    });

    it("should require id to be a valid UUID", () => {
      const invalidAnomaly = { ...validAnomaly, id: "not-a-uuid" };
      const result = AnomalySchema.safeParse(invalidAnomaly);
      expect(result.success).toBe(false);
    });

    it("should require description to be between 1 and 500 characters", () => {
      const tooShort = { ...validAnomaly, description: "" };
      const shortResult = AnomalySchema.safeParse(tooShort);
      expect(shortResult.success).toBe(false);

      const tooLong = {
        ...validAnomaly,
        description: "a".repeat(501),
      };
      const longResult = AnomalySchema.safeParse(tooLong);
      expect(longResult.success).toBe(false);
    });

    it("should require recommendations to be non-empty strings", () => {
      const emptyRecommendation = {
        ...validAnomaly,
        recommendations: [""],
      };
      const result = AnomalySchema.safeParse(emptyRecommendation);
      expect(result.success).toBe(false);
    });

    it("should allow optional context fields", () => {
      const anomalyWithoutStudent = {
        ...validAnomaly,
        context: {
          startDate: new Date(),
          endDate: new Date(),
          actualValue: 5,
          expectedValue: 3,
          deviation: 2,
        },
      };
      const result = AnomalySchema.safeParse(anomalyWithoutStudent);
      expect(result.success).toBe(true);
    });

    it("should allow optional metadata in context", () => {
      const anomalyWithMetadata = {
        ...validAnomaly,
        context: {
          ...validAnomaly.context,
          metadata: {
            extraField: "extra value",
            numberField: 42,
          },
        },
      };
      const result = AnomalySchema.safeParse(anomalyWithMetadata);
      expect(result.success).toBe(true);
    });

    it("should require acknowledged to be boolean", () => {
      const invalidAnomaly = {
        ...validAnomaly,
        acknowledged: "false" as unknown as boolean,
      };
      const result = AnomalySchema.safeParse(invalidAnomaly);
      expect(result.success).toBe(false);
    });
  });

  describe("DEFAULT_ANOMALY_DETECTION_CONFIG", () => {
    it("should have all required configuration fields", () => {
      expect(DEFAULT_ANOMALY_DETECTION_CONFIG).toHaveProperty(
        "stdDevThreshold",
      );
      expect(DEFAULT_ANOMALY_DETECTION_CONFIG).toHaveProperty(
        "minRecordsRequired",
      );
      expect(DEFAULT_ANOMALY_DETECTION_CONFIG).toHaveProperty(
        "enableEmotionSpikeDetection",
      );
      expect(DEFAULT_ANOMALY_DETECTION_CONFIG).toHaveProperty(
        "enableEmotionDropDetection",
      );
      expect(DEFAULT_ANOMALY_DETECTION_CONFIG).toHaveProperty(
        "enableUnusualPatternDetection",
      );
      expect(DEFAULT_ANOMALY_DETECTION_CONFIG).toHaveProperty(
        "enableDataGapDetection",
      );
      expect(DEFAULT_ANOMALY_DETECTION_CONFIG).toHaveProperty(
        "maxDataGapDays",
      );
    });

    it("should have sensible default values", () => {
      expect(DEFAULT_ANOMALY_DETECTION_CONFIG.stdDevThreshold).toBe(2);
      expect(DEFAULT_ANOMALY_DETECTION_CONFIG.minRecordsRequired).toBe(5);
      expect(
        DEFAULT_ANOMALY_DETECTION_CONFIG.enableEmotionSpikeDetection,
      ).toBe(true);
      expect(
        DEFAULT_ANOMALY_DETECTION_CONFIG.enableEmotionDropDetection,
      ).toBe(true);
      expect(
        DEFAULT_ANOMALY_DETECTION_CONFIG.enableUnusualPatternDetection,
      ).toBe(true);
      expect(
        DEFAULT_ANOMALY_DETECTION_CONFIG.enableDataGapDetection,
      ).toBe(true);
      expect(DEFAULT_ANOMALY_DETECTION_CONFIG.maxDataGapDays).toBe(7);
    });
  });

  describe("Anomaly Type Guards and Validators", () => {
    it("should correctly identify anomaly types", () => {
      const spikeAnomaly: Anomaly = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        type: AnomalyType.EMOTION_SPIKE,
        severity: AnomalySeverity.HIGH,
        description: "Emotion spike detected",
        detectedAt: new Date(),
        context: {
          startDate: new Date(),
          endDate: new Date(),
          actualValue: 5,
          expectedValue: 3,
          deviation: 2,
        },
        recommendations: ["Monitor student"],
        acknowledged: false,
      };

      expect(spikeAnomaly.type).toBe(AnomalyType.EMOTION_SPIKE);
      expect(spikeAnomaly.severity).toBe(AnomalySeverity.HIGH);
    });

    it("should handle different severity levels correctly", () => {
      const severities = [
        AnomalySeverity.LOW,
        AnomalySeverity.MEDIUM,
        AnomalySeverity.HIGH,
        AnomalySeverity.CRITICAL,
      ];

      severities.forEach((severity) => {
        const anomaly: Anomaly = {
          id: "550e8400-e29b-41d4-a716-446655440000",
          type: AnomalyType.EMOTION_DROP,
          severity,
          description: `Test ${severity} anomaly`,
          detectedAt: new Date(),
          context: {
            startDate: new Date(),
            endDate: new Date(),
            actualValue: 1,
            expectedValue: 3,
            deviation: 2,
          },
          recommendations: ["Test recommendation"],
          acknowledged: false,
        };

        expect(anomaly.severity).toBe(severity);
      });
    });
  });
});
