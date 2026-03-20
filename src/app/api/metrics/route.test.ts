import { GET } from "./route";
import { promises as fs } from "fs";
import path from "path";

const METRICS_FILE_PATH = path.join(process.cwd(), "data", "judgment_metrics.csv");

describe("GET /api/metrics", () => {
  const originalReadFile = fs.readFile;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    fs.readFile = originalReadFile;
  });

  it("should return metrics with 200 status", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("timestamp");
    expect(data).toHaveProperty("judgment");
    expect(data).toHaveProperty("system");
  });

  it("should return judgment metrics structure", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.judgment).toHaveProperty("score");
    expect(data.judgment).toHaveProperty("cleanArchitectureViolations");
    expect(data.judgment).toHaveProperty("testCoverage");
    expect(data.judgment.testCoverage).toHaveProperty("statements");
    expect(data.judgment.testCoverage).toHaveProperty("branches");
    expect(data.judgment.testCoverage).toHaveProperty("functions");
    expect(data.judgment.testCoverage).toHaveProperty("lines");
    expect(data.judgment).toHaveProperty("anyTypes");
    expect(data.judgment).toHaveProperty("eslintWarnings");
    expect(data.judgment).toHaveProperty("testPassRate");
  });

  it("should return system metrics structure", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.system).toHaveProperty("uptime");
    expect(data.system).toHaveProperty("memory");
    expect(data.system.memory).toHaveProperty("usagePercentage");
    expect(data.system.memory).toHaveProperty("heapUsed");
    expect(data.system.memory).toHaveProperty("heapTotal");
  });

  it("should return numeric values for all metrics", async () => {
    const response = await GET();
    const data = await response.json();

    expect(typeof data.timestamp).toBe("number");
    expect(typeof data.judgment.score).toBe("number");
    expect(typeof data.judgment.cleanArchitectureViolations).toBe("number");
    expect(typeof data.judgment.testCoverage.statements).toBe("number");
    expect(typeof data.judgment.testCoverage.branches).toBe("number");
    expect(typeof data.judgment.testCoverage.functions).toBe("number");
    expect(typeof data.judgment.testCoverage.lines).toBe("number");
    expect(typeof data.judgment.anyTypes).toBe("number");
    expect(typeof data.judgment.eslintWarnings).toBe("number");
    expect(typeof data.judgment.testPassRate).toBe("number");
    expect(typeof data.system.uptime).toBe("number");
    expect(typeof data.system.memory.usagePercentage).toBe("number");
    expect(typeof data.system.memory.heapUsed).toBe("number");
    expect(typeof data.system.memory.heapTotal).toBe("number");
  });

  it("should return valid uptime", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.system.uptime).toBeGreaterThan(0);
  });

  it("should return valid memory metrics", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.system.memory.heapUsed).toBeGreaterThan(0);
    expect(data.system.memory.heapTotal).toBeGreaterThan(0);
    expect(data.system.memory.heapUsed).toBeLessThanOrEqual(data.system.memory.heapTotal);
    expect(data.system.memory.usagePercentage).toBeGreaterThanOrEqual(0);
    expect(data.system.memory.usagePercentage).toBeLessThanOrEqual(100);
  });

  describe("error handling - malformed CSV", () => {
    it("should return default metrics when CSV file has less than 2 lines", async () => {
      fs.readFile = jest.fn().mockResolvedValue("timestamp,judgment_score\n");

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.judgment.score).toBe(0);
      expect(data.judgment.cleanArchitectureViolations).toBe(0);
      expect(data.judgment.testCoverage.statements).toBe(0);
    });

    it("should return default metrics when CSV last line is empty", async () => {
      fs.readFile = jest.fn().mockResolvedValue("timestamp,judgment_score\n100,0\n");

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.judgment.score).toBe(0);
    });

    it("should return default metrics when CSV has less than 8 values", async () => {
      fs.readFile = jest
        .fn()
        .mockResolvedValue("timestamp,judgment_score\n2026-03-20T18:49:03,100");

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.judgment.score).toBe(0);
    });

    it("should return default metrics when CSV has missing required fields", async () => {
      fs.readFile = jest
        .fn()
        .mockResolvedValue(
          "timestamp,judgment_score,violations,statements,branches,any_types\n2026-03-20T18:49:03,100,0,99.15,96.87,0"
        );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.judgment.score).toBe(0);
    });

    it("should return default metrics when file read fails", async () => {
      fs.readFile = jest.fn().mockRejectedValue(new Error("File not found"));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.judgment.score).toBe(0);
      expect(data.judgment.cleanArchitectureViolations).toBe(0);
    });
  });
});
