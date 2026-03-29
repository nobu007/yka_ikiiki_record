import {
  type AnomalyRepository,
  type Anomaly,
  AnomalySeverity,
  AnomalyType,
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

  async findById(id: string): Promise<AnomalyEntity | null> {
    return anomalyStorage.get(id) || null;
  }

  async findAll(): Promise<AnomalyEntity[]> {
    return Array.from(anomalyStorage.values());
  }

  async findByType(type: AnomalyType): Promise<AnomalyEntity[]> {
    const allAnomalies = await this.findAll();
    return allAnomalies.filter((a) => a.type === type);
  }

  async findBySeverity(severity: AnomalySeverity): Promise<AnomalyEntity[]> {
    const allAnomalies = await this.findAll();
    return allAnomalies.filter((a) => a.severity === severity);
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

  clear(): void {
    anomalyStorage.clear();
    anomalyCounter = 0;
  }
}
