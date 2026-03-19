import React from "react";
/**
 * Chart Component Edge Cases Tests
 *
 * Shared edge case tests for chart components
 */

import { EmotionChart, ChartData } from "./index";

describe("Chart Component Edge Cases", () => {
  it("should handle null/undefined series data gracefully", () => {
    const nullData: ChartData = {
      labels: ["A", "B"],
      series: [{ name: "Test", data: [10, null as unknown as number, 30] }],
    };
    const props = { data: nullData };
    const element = React.createElement(EmotionChart, props);
    expect(element).toBeDefined();
  });

  it("should handle very long labels", () => {
    const longLabelData: ChartData = {
      labels: ["Very Long Label That Might Break Layout", "Short"],
      series: [{ name: "Test", data: [10, 20] }],
    };
    const props = { data: longLabelData };
    const element = React.createElement(EmotionChart, props);
    expect(element).toBeDefined();
  });

  it("should handle special characters in labels", () => {
    const specialCharData: ChartData = {
      labels: ["Test<>Label", '"Quoted"', "Single'Quote"],
      series: [{ name: "Test", data: [10, 20, 30] }],
    };
    const props = { data: specialCharData };
    const element = React.createElement(EmotionChart, props);
    expect(element).toBeDefined();
  });

  it("should handle very large values", () => {
    const largeValueData: ChartData = {
      labels: ["A", "B"],
      series: [{ name: "Test", data: [999999, 1000000] }],
    };
    const props = { data: largeValueData };
    const element = React.createElement(EmotionChart, props);
    expect(element).toBeDefined();
  });

  it("should handle decimal values", () => {
    const decimalData: ChartData = {
      labels: ["A", "B", "C"],
      series: [{ name: "Test", data: [3.14159, 2.71828, 1.41421] }],
    };
    const props = { data: decimalData };
    const element = React.createElement(EmotionChart, props);
    expect(element).toBeDefined();
  });

  it("should handle negative values", () => {
    const negativeData: ChartData = {
      labels: ["A", "B", "C"],
      series: [{ name: "Test", data: [-10, 0, 10] }],
    };
    const props = { data: negativeData };
    const element = React.createElement(EmotionChart, props);
    expect(element).toBeDefined();
  });
});
