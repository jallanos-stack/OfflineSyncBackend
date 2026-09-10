OfflineSync Client - React + TypeScript

Backend

Clean Architecture: Separación clara de responsabilidades en 4 capas (Domain, Application, Infrastructure, Api).

Entity Framework Core 8 & SQLite: Persistencia de datos y soporte para transacciones atómicas.

Transactional Outbox: Garantía de consistencia eventual al guardar entidades y eventos en la misma transacción.

Polly: Manejo de resiliencia mediante políticas de reintento (Retry Pattern) con retardo exponencial.

Serilog: Registro de logs estructurado y trazable en consola y archivos.

FluentValidation & Result Pattern: Validación fluida de entradas y manejo explícito de errores de negocio sin excepciones.


Frontend

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

Backend en .NET 10 ejecutándose (Puerto HTTPS por defecto: https://localhost:5206).

Pasos
1. Entrar al directorio del cliente (client) e instalar dependencias: (npm install).
2. Verificar la URL del backend en src/services/apiService.ts (const API_URL = 'https://localhost:5206/api';)
3. Iniciar el servidor de desarrollo con Vite: (npm run dev)


Pruebas:
Modo Online: Crear una nueva solicitud desde el formulario. Observa cómo se envía inmediatamente al backend y se muestra en "Registros en el Backend". Se muestran tanto registros ingresados por el formulario como otros que le llegan el  al API.

Modo Offline: Detener el backend (o por herramientas del desarrollador/ network cambiar a offline). En este caso al crear la solicitud esta quedara encolada en ndexedDB dentro de la sección "Cola Local Pendiente".

Sincronizaciòn: Desactivar el modo offline (o activar el backend). Presionar Sincronizar ahora (o recargar la pagina). La cola local se enviará a la API y se limpiará automáticamente el almacén local de IndexedDB.





Pruebas:
Backend desde swagger:
El API se ejecuta en http://localhost:5206/swagger/index.html

<img width="1550" height="950" alt="image" src="https://github.com/user-attachments/assets/c9750ab9-88f0-4660-9370-e2d4228d8522" />

Crear una solicitud desde el swagger

<img width="683" height="965" alt="image" src="https://github.com/user-attachments/assets/26d8566c-a7cc-43cc-a40f-866805f0f799" />


Consultar una solicitud por medio de su id
<img width="743" height="959" alt="image" src="https://github.com/user-attachments/assets/52994b11-ea87-49fd-bdb3-6fc51147120d" />


Pruebas FrontEnd
<img width="1015" height="997" alt="image" src="https://github.com/user-attachments/assets/c4a4671d-d4ab-4efd-a0d7-d0ef12a0b060" />







