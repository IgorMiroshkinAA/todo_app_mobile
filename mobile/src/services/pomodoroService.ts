import { api } from './api';
import type { PomodoroSession, PomodoroStats, StartPomodoroDto } from '../types/pomodoro';

export const pomodoroService = {
    // Получить все сессии задачи
    getSessions: async (taskId: number) => {
        const response = await api.get<PomodoroSession[]>(`/tasks/${taskId}/pomodoro/sessions`);
        return response.data;
    },

    // Получить статистику
    getStats: async (taskId: number) => {
        const response = await api.get<PomodoroStats>(`/tasks/${taskId}/pomodoro/stats`);
        return response.data;
    },

    // Начать сессию
    start: async (taskId: number, dto: StartPomodoroDto) => {
        const response = await api.post<PomodoroSession>(`/tasks/${taskId}/pomodoro/start`, dto);
        return response.data;
    },

    // Завершить сессию
    stop: async (sessionId: number, completed: boolean = true) => {
        const response = await api.put<PomodoroSession>(`/pomodoro/${sessionId}/stop`, { completed });
        return response.data;
    },
};