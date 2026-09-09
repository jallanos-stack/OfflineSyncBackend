# OfflineSync Backend API - .NET 8

Backend API construido con ** Clean Architecture**, enfocado en proporcionar alta disponibilidad y tolerancia a fallos para clientes **Offline-First**.

## 🏗️ Arquitectura del Sistema

El proyecto sigue los principios de **Clean Architecture** divididos en 4 capas:

* **Domain:** Entidades (`RequestItem`, `OutboxMessage`), Enums (`RequestStatus`) e interfaces de repositorio.
* **Application:** Casos de uso (`RequestService`), DTOs, validaciones con `FluentValidation` y abstracción del Bus de Eventos.
* **Infrastructure:** Persistencia de datos con **EF Core**, base de datos SQLite (desarrollo local) / PostgreSQL (producción), **Transactional Outbox Pattern** y resiliencia con **Polly**.
* **Api:** Endpoints REST, registro estructurado con **Serilog** y especificación **OpenAPI (Swagger)**.

---

## 🛠️ Patrones y Tecnologías Utilizadas

* **.NET 8 SDK**
* **Entity Framework Core 8**
* **Result Pattern:** Manejo explícito de respuestas de negocio sin excepciones.
* **Transactional Outbox Pattern:** Garantía de entrega eventual y consistencia asíncrona de eventos.
* **Polly:** Estrategias de reintento (*Retry Pattern*) con retardo exponencial.
* **Serilog:** Logging estructurado trazable en consola y archivos de texto.
* **FluentValidation:** Validación fluida de contratos de entrada.

---

## 🚀 Cómo ejecutar el proyecto localmente

### Prerrequisitos
* [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

### Pasos de Ejecución
1. Clonar el repositorio.
2. Navegar a la carpeta raíz del proyecto backend.
3. Ejecutar el comando para iniciar la API:

```bash
dotnet run --project src/Api/Api.csproj
