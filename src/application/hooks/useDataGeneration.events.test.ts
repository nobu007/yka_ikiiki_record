import { act } from "@testing-library/react";
import {
  setupTestHook,
  createMockOnGenerate,
  createMockEvent,
} from "./useDataGeneration.test.utils";

describe("useDataGeneration - Event Management", () => {
  let mockOnGenerate: jest.Mock;

  beforeEach(() => {
    mockOnGenerate = createMockOnGenerate();
    jest.clearAllMocks();
  });

  describe("event management - add events", () => {
    it("should add single event to event effects", () => {
      const { result } = setupTestHook(mockOnGenerate);
      const event = createMockEvent();

      act(() => {
        result.current.addEvent(event);
      });

      expect(result.current.config.eventEffects).toHaveLength(1);
      expect(result.current.config.eventEffects[0]).toEqual(event);
    });

    it("should add multiple events", () => {
      const { result } = setupTestHook(mockOnGenerate);
      const event1 = createMockEvent({ name: "Event 1" });
      const event2 = createMockEvent({ name: "Event 2", impact: -0.3 });

      act(() => {
        result.current.addEvent(event1);
        result.current.addEvent(event2);
      });

      expect(result.current.config.eventEffects).toHaveLength(2);
      expect(result.current.config.eventEffects[0]).toEqual(event1);
      expect(result.current.config.eventEffects[1]).toEqual(event2);
    });
  });

  describe("event management - remove events", () => {
    it("should remove event by index", () => {
      const { result } = setupTestHook(mockOnGenerate);
      const event1 = createMockEvent({ name: "Event 1" });
      const event2 = createMockEvent({ name: "Event 2", impact: -0.3 });

      act(() => {
        result.current.addEvent(event1);
        result.current.addEvent(event2);
        result.current.removeEvent(0);
      });

      expect(result.current.config.eventEffects).toHaveLength(1);
      expect(result.current.config.eventEffects[0]).toEqual(event2);
    });

    it("should handle removing non-existent index gracefully", () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.removeEvent(999);
      });

      expect(result.current.config.eventEffects).toHaveLength(0);
    });
  });
});
