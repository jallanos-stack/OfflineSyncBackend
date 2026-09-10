import React, { useState, useEffect } from 'react';
import { apiService } from './services/apiService';
import { db } from './db/offlineDb';
import { useLiveQuery } from 'dexie-react-hooks';
import type { RequestDto, OfflineRequestItem } from './types/index';

// Tipo unificado para visualizar detalles en el Modal
interface RequestDetailView {
  id: string;
  name: string;
  payload: string;
  type: string;
  status: string;
  createdAt: string;
  isOffline: boolean;
}

export function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [name, setName] = useState('');
  const [payload, setPayload] = useState('');
  const [type, setType] = useState('TEXT_TRANSFORM');
  const [serverRequests, setServerRequests] = useState<RequestDto[]>([]);
  const [message, setMessage] = useState('');
  
  // Estado para controlar el registro seleccionado en el Modal de Detalle
  const [selectedDetail, setSelectedDetail] = useState<RequestDetailView | null>(null);

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

  // Consulta reactiva a IndexedDB
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
      setMessage('⚠️ Guardado localmente en IndexedDB (Pendiente de envío).');
    } else {
      setMessage('✅ Solicitud enviada correctamente al backend .NET 8.');
      loadServerData();
    }

    setName('');
    setPayload('');
  };

  const handleSync = async () => {
    const synced = await apiService.syncOfflineQueue();
    if (synced > 0) {
      setMessage(`🔄 Se sincronizaron ${synced} solicitudes pendientes.`);
      loadServerData();
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', fontFamily: 'system-ui, sans-serif', padding: '0 1rem' }}>
      <h1>OfflineSync Client (.NET 8 + React)</h1>

      {/* Indicador de Estado de Conexión */}
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

      {message && <p style={{ padding: '0.5rem 1rem', backgroundColor: '#e3f2fd', borderRadius: '4px', borderLeft: '4px solid #1976d2' }}>{message}</p>}

      {/* 1. CREAR SOLICITUD */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3 style={{ margin: 0 }}>➕ Crear Nueva Solicitud</h3>
        <input
          type="text"
          placeholder="Nombre de la solicitud"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '0.6rem' }}
          required
        />
        <textarea
          placeholder="Payload / Contenido detallado"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          style={{ padding: '0.6rem', minHeight: '60px' }}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '0.6rem' }}>
          <option value="TEXT_TRANSFORM">TEXT_TRANSFORM</option>
          <option value="DATA_PROCESSING">DATA_PROCESSING</option>
        </select>
        <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Guardar / Enviar
        </button>
      </form>

      {/* 2. LISTAR SOLICITUDES LOCALES (PENDIENTES) */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ffe0b2', backgroundColor: '#fffde7', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>📦 Solicitudes Locales en IndexedDB ({offlineQueue.length})</h3>
          {isOnline && offlineQueue.length > 0 && (
            <button onClick={handleSync} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f57c00', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Sincronizar Ahora
            </button>
          )}
        </div>

        {offlineQueue.length === 0 ? <p style={{ color: '#666' }}>No hay solicitudes pendientes en el almacenamiento local.</p> : (
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
            {offlineQueue.map((item: OfflineRequestItem) => (
              <li key={item.localId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #e0e0e0' }}>
                <div>
                  <strong>{item.name}</strong> <span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#ff9800', color: '#fff', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '0.5rem' }}>⏳ PENDIENTE (Offline)</span>
                </div>
                <button
                  onClick={() => setSelectedDetail({
                    id: `LOCAL-${item.localId}`,
                    name: item.name,
                    payload: item.payload,
                    type: item.type,
                    status: 'Pendiente de Envío (En cola local IndexedDB)',
                    createdAt: item.createdAt,
                    isOffline: true
                  })}
                  style={{ padding: '0.3rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fff' }}
                >
                  🔍 Ver detalle
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3. LISTAR SOLICITUDES SERVIDOR (ENVIADAS / PROCESADAS) */}
      <div style={{ padding: '1rem', border: '1px solid #c8e6c9', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h3 style={{ margin: 0 }}>🌐 Solicitudes en el Backend (.NET 8)</h3>
        {serverRequests.length === 0 ? <p style={{ color: '#666' }}>No hay solicitudes registradas en el servidor.</p> : (
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
            {serverRequests.map((req: RequestDto) => (
              <li key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #e0e0e0' }}>
                <div>
                  <strong>{req.name}</strong> <span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#4caf50', color: '#fff', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '0.5rem' }}>✅ ENVIADA ({req.status})</span>
                </div>
                <button
                  onClick={() => setSelectedDetail({
                    id: req.id,
                    name: req.name,
                    payload: req.payload,
                    type: req.type,
                    status: `Enviada al Servidor (${req.status})`,
                    createdAt: req.createdAt,
                    isOffline: false
                  })}
                  style={{ padding: '0.3rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fff' }}
                >
                  🔍 Ver detalle
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 4. MODAL DE DETALLE DE LA SOLICITUD */}
      {selectedDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>📄 Detalle de la Solicitud</h2>
            
            <p><strong>ID:</strong> <code>{selectedDetail.id}</code></p>
            <p><strong>Nombre:</strong> {selectedDetail.name}</p>
            <p><strong>Tipo:</strong> {selectedDetail.type}</p>
            <p><strong>Estado:</strong> 
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                color: '#fff',
                backgroundColor: selectedDetail.isOffline ? '#ff9800' : '#4caf50'
              }}>
                {selectedDetail.status}
              </span>
            </p>
            <p><strong>Fecha de Creación:</strong> {new Date(selectedDetail.createdAt).toLocaleString()}</p>
            
            <div style={{ marginTop: '1rem' }}>
              <strong>Payload / Contenido:</strong>
              <pre style={{
                backgroundColor: '#f5f5f5',
                padding: '0.75rem',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {selectedDetail.payload}
              </pre>
            </div>

            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <button
                onClick={() => setSelectedDetail(null)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#757575',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;