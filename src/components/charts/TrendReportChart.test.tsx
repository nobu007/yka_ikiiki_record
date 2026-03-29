import React from "react";
import { render } from "@testing-library/react";
import { TrendReportChart } from "./TrendReportChart";
import {
  createTrendDataPoint,
  createStudentTrendAnalysis,
  createClassTrendAnalysis,
  type StudentTrendAnalysis,
  type ClassTrendAnalysis,
} from "@/domain/entities/TrendAnalysis";

describe("TrendReportChart", () => {
  const createMockStudentAnalysis = (): StudentTrendAnalysis => {
    const dataPoints = [
      createTrendDataPoint({
        date: new Date("2026-03-01"),
        emotion: 3.0,
        recordCount: 5,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-02"),
        emotion: 3.2,
        recordCount: 4,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-03"),
        emotion: 3.5,
        recordCount: 6,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-04"),
        emotion: 3.8,
        recordCount: 5,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-05"),
        emotion: 4.0,
        recordCount: 7,
      }),
    ];

    return createStudentTrendAnalysis({
      student: "Alice",
      dataPoints,
    });
  };

  const createMockClassAnalysis = (): ClassTrendAnalysis => {
    const aliceData = [
      createTrendDataPoint({
        date: new Date("2026-03-01"),
        emotion: 3.0,
        recordCount: 5,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-02"),
        emotion: 3.5,
        recordCount: 4,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-03"),
        emotion: 4.0,
        recordCount: 6,
      }),
    ];

    const bobData = [
      createTrendDataPoint({
        date: new Date("2026-03-01"),
        emotion: 2.5,
        recordCount: 4,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-02"),
        emotion: 2.8,
        recordCount: 5,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-03"),
        emotion: 3.0,
        recordCount: 5,
      }),
    ];

    const charlieData = [
      createTrendDataPoint({
        date: new Date("2026-03-01"),
        emotion: 3.5,
        recordCount: 6,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-02"),
        emotion: 3.8,
        recordCount: 5,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-03"),
        emotion: 4.2,
        recordCount: 7,
      }),
    ];

    const alice = createStudentTrendAnalysis({
      student: "Alice",
      dataPoints: aliceData,
    });

    const bob = createStudentTrendAnalysis({
      student: "Bob",
      dataPoints: bobData,
    });

    const charlie = createStudentTrendAnalysis({
      student: "Charlie",
      dataPoints: charlieData,
    });

    return createClassTrendAnalysis({
      className: "Class 3-A",
      studentAnalyses: [alice, bob, charlie],
    });
  };

  describe("Component Definition", () => {
    it("should be defined", () => {
      expect(TrendReportChart).toBeDefined();
    });

    it("should have correct displayName", () => {
      expect(TrendReportChart.displayName).toBe("TrendReportChart");
    });

    it("should accept required props", () => {
      const analysis = createMockStudentAnalysis();
      const props = { analysis };
      const element = React.createElement(TrendReportChart, props);
      expect(element).toBeDefined();
      expect(element.props.analysis).toEqual(analysis);
    });
  });

  describe("Student Trend Analysis", () => {
    it("should render student trend chart", () => {
      const analysis = createMockStudentAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container).toBeInTheDocument();
    });

    it("should display student name in title", () => {
      const analysis = createMockStudentAnalysis();
      const { getByText } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(getByText(/Trend Report: Alice/i)).toBeInTheDocument();
    });

    it("should display custom title when provided", () => {
      const analysis = createMockStudentAnalysis();
      const customTitle = "Custom Analysis Title";
      const { getByText } = render(
        <TrendReportChart analysis={analysis} title={customTitle} />,
      );

      expect(getByText(customTitle)).toBeInTheDocument();
    });

    it("should display correct metrics for student", () => {
      const analysis = createMockStudentAnalysis();
      const { getByText } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(getByText("Average")).toBeInTheDocument();
      expect(getByText("Start")).toBeInTheDocument();
      expect(getByText("End")).toBeInTheDocument();
      expect(getByText("Volatility")).toBeInTheDocument();
      expect(getByText("Records")).toBeInTheDocument();
    });

    it("should display trend direction badge for up trend", () => {
      const analysis = createMockStudentAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      const badge = container.querySelector(".text-green-600");
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toContain("Improving");
    });

    it("should display data points count", () => {
      const analysis = createMockStudentAnalysis();
      const { getByText } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(getByText(/5 data points/i)).toBeInTheDocument();
    });
  });

  describe("Class Trend Analysis", () => {
    it("should render class trend chart", () => {
      const analysis = createMockClassAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container).toBeInTheDocument();
    });

    it("should display class name in title", () => {
      const analysis = createMockClassAnalysis();
      const { getByText } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(getByText(/Trend Report: Class 3-A/i)).toBeInTheDocument();
    });

    it("should display correct metrics for class", () => {
      const analysis = createMockClassAnalysis();
      const { getByText } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(getByText("Average")).toBeInTheDocument();
      expect(getByText("Start")).toBeInTheDocument();
      expect(getByText("End")).toBeInTheDocument();
      expect(getByText("Volatility")).toBeInTheDocument();
      expect(getByText("Students")).toBeInTheDocument();
    });

    it("should display total students count", () => {
      const analysis = createMockClassAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container.textContent).toContain("3");
    });
  });

  describe("Moving Average Feature", () => {
    it("should not show moving average by default", () => {
      const analysis = createMockStudentAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container.textContent).not.toContain("Moving Average");
    });

    it("should show moving average when enabled", () => {
      const analysis = createMockStudentAnalysis();
      const { container } = render(
        <TrendReportChart
          analysis={analysis}
          showMovingAverage={true}
          movingAverageWindow={3}
        />,
      );

      expect(container).toBeInTheDocument();
    });

    it("should use custom window size for moving average", () => {
      const analysis = createMockStudentAnalysis();
      const { container } = render(
        <TrendReportChart
          analysis={analysis}
          showMovingAverage={true}
          movingAverageWindow={4}
        />,
      );

      expect(container).toBeInTheDocument();
    });

    it("should handle moving average with insufficient data", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.0,
          recordCount: 1,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Test",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart
          analysis={analysis}
          showMovingAverage={true}
          movingAverageWindow={3}
        />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe("Annotations Feature", () => {
    it("should show annotations for class analysis by default", () => {
      const analysis = createMockClassAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} showAnnotations={true} />,
      );

      expect(container).toBeInTheDocument();
    });

    it("should not show annotations when disabled", () => {
      const analysis = createMockClassAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} showAnnotations={false} />,
      );

      expect(container).toBeInTheDocument();
    });

    it("should handle class with no top performers", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.0,
          recordCount: 5,
        }),
      ];

      const alice = createStudentTrendAnalysis({
        student: "Alice",
        dataPoints,
      });

      const bob = createStudentTrendAnalysis({
        student: "Bob",
        dataPoints,
      });

      const analysis = createClassTrendAnalysis({
        className: "Class 3-B",
        studentAnalyses: [alice, bob],
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} showAnnotations={true} />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe("Theme Support", () => {
    it("should render with light theme by default", () => {
      const analysis = createMockStudentAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} isDark={false} />,
      );

      expect(container).toBeInTheDocument();
    });

    it("should render with dark theme", () => {
      const analysis = createMockStudentAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} isDark={true} />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe("Custom Height", () => {
    it("should use default height", () => {
      const analysis = createMockStudentAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container).toBeInTheDocument();
    });

    it("should use custom height", () => {
      const analysis = createMockStudentAnalysis();
      const customHeight = 500;
      const { container } = render(
        <TrendReportChart analysis={analysis} height={customHeight} />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty data points", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.0,
          recordCount: 1,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Minimal",
        dataPoints,
      });

      const { getByText } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(getByText(/1 data points/i)).toBeInTheDocument();
    });

    it("should handle single data point", () => {
      const dataPoint = createTrendDataPoint({
        date: new Date("2026-03-01"),
        emotion: 3.5,
        recordCount: 5,
      });

      const analysis = createStudentTrendAnalysis({
        student: "Single",
        dataPoints: [dataPoint],
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container).toBeInTheDocument();
    });

    it("should handle stable trend", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.0,
          recordCount: 5,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-02"),
          emotion: 3.05,
          recordCount: 4,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-03"),
          emotion: 3.0,
          recordCount: 6,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Stable",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      const badge = container.querySelector(".text-gray-600");
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toContain("Stable");
    });

    it("should handle downward trend", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 4.0,
          recordCount: 5,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-02"),
          emotion: 3.5,
          recordCount: 4,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-03"),
          emotion: 3.0,
          recordCount: 6,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Declining",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      const badge = container.querySelector(".text-red-600");
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toContain("Declining");
    });

    it("should handle large number of data points", () => {
      const dataPoints = Array.from({ length: 50 }, (_, i) =>
        createTrendDataPoint({
          date: new Date(`2026-03-${((i % 30) + 1).toString().padStart(2, "0")}`),
          emotion: 3.0 + (i % 20) * 0.1,
          recordCount: 5,
        }),
      );

      const analysis = createStudentTrendAnalysis({
        student: "Many Points",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container).toBeInTheDocument();
      expect(container.textContent).toContain("50 data points");
    });

    it("should handle class with single student", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.0,
          recordCount: 5,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-02"),
          emotion: 3.5,
          recordCount: 4,
        }),
      ];

      const student = createStudentTrendAnalysis({
        student: "Only Student",
        dataPoints,
      });

      const analysis = createClassTrendAnalysis({
        className: "Single Student Class",
        studentAnalyses: [student],
      });

      const { getByText } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(getByText(/1/i)).toBeInTheDocument();
    });

    it("should handle class with many students", () => {
      const studentAnalyses = Array.from({ length: 20 }, (_, i) => {
        const dataPoints = [
          createTrendDataPoint({
            date: new Date("2026-03-01"),
            emotion: 3.0 + i * 0.1,
            recordCount: 5,
          }),
        ];

        return createStudentTrendAnalysis({
          student: `Student ${i + 1}`,
          dataPoints,
        });
      });

      const analysis = createClassTrendAnalysis({
        className: "Large Class",
        studentAnalyses,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container).toBeInTheDocument();
      expect(container.textContent).toContain("20");
    });
  });

  describe("Metrics Display", () => {
    it("should display average emotion correctly", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.0,
          recordCount: 1,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-02"),
          emotion: 4.0,
          recordCount: 1,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Average Test",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container.textContent).toContain("3.50");
    });

    it("should display volatility correctly", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 1.0,
          recordCount: 1,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-02"),
          emotion: 5.0,
          recordCount: 1,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Volatile",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      const volatility = analysis.metrics.volatility;
      expect(container.textContent).toContain(volatility.toFixed(2));
    });

    it("should display total records for student", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.0,
          recordCount: 5,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-02"),
          emotion: 3.5,
          recordCount: 10,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Records Test",
        dataPoints,
      });

      const { getByText } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(getByText("15")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      const analysis = createMockStudentAnalysis();
      const { getByRole } = render(
        <TrendReportChart analysis={analysis} />,
      );

      const region = getByRole("region");
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute("aria-label");
      expect(region.getAttribute("aria-label")).toContain("Trend Report");
    });

    it("should have proper heading structure", () => {
      const analysis = createMockStudentAnalysis();
      const { getByRole } = render(
        <TrendReportChart analysis={analysis} />,
      );

      const heading = getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it("should announce loading state", () => {
      const analysis = createMockStudentAnalysis();
      const { getByRole } = render(
        <TrendReportChart analysis={analysis} />,
      );

      const status = getByRole("status");
      expect(status).toBeInTheDocument();
    });

    it("should announce no data state", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.0,
          recordCount: 1,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Empty",
        dataPoints,
      });

      const { getByRole } = render(
        <TrendReportChart analysis={analysis} />,
      );

      const status = getByRole("status");
      expect(status).toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    it("should format dates correctly in x-axis", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.0,
          recordCount: 1,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-15"),
          emotion: 3.5,
          recordCount: 1,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Date Test",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container).toBeInTheDocument();
    });

    it("should handle dates across month boundaries", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-02-28"),
          emotion: 3.0,
          recordCount: 1,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.5,
          recordCount: 1,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-31"),
          emotion: 4.0,
          recordCount: 1,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Month Boundary",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe("TrendDirectionBadge Component", () => {
    it("should render up trend badge", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.0,
          recordCount: 1,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-02"),
          emotion: 4.0,
          recordCount: 1,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Up",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container.textContent).toContain("↑");
      expect(container.textContent).toContain("Improving");
    });

    it("should render down trend badge", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 4.0,
          recordCount: 1,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-02"),
          emotion: 3.0,
          recordCount: 1,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Down",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container.textContent).toContain("↓");
      expect(container.textContent).toContain("Declining");
    });

    it("should render stable trend badge", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.0,
          recordCount: 1,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-02"),
          emotion: 3.02,
          recordCount: 1,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Stable",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container.textContent).toContain("→");
      expect(container.textContent).toContain("Stable");
    });
  });

  describe("MetricsPanel Component", () => {
    it("should render all student metrics", () => {
      const analysis = createMockStudentAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container.textContent).toContain("Average");
      expect(container.textContent).toContain("Start");
      expect(container.textContent).toContain("End");
      expect(container.textContent).toContain("Volatility");
      expect(container.textContent).toContain("Records");
    });

    it("should render all class metrics", () => {
      const analysis = createMockClassAnalysis();
      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      expect(container.textContent).toContain("Students");
    });

    it("should display metric values with correct precision", () => {
      const dataPoints = [
        createTrendDataPoint({
          date: new Date("2026-03-01"),
          emotion: 3.14159,
          recordCount: 1,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-02"),
          emotion: 2.71828,
          recordCount: 1,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Precision",
        dataPoints,
      });

      const { container } = render(
        <TrendReportChart analysis={analysis} />,
      );

      const avg = analysis.metrics.averageEmotion;
      expect(container.textContent).toContain(avg.toFixed(2));
    });
  });
});
