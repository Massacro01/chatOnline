import { boardsApi } from './api';

/**
 * Servicio para gestionar tableros (Boards)
 */
const boardService = {
    /**
     * Obtiene todos los tableros del usuario autenticado
     */
    getAllBoards: async () => {
        try {
            const response = await boardsApi.get('/boards');
            return response.data;
        } catch (error) {
            console.error('Error al obtener tableros:', error);
            throw error;
        }
    },

    /**
     * Crea un nuevo tablero
     * @param {string} title - Título del tablero
     */
    createBoard: async (title) => {
        try {
            const response = await boardsApi.post('/boards', { title });
            return response.data;
        } catch (error) {
            console.error('Error al crear tablero:', error);
            throw error;
        }
    },

    /**
     * Obtiene un tablero por su ID
     * @param {string} id - ID del tablero
     */
    getBoardById: async (id) => {
        try {
            const response = await boardsApi.get(`/boards/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener tablero:', error);
            throw error;
        }
    },
    /**
     * Elimina un tablero por su ID
     * @param {string} id
     */
    deleteBoard: async (id) => {
        try {
            const response = await boardsApi.delete(`/boards/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar tablero:', error);
            throw error;
        }
    },
    /**
     * El usuario actual sale (leave) del tablero.
     * Nota: backend leave endpoint fue revertido; usamos fallback local.
     */
    leaveBoard: async (id) => {
        // Intentar llamar al endpoint si existe, pero si falla, devolver rechazo
        try {
            const response = await boardsApi.post(`/boards/${id}/leave`);
            return response.data;
        } catch (error) {
            // No forzar error: devolver null para que el caller haga fallback local
            console.warn('leaveBoard backend no disponible, use fallback local', error?.response?.status);
            throw error;
        }
    },
};

export default boardService;
