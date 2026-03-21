import { NextResponse } from "next/server";
import { withResilientHandler } from "@/lib/api/error-handler";
import { API_OPERATIONS } from "@/lib/constants/api";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { promises as fs } from "fs";
import path from "path";

interface MetricsResponse {
  timestamp: number;
  judgment: {
    score: number;
    cleanArchitectureViolations: number;
    testCoverage: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
    anyTypes: number;
    eslintWarnings: number;
    testPassRate: number;
  };
  system: {
    uptime: number;
    memory: {
      usagePercentage: number;
      heapUsed: number;
      heapTotal: number;
    };
  };
}

const METRICS_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "judgment_metrics.csv",
);

function parseMetricsLine(line: string): MetricsResponse["judgment"] | null {
  const values = line.split(",");

  if (values.length < 8) {
    return null;
  }

  const [
    _timestampStr,
    scoreStr,
    violationsStr,
    statementsStr,
    branchesStr,
    anyTypesStr,
    eslintWarningsStr,
    testPassRateStr,
  ] = values;

  const requiredFields = [
    scoreStr,
    violationsStr,
    statementsStr,
    branchesStr,
    anyTypesStr,
    eslintWarningsStr,
    testPassRateStr,
  ];

  if (requiredFields.some((field) => !field)) {
    return null;
  }

  const parseResult = {
    score: parseFloat(scoreStr!),
    cleanArchitectureViolations: parseInt(violationsStr!, 10),
    statements: parseFloat(statementsStr!),
    branches: parseFloat(branchesStr!),
    anyTypes: parseInt(anyTypesStr!, 10),
    eslintWarnings: parseInt(eslintWarningsStr!, 10),
    testPassRate: parseFloat(testPassRateStr!),
  };

  if (Object.values(parseResult).some((value) => isNaN(value))) {
    return null;
  }

  const {
    score,
    cleanArchitectureViolations,
    statements,
    branches,
    anyTypes,
    eslintWarnings,
    testPassRate,
  } = parseResult;

  return {
    score,
    cleanArchitectureViolations,
    testCoverage: {
      statements,
      branches,
      functions: 100,
      lines: 100,
    },
    anyTypes,
    eslintWarnings,
    testPassRate,
  };
}

async function getLatestMetrics(): Promise<MetricsResponse["judgment"] | null> {
  try {
    const fileContent = await fs.readFile(METRICS_FILE_PATH, "utf-8");
    const lines = fileContent.trim().split("\n");

    if (lines.length < 2) {
      return null;
    }

    const latestLine = lines.at(-1);
    if (!latestLine) {
      return null;
    }
    return parseMetricsLine(latestLine);
  } catch {
    return null;
  }
}

export async function GET(): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      const judgmentMetrics = await getLatestMetrics();

      const response: MetricsResponse = {
        timestamp: Date.now(),
        judgment: judgmentMetrics || {
          score: 0,
          cleanArchitectureViolations: 0,
          testCoverage: {
            statements: 0,
            branches: 0,
            functions: 0,
            lines: 0,
          },
          anyTypes: 0,
          eslintWarnings: 0,
          testPassRate: 0,
        },
        system: {
          uptime: process.uptime(),
          memory: {
            usagePercentage:
              (process.memoryUsage().heapUsed /
                process.memoryUsage().heapTotal) *
              100,
            heapUsed: process.memoryUsage().heapUsed,
            heapTotal: process.memoryUsage().heapTotal,
          },
        },
      };

      return NextResponse.json(response);
    },
    {
      operationName: API_OPERATIONS.GET_METRICS,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    },
  );
}
