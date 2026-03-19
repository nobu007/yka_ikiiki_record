import { EventEffect } from "./DataGeneration";

describe("EventEffect", () => {
  it("should create valid EventEffect", () => {
    // Arrange
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-01-07");
    const eventEffect: EventEffect = {
      name: "文化祭",
      startDate,
      endDate,
      impact: 0.3,
    };

    // Assert
    expect(eventEffect.name).toBe("文化祭");
    expect(eventEffect.startDate).toBe(startDate);
    expect(eventEffect.endDate).toBe(endDate);
    expect(eventEffect.impact).toBe(0.3);
  });

  it("should handle positive and negative impacts", () => {
    // Arrange
    const positiveEvent: EventEffect = {
      name: "体育祭",
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-06-03"),
      impact: 0.5,
    };

    const negativeEvent: EventEffect = {
      name: "試験期間",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-02-05"),
      impact: -0.4,
    };

    // Assert
    expect(positiveEvent.impact).toBeGreaterThan(0);
    expect(negativeEvent.impact).toBeLessThan(0);
  });

  it("should handle zero impact events", () => {
    // Arrange
    const neutralEvent: EventEffect = {
      name: "通常授業",
      startDate: new Date("2024-04-01"),
      endDate: new Date("2024-04-01"),
      impact: 0,
    };

    // Assert
    expect(neutralEvent.impact).toBe(0);
  });

  it("should validate date ranges", () => {
    // Arrange
    const startDate = new Date("2024-03-01");
    const endDate = new Date("2024-03-05");
    const eventEffect: EventEffect = {
      name: "春休み",
      startDate,
      endDate,
      impact: 0.2,
    };

    // Assert
    expect(eventEffect.endDate.getTime()).toBeGreaterThan(
      eventEffect.startDate.getTime(),
    );
  });
});
