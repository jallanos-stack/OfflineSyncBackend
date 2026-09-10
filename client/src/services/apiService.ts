import axios from 'axios';
import { db } from '../db/offlineDb';
import type { CreateRequestCommand, RequestDto } from '../types/index';

// Verifica que este puerto coincida exactamente con el puerto donde corre tu API .NET 8
const API_URL = 'http://localhost:5206/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  async createRequest(command: CreateRequestCommand): Promise<{ data?: RequestDto; offline: boolean }> {
    if (!navigator.onLine) {
      await db.requests.add({ ...command, createdAt: new Date().toISOString(), synced: false });
      return { offline: true };
    }

    try {
      const response = await api.post<RequestDto>('/requests', command);
      return { data: response.data, offline: false };
    } catch (error) {
      await db.requests.add({ ...command, createdAt: new Date().toISOString(), synced: false });
      return { offline: true };
    }
  },

  async getPendingRequests(): Promise<RequestDto[]> {
    if (!navigator.onLine) return [];
    try {
      const response = await api.get<RequestDto[]>('/requests/pending');
      return response.data;
    } catch {
      return [];
    }
  },

  async syncOfflineQueue(): Promise<number> {
    if (!navigator.onLine) return 0;

    // Obtener todos los registros guardados en IndexedDB
    const allLocal = await db.requests.toArray();
    const pendingLocal = allLocal.filter(item => !item.synced);
    let syncedCount = 0;

    for (const item of pendingLocal) {
      try {
        await api.post('/requests', {
          name: item.name,
          payload: item.payload,
          type: item.type,
        });

        // Eliminar de IndexedDB tras confirmación exitosa del backend
        if (item.localId !== undefined) {
          await db.requests.delete(item.localId);
        }
        syncedCount++;
      } catch (err) {
        console.error('Error al sincronizar elemento con la API:', item, err);
      }
    }

    return syncedCount;
  }
};