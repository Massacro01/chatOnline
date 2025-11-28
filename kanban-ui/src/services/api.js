import axios from 'axios';

// Obtener las URLs de las APIs desde variables de entorno
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;
const BOARDS_API_URL = import.meta.env.VITE_BOARDS_API_URL;
const TASKS_API_URL = import.meta.env.VITE_TASKS_API_URL;

// Crear instancias de Axios para cada API
export const authApi = axios.create({
    baseURL: AUTH_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const boardsApi = axios.create({
    baseURL: BOARDS_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const tasksApi = axios.create({
    baseURL: TASKS_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// INTERCEPTOR CRÍTICO: Inyecta el token JWT automáticamente en todas las peticiones
const requestInterceptor = (config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
};

const requestErrorInterceptor = (error) => {
    return Promise.reject(error);
};

// INTERCEPTOR DE RESPUESTA: Maneja errores globalmente
const responseInterceptor = (response) => {
    return response;
};

const responseErrorInterceptor = (error) => {
    // Si el token expiró (401), limpiar localStorage y redirigir al login
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    return Promise.reject(error);
};

// Aplicar interceptores a todas las instancias de Axios
[authApi, boardsApi, tasksApi].forEach((api) => {
    api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
    api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
});

// Funciones helper para Auth API
export const authService = {
    login: async (email, password) => {
        const response = await authApi.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (fullName, email, password) => {
        const response = await authApi.post('/auth/register', { fullName, email, password });
        return response.data;
    },
};

// Funciones helper para Boards API
export const boardsService = {
    getBoards: async () => {
        const response = await boardsApi.get('/boards');
        return response.data;
    },

    createBoard: async (title) => {
        const response = await boardsApi.post('/boards', { title });
        return response.data;
    },
};

// Funciones helper para Tasks API
export const tasksService = {
    getTasksByBoard: async (boardId) => {
        const response = await tasksApi.get(`/tasks/board/${boardId}`);
        return response.data;
    },

    createTask: async (taskData) => {
        const response = await tasksApi.post('/tasks', taskData);
        return response.data;
    },

    moveTask: async (taskId, targetColumnId, newOrder) => {
        const response = await tasksApi.put(`/tasks/${taskId}/move`, {
            targetColumnId,
            newOrder,
        });
        return response.data;
    },

    updateTask: async (taskId, taskData) => {
        const response = await tasksApi.put(`/tasks/${taskId}`, taskData);
        return response.data;
    },

    deleteTask: async (taskId) => {
        const response = await tasksApi.delete(`/tasks/${taskId}`);
        return response.data;
    },
};

export default {
    authApi,
    boardsApi,
    tasksApi,
    authService,
    boardsService,
    tasksService,
};
