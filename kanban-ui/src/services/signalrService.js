import * as signalR from '@microsoft/signalr';

/**
 * Servicio para gestionar la conexión SignalR en tiempo real
 */
class SignalRService {
    constructor() {
        this.connection = null;
        this.currentGroupId = null;
    }

    /**
     * Inicia la conexión con el hub de SignalR
     * @returns {Promise<void>}
     */
    async startConnection() {
        // Si ya hay una conexión activa, no hacer nada
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        try {
            // Obtener el token JWT del localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('No se encontró token de autenticación para SignalR');
                return;
            }

            // Si aún no existe la conexión, crearla
            if (!this.connection) {
                // Construir la URL del hub con el token en la query string
                // Usamos la URL base de la API de tareas (quitando el /api del final si existe)
                const baseUrl = (import.meta.env.VITE_TASKS_API_URL || 'http://localhost:5180/api').replace('/api', '');
                const hubUrl = `${baseUrl}/hubs/kanban?access_token=${token}`;

                // Crear la conexión
                this.connection = new signalR.HubConnectionBuilder()
                    .withUrl(hubUrl)
                    .withAutomaticReconnect() // Reconexión automática
                    .configureLogging(signalR.LogLevel.Information)
                    .build();

                // Manejar reconexión
                this.connection.onreconnecting((error) => {
                    console.warn('SignalR reconectando...', error);
                });

                this.connection.onreconnected((connectionId) => {
                    console.log('SignalR reconectado:', connectionId);
                    // Re-unirse al tablero si había uno activo
                    if (this.currentBoardId) {
                        this.joinBoard(this.currentBoardId);
                    }
                });

                this.connection.onclose((error) => {
                    console.error('SignalR conexión cerrada:', error);
                });
            }

            // Iniciar la conexión si no está conectada ni conectándose
            if (this.connection.state === signalR.HubConnectionState.Disconnected) {
                await this.connection.start();
                console.log('✅ SignalR conectado exitosamente');
            }
        } catch (error) {
            console.error('Error al iniciar conexión SignalR:', error);
        }
    }

    /**
     * Detiene la conexión con SignalR
     * @returns {Promise<void>}
     */
    async stopConnection() {
        try {
            if (this.connection) {
                await this.connection.stop();
                console.log('SignalR desconectado');
                this.connection = null;
                this.currentGroupId = null;
            }
        } catch (error) {
            console.error('Error al detener conexión SignalR:', error);
        }
    }

    /**
     * Une el cliente a un grupo de chat específico
     * @param {string} groupId - ID del grupo/sala
     * @returns {Promise<void>}
     */
    async joinGroup(groupId) {
        try {
            if (!groupId) {
                return;
            }

            // Asegurar que la conexión esté iniciada
            if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
                await this.startConnection();
            }

            if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
                console.warn('No se pudo unir al grupo porque la conexión SignalR no está activa');
                return;
            }

            await this.connection.invoke('JoinGroup', groupId);
            this.currentGroupId = groupId;
            console.log(`✅ Unido al grupo: ${groupId}`);
        } catch (error) {
            console.error('Error al unirse al grupo:', error);
        }
    }

    /**
     * Sale del grupo de chat
     * @param {string} groupId - ID del grupo/sala
     * @returns {Promise<void>}
     */
    async leaveGroup(groupId) {
        try {
            // Si la conexión no está activa, no hacer nada
            if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
                console.warn('Intento de salir de grupo sin conexión activa. Omitiendo.');
                return;
            }

            await this.connection.invoke('LeaveGroup', groupId);
            this.currentGroupId = null;
            console.log(`Salió del grupo: ${groupId}`);
        } catch (error) {
            console.error('Error al salir del grupo:', error);
        }
    }

    /**
     * Escucha el evento de recepción de mensajes de chat
     * @param {Function} callback - Función a ejecutar cuando se recibe un mensaje
     */
    onReceiveMessage(callback) {
        if (!this.connection) {
            console.error('No hay conexión activa con SignalR');
            return;
        }

        // ✅ FIX: Remover listener anterior para evitar duplicados
        this.connection.off('ReceiveMessage');

        this.connection.on('ReceiveMessage', (message) => {
            console.log('📬 Mensaje recibido (SignalR):', message);
            callback(message);
        });
    }

    /**
     * Remueve el listener de mensajes
     */
    offReceiveMessage() {
        if (this.connection) {
            this.connection.off('ReceiveMessage');
            console.log('🔇 Listener de ReceiveMessage removido');
        }
    }

    /**
     * Escucha el evento de "usuario escribiendo"
     * @param {Function} callback - Función a ejecutar cuando un usuario está escribiendo
     */
    onUserTyping(callback) {
        if (!this.connection) {
            console.error('No hay conexión activa con SignalR');
            return;
        }

        // ✅ FIX: Remover listener anterior
        this.connection.off('UserTyping');

        this.connection.on('UserTyping', (userName) => {
            console.log('✏️ Usuario escribiendo (SignalR):', userName);
            callback(userName);
        });
    }

    /**
     * Remueve el listener de typing
     */
    offUserTyping() {
        if (this.connection) {
            this.connection.off('UserTyping');
        }
    }

    // --- Listeners para Reacciones, Edición y Borrado ---

    onMessageReacted(callback) {
        if (!this.connection) return;
        this.connection.off('MessageReacted'); // Evitar duplicados
        this.connection.on('MessageReacted', (data) => {
            console.log('❤️ Reacción recibida (SignalR):', data);
            callback(data);
        });
    }

    offMessageReacted() {
        if (this.connection) {
            this.connection.off('MessageReacted');
        }
    }

    onMessageUpdated(callback) {
        if (!this.connection) return;
        this.connection.off('MessageUpdated');
        this.connection.on('MessageUpdated', (data) => {
            console.log('✏️ Mensaje actualizado (SignalR):', data);
            callback(data);
        });
    }

    offMessageUpdated() {
        if (this.connection) {
            this.connection.off('MessageUpdated');
        }
    }

    onMessageDeleted(callback) {
        if (!this.connection) return;
        this.connection.off('MessageDeleted');
        this.connection.on('MessageDeleted', (data) => {
            console.log('🗑️ Mensaje borrado (SignalR):', data);
            callback(data);
        });
    }

    offMessageDeleted() {
        if (this.connection) {
            this.connection.off('MessageDeleted');
        }
    }

    /**
     * ✅ NUEVO: Escucha el evento de creación de grupos
     * @param {Function} callback - Función a ejecutar cuando se crea un nuevo grupo
     */
    onGroupCreated(callback) {
        if (!this.connection) {
            console.error('No hay conexión activa con SignalR');
            return;
        }

        // ✅ FIX: Remover listener anterior
        this.connection.off('GroupCreated');

        this.connection.on('GroupCreated', (newGroup) => {
            console.log('🎉 Nuevo grupo creado (SignalR):', newGroup);
            callback(newGroup);
        });
    }

    /**
     * Envía una notificación de "usuario escribiendo" al grupo
     * @param {string} groupId - ID del grupo/sala
     */
    async sendTyping(groupId) {
        try {
            if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
                await this.startConnection();
            }

            if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
                return;
            }

            await this.connection.invoke('Typing', groupId);
        } catch (error) {
            console.error('Error al enviar evento de typing:', error);
        }
    }

    /**
     * Verifica si hay una conexión activa
     * @returns {boolean}
     */
    isConnected() {
        return this.connection && this.connection.state === signalR.HubConnectionState.Connected;
    }

    /**
     * Obtiene el estado actual de la conexión
     * @returns {string}
     */
    getConnectionState() {
        if (!this.connection) {
            return 'Disconnected';
        }
        return this.connection.state;
    }
}

// Exportar una instancia única (singleton)
const signalrService = new SignalRService();
export default signalrService;
