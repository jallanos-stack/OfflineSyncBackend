# OfflineSync System (.NET 8 + React)

Sistema **Offline-First** completo diseñado con **Clean Architecture** en el backend (.NET 8) y **React con TypeScript** en el cliente. Garantiza la alta disponibilidad, la resiliencia y la tolerancia a fallos mediante el almacenamiento local persistente y la sincronización eventual de datos.

---

##  Arquitectura General

El proyecto está dividido en dos grandes componentes integrados mediante HTTPS/CORS:


[ Cliente React + Dexie.js ]
            │
  ┌─────────┴─────────┐
  ▼                   ▼
(Online)          (Offline)
  │                   │
  │                   ▼
  │         [ IndexedDB Local ]
  │                   │
  │ (Sincronización)  │
  └─────────┬─────────┘
            ▼
 [ Backend API .NET 8 ] ──► [ Clean Architecture ]
            │
            ▼
 [ ApplicationDbContext ] ──► (Transacción Atómica)
            │
    ┌───────┴───────┐
    ▼               ▼
[ Requests ]   [ OutboxMessages ]
                    │
                    ▼
          [ OutboxProcessor ] (BackgroundService)
                    │
                    ▼
          [ InMemoryEventBus ] (Con Retry Policy - Polly)