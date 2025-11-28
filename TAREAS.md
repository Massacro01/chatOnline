# 📋 Tareas de Mejora - Proyecto KanbanApp

Aquí tienen una lista de tareas sugeridas para mejorar la aplicación, divididas para trabajar en paralelo. El objetivo es hacer que la app se sienta más profesional y completa.

---

## 👤 Gabi Martinez (Enfoque: UI/UX y Frontend)

El objetivo es pulir la interfaz para que se sienta como una app de chat moderna y fluida.

### 1. 🎨 Integrar Selector de Emojis
**Descripción:** Agregar un botón con una carita feliz en el input del chat que abra un selector de emojis.
*   **Librería sugerida:** `emoji-picker-react` (es ligera y fácil de usar).
*   **Tarea:**
    *   Instalar librería.
    *   Crear botón en `ChatPage.jsx` (al lado del input).
    *   Al seleccionar un emoji, agregarlo al texto que se está escribiendo.

### 2. 💅 Avatares Coloridos y Dinámicos
**Descripción:** Actualmente los avatares son grises o de un solo color. Hacer que cada usuario tenga un color de fondo diferente basado en su nombre.
*   **Tarea:**
    *   Crear una función `getAvatarColor(name)` que devuelva un color Hex o clase CSS basada en el string del nombre (hash simple).
    *   Aplicarlo en `ChatSidebar` y en los mensajes del chat.
    *   *Extra:* Usar una librería como `boring-avatars` para generar avatares abstractos únicos.

### 3. 📱 Diseño Responsive (Móvil)
**Descripción:** Mejorar cómo se ve la app en pantallas pequeñas.
*   **Tarea:**
    *   En móvil, el Sidebar debe ocupar el 100% del ancho inicialmente.
    *   Al hacer clic en un grupo, el Sidebar debe ocultarse y mostrar el Chat Area (100%).
    *   Agregar un botón "Volver" en el header del chat para regresar a la lista de grupos.

---

## 👤 Gabriel Yaya (Enfoque: Backend y Funcionalidad)

El objetivo es agregar funcionalidades "core" que faltan para una buena experiencia de chat.

### 1. ❤️ Reacciones a Mensajes (Likes)
**Descripción:** Permitir que los usuarios reaccionen a los mensajes (ej. un corazón o pulgar arriba).
*   **Backend (`Tasks.API`):**
    *   Agregar propiedad `Reactions` (JSON o tabla relacionada) al modelo `Message`.
    *   Crear endpoint `POST /api/messages/{id}/react`.
    *   Emitir evento SignalR `MessageReacted` para actualizar en tiempo real.
*   **Frontend:**
    *   Agregar botón pequeño en cada burbuja de mensaje.
    *   Mostrar contador de reacciones si es > 0.

### 2. 📅 Separadores de Fecha
**Descripción:** Mostrar separadores como "Hoy", "Ayer", "Lunes" entre los mensajes del chat para dar contexto temporal.
*   **Tarea (Frontend/Lógica):**
    *   En `ChatPage.jsx`, antes de renderizar la lista de mensajes, procesarla para insertar elementos visuales cuando cambie el día entre un mensaje y el siguiente.
    *   Crear un componente simple `<DateSeparator date={date} />`.

### 3. ✏️ Editar y Borrar Mensajes
**Descripción:** Permitir corregir errores o borrar mensajes enviados.
*   **Backend (`Tasks.API`):**
    *   Crear endpoints `PUT /api/messages/{id}` (editar) y `DELETE /api/messages/{id}`.
    *   Validar que solo el dueño del mensaje pueda hacerlo.
    *   Emitir eventos SignalR `MessageUpdated` y `MessageDeleted`.
*   **Frontend:**
    *   Agregar menú de opciones (tres puntitos) en los mensajes propios.

---

## 🚀 Notas Generales para Ambos

*   **Repositorio:** Trabajen sobre la rama `main` o creen ramas `feature/nombre-tarea` para no pisarse.
*   **Pruebas:** Recuerden probar siempre con 2 usuarios diferentes en navegadores distintos para verificar el tiempo real.
