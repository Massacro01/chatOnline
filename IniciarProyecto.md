# KanbanApp - Guía de Instalación y Ejecución

Este proyecto es una aplicación Kanban completa construida con una arquitectura de microservicios en **.NET 9** (Backend) y **React** (Frontend).

## 📋 Requisitos Previos

Asegúrate de tener instalado lo siguiente antes de comenzar:

1.  **[.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)**: Necesario para ejecutar el backend.
2.  **[Node.js](https://nodejs.org/)** (v18 o superior): Necesario para el frontend.
3.  **Yarn** (Opcional, pero recomendado): Gestor de paquetes para el frontend.
    *   Instalar con: `npm install -g yarn`

---

## 🚀 Instrucciones de Instalación

Sigue estos pasos la primera vez que descargues o descomprimas el proyecto.

### 1. Configuración del Backend (.NET)

Abre una terminal en la carpeta raíz del proyecto (`KanbanApp/`) y ejecuta:

```bash
dotnet restore
dotnet build
```

Esto descargará todas las dependencias de NuGet y compilará la solución.

### 2. Configuración del Frontend (React)

Abre una terminal en la carpeta `kanban-ui/` y ejecuta:

```bash
cd kanban-ui
yarn install
# O si usas npm: npm install
```

---

## ▶️ Cómo Ejecutar el Proyecto

El sistema consta de **4 partes** que deben funcionar simultáneamente. Necesitarás abrir **4 terminales**.

### Terminal 1: Auth API (Autenticación)
Servicio encargado del login y registro de usuarios.

```bash
cd Auth.API
dotnet run
```
✅ **Puerto esperado:** `http://localhost:5011`

### Terminal 2: Boards API (Tableros/Grupos)
Servicio encargado de gestionar los grupos y tableros.

```bash
cd Boards.API
dotnet run
```
✅ **Puerto esperado:** `http://localhost:5117`

### Terminal 3: Tasks API (Chat y Tareas)
Servicio encargado del chat en tiempo real (SignalR) y las tareas.

```bash
cd Tasks.API
dotnet run
```
✅ **Puerto esperado:** `http://localhost:5180`

### Terminal 4: Frontend (Interfaz de Usuario)
La aplicación web en React.

```bash
cd kanban-ui
yarn dev
# O si usas npm: npm run dev
```
✅ **URL de acceso:** `http://localhost:5173`

---

## 🛠️ Solución de Problemas Comunes

### Error: "Address already in use"
Si ves un error indicando que el puerto está ocupado, asegúrate de no tener otra instancia del proyecto corriendo.

### Base de Datos
El proyecto usa **SQLite**. Los archivos de base de datos (`.db`) se crearán automáticamente en las carpetas de cada API (`Auth.API`, `Boards.API`, `Tasks.API`) la primera vez que ejecutes la aplicación.

Si necesitas reiniciar la base de datos desde cero, simplemente borra los archivos `*.db` en esas carpetas y reinicia las APIs.

### SignalR (Chat en Tiempo Real)
Si el chat no conecta, verifica que `Tasks.API` esté corriendo correctamente en el puerto `5180`.

---

## 📂 Estructura del Proyecto

*   **Auth.API**: Microservicio de identidad (JWT).
*   **Boards.API**: Microservicio de tableros y grupos.
*   **Tasks.API**: Microservicio de mensajería y tareas (incluye SignalR Hub).
*   **Shared.Kernel**: Código compartido entre microservicios.
*   **kanban-ui**: Frontend en React + Vite.
