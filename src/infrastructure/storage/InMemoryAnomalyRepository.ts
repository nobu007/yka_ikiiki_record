import {
  type AnomalyRepository,
  type AnomalyFilterOptions,
  type AnomalyStatistics,
} from "@/domain/repositories/AnomalyRepository";
import { type Anomaly as AnomalyEntity } from "@/domain/entities/Anomaly";

const anomalyStorage: Map<string, AnomalyEntity> = new Map();
let anomalyCounter = 0;

export class InMemoryAnomalyRepository implements AnomalyRepository {
  async save(anomaly: AnomalyEntity): Promise<AnomalyEntity> {
    const toSave = {
      ...anomaly,
      id: anomaly.id || `anomaly-${++anomalyCounter}`,
      detectedAt: anomaly.detectedAt || new Date(),
    };

    anomalyStorage.set(toSave.id, toSave);
    return toSave;
  }

  async findById(id: string): Promise<AnomalyEntity | undefined> {
    return anomalyStorage.get(id);
  }

  async findAll(options?: AnomalyFilterOptions): Promise<AnomalyEntity[]> {
    let results = Array.from(anomalyStorage.values());

    if (options?.severity !== undefined) {
      results = results.filter((a) => a.severity === options.severity);
    }
    if (options?.type !== undefined) {
      results = results.filter((a) => a.type === options.type);
    }
    if (options?.student !== undefined) {
      results = results.filter((a) => a.context.student === options.student);
    }
    if (options?.acknowledged !== undefined) {
      results = results.filter((a) => a.acknowledged === options.acknowledged);
    }
    if (options?.startDate !== undefined) {
      results = results.filter((a) => a.detectedAt >= options.startDate!);
    }
    if (options?.endDate !== undefined) {
      results = results.filter((a) => a.detectedAt <= options.endDate!);
    }

    const sortBy = options?.sortBy ?? "detectedAt";
    const sortOrder = options?.sortOrder ?? "desc";
    results.sort((a, b) => {
      const av: unknown = a[sortBy];
      const bv: unknown = b[sortBy];
      let cmp: number;
      if (av instanceof Date && bv instanceof Date) {
        cmp = av.getTime() - bv.getTime();
      } else if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    if (options?.offset !== undefined) {
      results = results.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  async findBySeverity(severity: string): Promise<AnomalyEntity[]> {
    const allAnomalies = await this.findAll();
    return allAnomalies.filter((a) => a.severity === severity);
  }

  async findByType(type: string): Promise<AnomalyEntity[]> {
    const allAnomalies = await this.findAll();
    return allAnomalies.filter((a) => a.type === type);
  }

  async findUnacknowledged(): Promise<AnomalyEntity[]> {
    const allAnomalies = await this.findAll();
    return allAnomalies.filter((a) => !a.acknowledged);
  }

  async findByStudent(student: string): Promise<AnomalyEntity[]> {
    const allAnomalies = await this.findAll();
    return allAnomalies.filter((a) => a.context.student === student);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AnomalyEntity[]> {
    const allAnomalies = await this.findAll();
    return allAnomalies.filter(
      (a) => a.detectedAt >= startDate && a.detectedAt <= endDate,
    );
  }

  async acknowledge(id: string): Promise<AnomalyEntity | undefined> {
    const anomaly = anomalyStorage.get(id);
    if (!anomaly) {
      return undefined;
    }

    const updated: AnomalyEntity = { ...anomaly, acknowledged: true };
    anomalyStorage.set(id, updated);
    return updated;
  }

  async findRecent(days: number): Promise<AnomalyEntity[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const allAnomalies = await this.findAll();
    return allAnomalies.filter((a) => a.detectedAt >= cutoff);
  }

  async delete(id: string): Promise<boolean> {
    return anomalyStorage.delete(id);
  }

  async deleteOldAnomalies(beforeDate: Date): Promise<number> {
    let deleted = 0;
    for (const [id, anomaly] of anomalyStorage) {
      if (anomaly.detectedAt < beforeDate) {
        anomalyStorage.delete(id);
        deleted++;
      }
    }
    return deleted;
  }

  async getStatistics(): Promise<AnomalyStatistics> {
    const all = Array.from(anomalyStorage.values());
    const bySeverity: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const anomaly of all) {
      bySeverity[anomaly.severity] = (bySeverity[anomaly.severity] ?? 0) + 1;
      byType[anomaly.type] = (byType[anomaly.type] ?? 0) + 1;
    }

    const mostCommon = (counts: Record<string, number>): string => {
      let best = "none";
      let bestCount = -1;
      for (const [key, count] of Object.entries(counts)) {
        if (count > bestCount) {
          best = key;
          bestCount = count;
        }
      }
      return best;
    };

    return {
      total: all.length,
      unacknowledged: all.filter((a) => !a.acknowledged).length,
      bySeverity,
      byType,
      mostCommonType: mostCommon(byType),
      mostCommonSeverity: mostCommon(bySeverity),
    };
  }

  clear(): void {
    anomalyStorage.clear();
    anomalyCounter = 0;
  }
}
