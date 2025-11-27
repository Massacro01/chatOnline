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
};

export default chatService;
