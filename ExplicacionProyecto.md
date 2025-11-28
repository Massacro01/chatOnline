# 🚀 KanbanApp - Proyecto de Chat y Gestión

Bienvenido al repositorio de **KanbanApp**. Este proyecto es una aplicación moderna de chat en tiempo real y gestión de tareas, construida con una arquitectura de microservicios robusta y escalable.

---

## 📚 Documentación Importante

*   **[👉 GUÍA DE INICIO RÁPIDO (Cómo ejecutar el proyecto)](./IniciarProyecto.md)**: Lee esto primero para levantar el entorno.
*   **[📋 Tareas del Equipo](./TAREAS.md)**: Lista de mejoras asignadas para el desarrollo.

---

## 🏗️ Arquitectura del Proyecto

El sistema está dividido en **Microservicios** independientes (Backend) y una aplicación **Frontend** unificada.

### 📂 Estructura de Carpetas

A continuación se detalla la responsabilidad de cada directorio:

#### 🔐 `Auth.API` (Servicio de Identidad)
*   **Puerto:** `5011`
*   **Responsabilidad:** Maneja todo lo relacionado con usuarios y seguridad.
*   **Funciones clave:**
    *   Registro de usuarios (`POST /api/auth/register`).
    *   Login y generación de Tokens JWT (`POST /api/auth/login`).
    *   Base de datos propia: `kanban_app.db`.

#### 📋 `Boards.API` (Servicio de Grupos/Tableros)
*   **Puerto:** `5117`
*   **Responsabilidad:** Gestión de los espacios de trabajo (Grupos de chat).
*   **Funciones clave:**
    *   Crear nuevos grupos.
    *   Listar grupos disponibles (Públicos).
    *   Base de datos propia: `kanban_boards.db`.

#### 💬 `Tasks.API` (Servicio de Chat y Tareas)
*   **Puerto:** `5180`
*   **Responsabilidad:** El corazón de la comunicación en tiempo real.
*   **Funciones clave:**
    *   **SignalR Hub (`/hubs/kanban`):** Gestiona conexiones WebSocket para el chat en vivo.
    *   Almacenamiento de historial de mensajes.
    *   Gestión de tareas (Kanban).
    *   Base de datos propia: `kanban_tasks.db`.

#### ⚛️ `kanban-ui` (Frontend)
*   **Puerto:** `5173`
*   **Tecnología:** React + Vite.
*   **Responsabilidad:** Interfaz de usuario estilo WhatsApp Web.
*   **Componentes clave:**
    *   `ChatPage.jsx`: Lógica principal del chat.
    *   `signalrService.js`: Cliente de conexión en tiempo real.
    *   `ChatSidebar.jsx`: Lista de grupos con actualizaciones en vivo.

#### 📦 `Shared.Kernel`
*   **Responsabilidad:** Librería de clases compartida (.NET Class Library).
*   **Contenido:** DTOs, Modelos y constantes que usan las tres APIs para comunicarse entre sí sin duplicar código.

---

## 🛠️ Stack Tecnológico

### Backend
*   **Framework:** .NET 9 (ASP.NET Core Web API)
*   **Base de Datos:** SQLite (Entity Framework Core)
*   **Tiempo Real:** SignalR
*   **Seguridad:** JWT (JSON Web Tokens)

### Frontend
*   **Framework:** React 18
*   **Build Tool:** Vite
*   **Estilos:** CSS Modules / Vanilla CSS (Diseño Responsive)
*   **HTTP Client:** Axios
*   **WebSocket Client:** @microsoft/signalr

---

## 🔄 Flujo de Datos (Ejemplo: Enviar un Mensaje)

1.  **Frontend** envía el mensaje a `Tasks.API` (REST).
2.  **Tasks.API** guarda el mensaje en su base de datos `kanban_tasks.db`.
3.  **Tasks.API** usa el `ChatHub` para emitir el evento `ReceiveMessage` a todos los conectados.
4.  **Frontend** recibe el evento y actualiza la UI instantáneamente sin recargar.

---

> **Nota:** Este proyecto está configurado para desarrollo local. Asegúrate de seguir la guía de **[IniciarProyecto.md](./IniciarProyecto.md)** para configurar las variables de entorno y dependencias.
