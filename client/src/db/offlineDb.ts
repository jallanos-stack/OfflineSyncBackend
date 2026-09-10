import Dexie from 'dexie';
import type { OfflineRequestItem } from '../types/index';

export class OfflineDatabase extends Dexie {
  requests!: Dexie.Table<OfflineRequestItem, number>;

  constructor() {
    super('OfflineSyncClientDB');

    this.version(1).stores({
      requests: '++localId, name, type, synced, createdAt'
    });
  }
}

export const db = new OfflineDatabase();