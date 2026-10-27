import { api } from './api';
import type { Event, CreateEventDto, UpdateEventDto } from '../types/event';

export const eventService = {
    getAll: async () => {
        const response = await api.get<Event[]>('/events');
        return response.data;
    },

    getForCalendar: async (start: string, end: string) => {
        const response = await api.get<Event[]>('/events/calendar', {
            params: { start, end },
        });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Event>(`/events/${id}`);
        return response.data;
    },

    create: async (data: CreateEventDto) => {
        const response = await api.post<Event>('/events', data);
        return response.data;
    },

    update: async (id: number, data: UpdateEventDto) => {
        const response = await api.put<Event>(`/events/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/events/${id}`);
    },
};