import { api } from './api';
import type { Subtask, CreateSubtaskDto, UpdateSubtaskDto } from '../types/subtask';

export const subtaskService = {
    // Получить все подзадачи задачи
    getAllByTask: async (taskId: number) => {
        const response = await api.get<Subtask[]>(`/tasks/${taskId}/subtasks`);
        return response.data;
    },

    // Создать подзадачу
    create: async (taskId: number, data: CreateSubtaskDto) => {
        const response = await api.post<Subtask>(`/tasks/${taskId}/subtasks`, data);
        return response.data;
    },

    // Обновить подзадачу
    update: async (id: number, data: UpdateSubtaskDto) => {
        const response = await api.put<Subtask>(`/subtasks/${id}`, data);
        return response.data;
    },

    // Удалить подзадачу
    delete: async (id: number) => {
        await api.delete(`/subtasks/${id}`);
    },
};