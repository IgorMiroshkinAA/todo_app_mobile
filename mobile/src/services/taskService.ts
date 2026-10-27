import { api } from './api';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';

export const taskService = {
  getAll: async (params?: any) => {
    const response = await api.get<Task[]>('/tasks', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: CreateTaskDto) => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTaskDto) => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/tasks/${id}`);
  },

  getCalendarTasks: async (startDate: string, endDate: string) => {
    const response = await api.get<Task[]>('/tasks/calendar', {
      params: { start: startDate, end: endDate },
    });
    return response.data;
  },

  // Переместить задачу на другую дату
  moveToDate: async (taskId: number, newDate: string) => {
    const response = await api.put<Task>(`/tasks/${taskId}/move`, { date: newDate });
    return response.data;
  },

  // Экспорт в JSON
  exportTasks: async () => {
    const response = await api.get<Task[]>('/tasks/export');
    return response.data;
  },

  // Экспорт в Excel
  exportTasksExcel: async () => {
    const response = await api.get('/tasks/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Импорт из JSON
  importTasks: async (tasks: any[]) => {
    const response = await api.post<{ imported: number; skipped: number }>('/tasks/import', tasks);
    return response.data;
  },
};