import React, { useState, useEffect } from 'react';
import { apiService } from './services/apiService';
import { db } from './db/offlineDb';
import { useLiveQuery } from 'dexie-react-hooks';
import type { RequestDto } from './types';

export function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [name, setName] = useState('');
  const [payload, setPayload] = useState('');
  const [type, setType] = useState('TEXT_TRANSFORM');
  const [serverRequests, setServerRequests] = useState<RequestDto[]>([]);
  const [message, setMessage] = useState('');

  // Escuchar estado de conexión de la red
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Consultar cola local de IndexedDB
  const offlineQueue = useLiveQuery(() => db.requests.toArray()) || [];

  const loadServerData = async () => {
    const data = await apiService.getPendingRequests();
    setServerRequests(data);
  };

  useEffect(() => {
    if (isOnline) {
      loadServerData();
    }
  }, [isOnline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !payload) return;

    const result = await apiService.createRequest({ name, payload, type });

    if (result.offline) {
      setMessage('⚠️ Sin conexión o servidor inalcanzable. Guardado localmente en IndexedDB.');
    } else {
      setMessage('✅ Solicitud enviada directamente al backend .NET 8.');
      loadServerData();
    }

    setName('');
    setPayload('');
  };

  const handleSync = async () => {
    const synced = await apiService.syncOfflineQueue();
    if (synced > 0) {
      setMessage(`🔄 Se sincronizaron ${synced} solicitudes pendientes con el servidor.`);
      loadServerData();
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', fontFamily: 'system-ui, sans-serif', padding: '0 1rem' }}>
      <h1>OfflineSync Client (.NET 8 + React)</h1>

      {/* Indicador de Estado de Red */}
      <div style={{
        padding: '0.75rem 1rem',
        borderRadius: '6px',
        color: '#fff',
        backgroundColor: isOnline ? '#2e7d32' : '#c62828',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }}>
        Estado del sistema: {isOnline ? '🟢 CONECTADO (Online)' : '🔴 SIN CONEXIÓN (Offline)'}
      </div>

      {message && <p style={{ padding: '0.5rem', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>{message}</p>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        <h3>Crear Nueva Solicitud</h3>
        <input
          type="text"
          placeholder="Nombre de la solicitud"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '0.5rem' }}
          required
        />
        <input
          type="text"
          placeholder="Payload / Contenido"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          style={{ padding: '0.5rem' }}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '0.5rem' }}>
          <option value="TEXT_TRANSFORM">TEXT_TRANSFORM</option>
          <option value="DATA_PROCESSING">DATA_PROCESSING</option>
        </select>
        <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Guardar / Enviar
        </button>
      </form>

      {/* Cola Local en IndexedDB */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>📦 Cola Local Pendiente de Sincronizar ({offlineQueue.length})</h3>
        {offlineQueue.length === 0 ? <p>No hay datos pendientes localmente.</p> : (
          <ul>
            {offlineQueue.map((item) => (
              <li key={item.localId}>
                <strong>{item.name}</strong> ({item.type}) - <em>Pendiente de sync</em>
              </li>
            ))}
          </ul>
        )}
        {isOnline && offlineQueue.length > 0 && (
          <button onClick={handleSync} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Sincronizar Ahora
          </button>
        )}
      </div>

      {/* Registros en el Backend */}
      <div>
        <h3>🌐 Registros en el Backend (.NET 8)</h3>
        {serverRequests.length === 0 ? <p>No hay solicitudes pendientes en el servidor.</p> : (
          <ul>
            {serverRequests.map((req) => (
              <li key={req.id}>
                <strong>{req.name}</strong> - Estado: {req.status} ({new Date(req.createdAt).toLocaleTimeString()})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;