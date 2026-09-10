OfflineSync Client - React + TypeScript

Aplicación cliente de tipo Offline-First construida con React (Vite) y TypeScript. 
La aplicación permite la creación, almacenamiento local y sincronización asíncrona de solicitudes con una API backend desarrollada en .NET 10, garantizando el funcionamiento ininterrumpido sin importar el estado de la conexión a internet (o a la API).

Tech Stack - Frontend

Core: React 18/19, TypeScript, Vite.
Persistencia Local: Dexie.js (Wrapper optimizado sobre IndexedDB).
Hooks React-Dexie: dexie-react-hooks (useLiveQuery para reactividad en tiempo real con IndexedDB).
Cliente HTTP: Axios.

Arquitectura Offline-First

               [ Formulario de Solicitud ]
                               │
                               ▼
                   [ ¿Hay Conexión a Internet? ]
                     /                       \
             (SÍ)   /                         \ (NO)
                   ▼                           ▼
        [ POST a API .NET 10 ]       [ Guardar en IndexedDB ]
                   │                           │
          ┌────────┴────────┐                  │
       (Éxito)          (Fallo)                │
          │                 └──────────────────┤
          ▼                                    ▼
  [ Respuesta Backend ]             [ Cola Local Pendiente ]
                                               │
                                               ▼
                                 [ Restablecimiento de Red ]
                                               │
                                               ▼
                                   [ Sincronización a API ]
                                               │
                                               ▼
                                  [ Limpieza de IndexedDB ]



client/
├── src/
│   ├── db/
│   │   └── offlineDb.ts       # Configuración del esquema IndexedDB con Dexie.js
│   ├── services/
│   │   └── apiService.ts      # Cliente HTTP, lógica de fallback offline y sync
│   ├── types/
│   │   └── index.ts           # Contratos de datos compartidos con .NET 10
│   ├── App.tsx                # Interfaz de usuario interactiva y listeners de red
│   └── main.tsx               # Punto de entrada de React
├── package.json
└── vite.config.ts

Persistencia Local con Dexie.js (offlineDb.ts)

Para evitar limitaciones de espacio e inconsistencias del localStorage, se utiliza IndexedDB a través de Dexie.js. Se define un almacén de objetos (requests) indexado por clave primaria autoincrementable y banderas de estado.

La sincronización se realiza mediante la función syncOfflineQueue(). El proceso sigue esta secuencia estricta:

Detección de Conexión: Comprueba la disponibilidad de red.

Lectura de Pendientes: Consulta IndexedDB en busca de registros cuyo bandera sea evaluada como pendiente.

Envío Secuencial: Itera sobre cada elemento enviándolo mediante la petición POST al endpoint /api/requests del backend.

Confirmación y Purga: Tras recibir respuesta exitosa 200 OK / 201 Created del servidor, remueve el registro correspondiente de IndexedDB usando localId para evitar duplicidad o sobrecarga de almacenamiento.


Instrucciones de Ejecución (Local=)

Prerrequisitos

Node.js v18+ y npm.

Backend en .NET 8 ejecutándose (Puerto HTTPS por defecto: https://localhost:5206).

Pasos
1. Entrar al directorio del cliente (client) e instalar dependencias: (npm install).
2. Verificar la URL del backend en src/services/apiService.ts (const API_URL = 'https://localhost:5206/api';)
3. Iniciar el servidor de desarrollo con Vite: (npm run dev)


Pruebas:
Modo Online: Crear una nueva solicitud desde el formulario. Observa cómo se envía inmediatamente al backend y se muestra en "Registros en el Backend". Se muestran tanto registros ingresados por el formulario como otros que le llegan el  al API.

Modo Offline: Detener el backend (o por herramientas del desarrollador/ network cambiar a offline). En este caso al crear la solicitud esta quedara encolada en ndexedDB dentro de la sección "Cola Local Pendiente".

Sincronizaciòn: Desactivar el modo offline (o activar el backend). Presionar Sincronizar ahora (o recargar la pagina). La cola local se enviará a la API y se limpiará automáticamente el almacén local de IndexedDB.




