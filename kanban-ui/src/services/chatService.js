import { tasksApi } from './api';

/**
 * Servicio para gestionar mensajes de chat
 */
const chatService = {
    /**
     * Obtiene el historial de mensajes de un grupo/sala
     * @param {string} groupId - ID del grupo (BoardId)
     */
    getHistory: async (groupId) => {
        try {
            const response = await tasksApi.get(`/messages/group/${groupId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener historial de mensajes:', error);
            throw error;
        }
    },

    /**
     * Envía un nuevo mensaje al grupo
     * @param {string} groupId - ID del grupo (BoardId)
     * @param {string} content - Contenido del mensaje
     */
    sendMessage: async (groupId, content) => {
        try {
            const response = await tasksApi.post('/messages', {
                groupId,
                content,
            });
            return response.data;
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            throw error;
        }
    },

    /**
     * Envía una reacción a un mensaje específico.
     * @param {string} messageId - ID del mensaje
     * @param {string} userId - ID del usuario que reacciona
     * @param {string} emoji - El emoji de la reacción
     */
    reactToMessage: async (messageId, userId, emoji) => {
        try {
            const response = await tasksApi.post(`/messages/${messageId}/react`, {
                userId,
                emoji,
            });
            return response.data;
        } catch (error) {
            console.error('Error al reaccionar al mensaje:', error);
            throw error;
        }
    },

    /**
     * Edita el contenido de un mensaje propio.
     * @param {string} messageId - ID del mensaje
     * @param {string} newContent - Nuevo contenido del mensaje
     * @param {string} userId - ID del usuario para validación
     */
    editMessage: async (messageId, newContent, userId) => {
        try {
            const response = await tasksApi.put(`/messages/${messageId}`, {
                newContent,
                userId,
            });
            return response.data;
        } catch (error) {
            console.error('Error al editar el mensaje:', error);
            throw error;
        }
    },

    /**
     * Elimina un mensaje propio.
     * @param {string} messageId - ID del mensaje
     * @param {string} userId - ID del usuario para validación
     */
    deleteMessage: async (messageId, userId) => {
        try {
            await tasksApi.delete(`/messages/${messageId}`, {
                // En DELETE, el body se pasa dentro de un objeto `data` en Axios
                data: { userId },
            });
        } catch (error) {
            console.error('Error al eliminar el mensaje:', error);
            throw error;
        }
    },
};

export default chatService;
