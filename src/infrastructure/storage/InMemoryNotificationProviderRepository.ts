import {
  type NotificationProviderRepository,
  type NotificationProviderFilterOptions,
  type NotificationProviderStatistics,
} from "@/domain/repositories/NotificationProviderRepository";
import {
  type NotificationProvider as NotificationProviderEntity,
  NotificationProviderStatus,
  type NotificationChannel,
  type NotificationProviderType,
} from "@/domain/entities/NotificationProvider";

const providerStorage: Map<string, NotificationProviderEntity> = new Map();
let providerCounter = 0;

export class InMemoryNotificationProviderRepository
  implements NotificationProviderRepository
{
  async save(provider: NotificationProviderEntity): Promise<NotificationProviderEntity> {
    const toSave = {
      ...provider,
      id: provider.id || `provider-${++providerCounter}`,
      createdAt: provider.createdAt || new Date(),
      updatedAt: new Date(),
    };

    providerStorage.set(toSave.id, toSave);
    return toSave;
  }

  async findById(id: string): Promise<NotificationProviderEntity | undefined> {
    return providerStorage.get(id);
  }

  async findAll(
    options?: NotificationProviderFilterOptions,
  ): Promise<NotificationProviderEntity[]> {
    let results = Array.from(providerStorage.values());

    if (options?.type !== undefined) {
      results = results.filter((p) => p.type === options.type);
    }
    if (options?.status !== undefined) {
      results = results.filter((p) => p.status === options.status);
    }
    if (options?.channel !== undefined) {
      results = results.filter((p) => p.channels.includes(options.channel!));
    }

    const sortBy = options?.sortBy ?? "createdAt";
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

  async findByType(type: NotificationProviderType): Promise<NotificationProviderEntity[]> {
    const allProviders = await this.findAll();
    return allProviders.filter((p) => p.type === type);
  }

  async findByStatus(
    status: NotificationProviderStatus,
  ): Promise<NotificationProviderEntity[]> {
    const allProviders = await this.findAll();
    return allProviders.filter((p) => p.status === status);
  }

  async findByChannel(
    channel: NotificationChannel,
  ): Promise<NotificationProviderEntity[]> {
    const allProviders = await this.findAll();
    return allProviders.filter((p) => p.channels.includes(channel));
  }

  async findActiveProviders(): Promise<NotificationProviderEntity[]> {
    const allProviders = await this.findAll();
    return allProviders.filter(
      (p) => p.status === NotificationProviderStatus.ACTIVE,
    );
  }

  async findProvidersByChannel(
    channel: NotificationChannel,
  ): Promise<NotificationProviderEntity[]> {
    return this.findByChannel(channel);
  }

  async updateStatus(
    id: string,
    status: NotificationProviderStatus,
  ): Promise<NotificationProviderEntity | undefined> {
    const provider = providerStorage.get(id);
    if (!provider) {
      return undefined;
    }

    const updated: NotificationProviderEntity = {
      ...provider,
      status,
      updatedAt: new Date(),
    };

    providerStorage.set(id, updated);
    return updated;
  }

  async updateLastUsed(
    id: string,
    lastUsedAt: Date,
  ): Promise<NotificationProviderEntity | undefined> {
    const provider = providerStorage.get(id);
    if (!provider) {
      return undefined;
    }

    const updated: NotificationProviderEntity = {
      ...provider,
      lastUsedAt,
      updatedAt: new Date(),
    };

    providerStorage.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return providerStorage.delete(id);
  }

  async getStatistics(): Promise<NotificationProviderStatistics> {
    const all = Array.from(providerStorage.values());
    const byType: Record<string, number> = {};
    const byChannel: Record<string, number> = {};

    for (const provider of all) {
      byType[provider.type] = (byType[provider.type] ?? 0) + 1;
      for (const channel of provider.channels) {
        byChannel[channel] = (byChannel[channel] ?? 0) + 1;
      }
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
      active: all.filter((p) => p.status === NotificationProviderStatus.ACTIVE)
        .length,
      inactive: all.filter(
        (p) => p.status === NotificationProviderStatus.INACTIVE,
      ).length,
      suspended: all.filter(
        (p) => p.status === NotificationProviderStatus.SUSPENDED,
      ).length,
      byType,
      byChannel,
      mostUsedType: mostCommon(byType),
      mostUsedChannel: mostCommon(byChannel),
    };
  }

  clear(): void {
    providerStorage.clear();
    providerCounter = 0;
  }
}
