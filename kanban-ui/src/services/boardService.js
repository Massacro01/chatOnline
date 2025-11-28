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
};

export default boardService;
