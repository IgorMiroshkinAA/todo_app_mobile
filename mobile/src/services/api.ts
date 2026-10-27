import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://192.168.31.208:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор запроса — добавляем токен
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Интерцептор ответа — обрабатываем 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const status = error.response?.status;

        // Не обрабатываем 401 для запросов авторизации
        const isAuthRequest =
            url.includes('/auth/login') ||
            url.includes('/auth/register');

        // Не обрабатываем 401, если токена вообще нет (первый запрос)
        const hasToken = !!localStorage.getItem('token');

        if (status === 401 && !isAuthRequest && hasToken) {
            console.warn('🔴 401 Unauthorized — clearing auth and redirecting');
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    },
);

export default api;