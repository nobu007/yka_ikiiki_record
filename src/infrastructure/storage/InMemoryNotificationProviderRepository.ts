import {
  type NotificationProviderRepository,
  type NotificationProvider,
  NotificationProviderStatus,
} from "@/domain/repositories/NotificationProviderRepository";
import { type NotificationProvider as NotificationProviderEntity } from "@/domain/entities/NotificationProvider";

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

  async findById(id: string): Promise<NotificationProviderEntity | null> {
    return providerStorage.get(id) || null;
  }

  async findAll(): Promise<NotificationProviderEntity[]> {
    return Array.from(providerStorage.values());
  }

  async findProvidersByChannel(
    channel: string,
  ): Promise<NotificationProviderEntity[]> {
    const allProviders = await this.findAll();
    return allProviders.filter((p) => p.channels.includes(channel as any));
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

  clear(): void {
    providerStorage.clear();
    providerCounter = 0;
  }
}
