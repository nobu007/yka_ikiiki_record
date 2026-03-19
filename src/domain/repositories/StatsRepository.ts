import { Stats } from "../entities/Stats";

export interface StatsRepository {
  getStats(): Promise<Stats>;
  saveStats(stats: Stats): Promise<void>;
  generateSeedData(): Promise<void>;
}
