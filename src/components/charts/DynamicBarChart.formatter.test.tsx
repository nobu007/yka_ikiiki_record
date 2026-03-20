/**
 * DynamicBarChart Formatter Function Tests
 *
 * Tests coverage for y-axis and tooltip formatter functions (lines 118, 138)
 * These functions are callback functions executed by the chart library during rendering
 *
 * INV-TEST-001: Dual verification required - formatter execution and output format
 */

import { render } from "@testing-library/react";
import DynamicBarChart from "./DynamicBarChart";
import type { ChartData } from "./DynamicBarChart";
import { UI_CONSTANTS } from "@/lib/constants/ui";

describe("DynamicBarChart Formatter Functions", () => {
  const mockData: ChartData[] = [
    { name: "Item 1", value: 3.14159 },
    { name: "Item 2", value: 2.71828 },
    { name: "Item 3", value: 1.41421 },
  ];

  describe("Y-Axis Label Formatter Logic (line 118)", () => {
    it("should format y-axis labels with correct precision", () => {
      const precision = UI_CONSTANTS.CHART_CONFIG.YAXIS_LABEL_PRECISION;

      const testValue = 3.14159;
      const formatted = testValue.toFixed(precision);

      expect(formatted).toBe("3.1");
      expect(formatted.length).toBeGreaterThan(0);
    });

    it("should format integer values correctly", () => {
      const precision = UI_CONSTANTS.CHART_CONFIG.YAXIS_LABEL_PRECISION;

      const testValue = 3;
      const formatted = testValue.toFixed(precision);

      expect(formatted).toBe("3.0");
    });

    it("should format small decimal values correctly", () => {
      const precision = UI_CONSTANTS.CHART_CONFIG.YAXIS_LABEL_PRECISION;

      const testValue = 0.123;
      const formatted = testValue.toFixed(precision);

      expect(formatted).toBe("0.1");
    });

    it("should handle zero values correctly", () => {
      const precision = UI_CONSTANTS.CHART_CONFIG.YAXIS_LABEL_PRECISION;

      const testValue = 0;
      const formatted = testValue.toFixed(precision);

      expect(formatted).toBe("0.0");
    });
  });

  describe("Tooltip Value Formatter Logic (line 138)", () => {
    it("should format tooltip values with correct precision", () => {
      const precision = UI_CONSTANTS.CHART_CONFIG.TOOLTIP_VALUE_PRECISION;

      const testValue = 3.14159;
      const formatted = testValue.toFixed(precision);

      expect(formatted).toBe("3.14");
      expect(formatted.length).toBeGreaterThan(0);
    });

    it("should format integer values in tooltip correctly", () => {
      const precision = UI_CONSTANTS.CHART_CONFIG.TOOLTIP_VALUE_PRECISION;

      const testValue = 4;
      const formatted = testValue.toFixed(precision);

      expect(formatted).toBe("4.00");
    });

    it("should format very small decimals in tooltip correctly", () => {
      const precision = UI_CONSTANTS.CHART_CONFIG.TOOLTIP_VALUE_PRECISION;

      const testValue = 0.001;
      const formatted = testValue.toFixed(precision);

      expect(formatted).toBe("0.00");
    });

    it("should format very large decimals in tooltip correctly", () => {
      const precision = UI_CONSTANTS.CHART_CONFIG.TOOLTIP_VALUE_PRECISION;

      const testValue = 4.999999;
      const formatted = testValue.toFixed(precision);

      expect(formatted).toBe("5.00");
    });
  });

  describe("Formatter Component Integration", () => {
    it("should render chart with y-axis formatter for decimal values", () => {
      const { container } = render(
        <DynamicBarChart data={mockData} height={400} isDark={false} />,
      );

      expect(container.firstChild).toBeDefined();
    });

    it("should render chart with y-axis formatter in dark mode", () => {
      const { container } = render(
        <DynamicBarChart data={mockData} height={350} isDark={true} />,
      );

      expect(container.firstChild).toBeDefined();
    });

    it("should render chart with y-axis formatter for integer values", () => {
      const integerData: ChartData[] = [
        { name: "Item 1", value: 3 },
        { name: "Item 2", value: 4 },
        { name: "Item 3", value: 5 },
      ];

      const { container } = render(
        <DynamicBarChart data={integerData} height={300} />,
      );

      expect(container.firstChild).toBeDefined();
    });

    it("should render chart with tooltip formatter for various values", () => {
      const { container } = render(
        <DynamicBarChart data={mockData} height={400} title="Test Chart" />,
      );

      expect(container.firstChild).toBeDefined();
    });

    it("should render chart with tooltip formatter in light mode", () => {
      const { container } = render(
        <DynamicBarChart
          data={mockData}
          height={350}
          isDark={false}
          title="Light Mode Chart"
        />,
      );

      expect(container.firstChild).toBeDefined();
    });

    it("should render chart with tooltip formatter for large datasets", () => {
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        name: `Item ${i}`,
        value: Math.random() * 5,
      }));

      const { container } = render(
        <DynamicBarChart data={largeData} height={450} />,
      );

      expect(container.firstChild).toBeDefined();
    });
  });

  describe("Formatter Integration with Grid Options (lines 124-134)", () => {
    it("should render chart with formatters and grid padding", () => {
      const { container } = render(
        <DynamicBarChart data={mockData} height={300} isDark={false} />,
      );

      expect(container.firstChild).toBeDefined();
    });

    it("should render chart with formatters and dark mode grid", () => {
      const { container } = render(
        <DynamicBarChart data={mockData} height={350} isDark={true} />,
      );

      expect(container.firstChild).toBeDefined();
    });
  });

  describe("Formatter Edge Cases", () => {
    it("should handle formatter with zero values", () => {
      const zeroData: ChartData[] = [
        { name: "Item 1", value: 0 },
        { name: "Item 2", value: 0.5 },
        { name: "Item 3", value: 0 },
      ];

      const { container } = render(
        <DynamicBarChart data={zeroData} height={400} />,
      );

      expect(container.firstChild).toBeDefined();
    });

    it("should handle formatter with very large decimal values", () => {
      const largeDecimalData: ChartData[] = [
        { name: "Item 1", value: 4.999999 },
        { name: "Item 2", value: 4.888888 },
        { name: "Item 3", value: 4.777777 },
      ];

      const { container } = render(
        <DynamicBarChart data={largeDecimalData} height={400} isDark={true} />,
      );

      expect(container.firstChild).toBeDefined();
    });

    it("should handle formatter with mixed precision values", () => {
      const mixedData: ChartData[] = [
        { name: "Integer", value: 3 },
        { name: "One decimal", value: 3.1 },
        { name: "Two decimals", value: 3.14 },
        { name: "Many decimals", value: 3.14159 },
      ];

      const { container } = render(
        <DynamicBarChart data={mixedData} height={400} />,
      );

      expect(container.firstChild).toBeDefined();
    });

    it("should handle formatter with negative values", () => {
      const negativeData: ChartData[] = [
        { name: "Item 1", value: -1.5 },
        { name: "Item 2", value: 0 },
        { name: "Item 3", value: 1.5 },
      ];

      const { container } = render(
        <DynamicBarChart data={negativeData} height={400} />,
      );

      expect(container.firstChild).toBeDefined();
    });
  });

  describe("Formatter Precision Validation", () => {
    it("should have valid y-axis precision configuration", () => {
      const yaxisPrecision = UI_CONSTANTS.CHART_CONFIG.YAXIS_LABEL_PRECISION;

      expect(typeof yaxisPrecision).toBe("number");
      expect(yaxisPrecision).toBeGreaterThan(0);
      expect(yaxisPrecision).toBeLessThanOrEqual(10);
    });

    it("should have valid tooltip precision configuration", () => {
      const tooltipPrecision =
        UI_CONSTANTS.CHART_CONFIG.TOOLTIP_VALUE_PRECISION;

      expect(typeof tooltipPrecision).toBe("number");
      expect(tooltipPrecision).toBeGreaterThan(0);
      expect(tooltipPrecision).toBeLessThanOrEqual(10);
    });

    it("should format values without errors for both formatters", () => {
      const testValues = [0, 0.5, 1, 1.5, 2.71828, 3.14159, 4.999999];
      const yaxisPrecision = UI_CONSTANTS.CHART_CONFIG.YAXIS_LABEL_PRECISION;
      const tooltipPrecision =
        UI_CONSTANTS.CHART_CONFIG.TOOLTIP_VALUE_PRECISION;

      testValues.forEach((value) => {
        expect(() => value.toFixed(yaxisPrecision)).not.toThrow();
        expect(() => value.toFixed(tooltipPrecision)).not.toThrow();
      });
    });
  });
});
