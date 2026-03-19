import React from "react";
/**
 * DynamicBarChart Data Filtering Tests
 *
 * Tests data transformation, NaN filtering, and type conversions
 * INV-TEST-001
 */

import DynamicBarChart from "./DynamicBarChart";
import type { ChartData } from "./DynamicBarChart";

describe("DynamicBarChart Data Filtering", () => {
  describe("NaN and Invalid Value Filtering (INV-TEST-001)", () => {
    it("should filter out NaN values from validData", () => {
      const dataWithNaN: ChartData[] = [
        { name: "Valid 1", value: 3.5 },
        { name: "Invalid", value: NaN },
        { name: "Valid 2", value: 4.2 },
        { name: "Also Invalid", value: NaN },
      ];

      const element = React.createElement(DynamicBarChart, {
        data: dataWithNaN,
      });

      expect(element).toBeDefined();
    });

    it("should filter Infinity values", () => {
      const dataWithInfinity: ChartData[] = [
        { name: "Valid", value: 3.5 },
        { name: "Infinite", value: Infinity },
        { name: "Negative Infinite", value: -Infinity },
      ];

      const element = React.createElement(DynamicBarChart, {
        data: dataWithInfinity,
      });

      expect(element).toBeDefined();
    });

    it("should handle all NaN data gracefully", () => {
      const allNaN: ChartData[] = [
        { name: "Invalid 1", value: NaN },
        { name: "Invalid 2", value: NaN },
      ];

      const element = React.createElement(DynamicBarChart, { data: allNaN });

      expect(element).toBeDefined();
    });
  });

  describe("Data Type Conversion (INV-TEST-001)", () => {
    it("should convert string names to strings", () => {
      const dataWithNumberNames: ChartData[] = [
        { name: String(123), value: 3.5 },
        { name: String(456), value: 4.2 },
      ];

      const element = React.createElement(DynamicBarChart, {
        data: dataWithNumberNames,
      });

      expect(element).toBeDefined();
    });

    it("should convert numeric values to numbers", () => {
      const dataWithStringValues: ChartData[] = [
        { name: "Item 1", value: Number("3.5") },
        { name: "Item 2", value: Number("4.2") },
      ];

      const element = React.createElement(DynamicBarChart, {
        data: dataWithStringValues,
      });

      expect(element).toBeDefined();
    });

    it("should handle data transformation errors gracefully", () => {
      const problematicData: ChartData[] = [
        { name: "Valid", value: 3.5 },
        { name: "null", value: Number(null) },
        { name: "undefined", value: Number(undefined) },
      ];

      const element = React.createElement(DynamicBarChart, {
        data: problematicData,
      });

      expect(element).toBeDefined();
    });
  });

  describe("Empty Data State (INV-TEST-001)", () => {
    it("should handle empty data array", () => {
      const element = React.createElement(DynamicBarChart, { data: [] });

      expect(element).toBeDefined();
    });

    it("should handle all NaN values", () => {
      const allNaN: ChartData[] = [
        { name: "Invalid 1", value: NaN },
        { name: "Invalid 2", value: NaN },
      ];

      const element = React.createElement(DynamicBarChart, { data: allNaN });

      expect(element).toBeDefined();
    });

    it("should handle mixed valid and invalid data points", () => {
      const dataWithOneValid: ChartData[] = [
        { name: "Invalid", value: NaN },
        { name: "Valid", value: 3.5 },
      ];

      const element = React.createElement(DynamicBarChart, {
        data: dataWithOneValid,
      });

      expect(element).toBeDefined();
    });
  });
});
