import { api } from './api';
import type { Notification } from '../types/notification';

export const notificationService = {
    // Получить все уведомления
    getAll: async () => {
        const response = await api.get<Notification[]>('/notifications');
        return response.data;
    },

    // Получить непрочитанные
    getUnread: async () => {
        const response = await api.get<Notification[]>('/notifications/unread');
        return response.data;
    },

    // Отметить как прочитанное
    markAsRead: async (id: number) => {
        const response = await api.put<Notification>(`/notifications/${id}/read`);
        return response.data;
    },

    // Отметить все как прочитанные
    markAllAsRead: async () => {
        const response = await api.put<{ count: number }>('/notifications/read-all');
        return response.data;
    },

    // Удалить уведомление
    delete: async (id: number) => {
        await api.delete(`/notifications/${id}`);
    },
};