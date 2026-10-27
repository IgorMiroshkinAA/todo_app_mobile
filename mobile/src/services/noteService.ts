import { api } from './api';
import type { Note, CreateNoteDto, UpdateNoteDto } from '../types/note';

export const noteService = {
  // Получить все заметки (глобально) с параметрами
  getAll: async (params?: { search?: string; sortBy?: string; sortOrder?: string }) => {
    const response = await api.get<Note[]>('/notes', { params });
    return response.data;
  },

  // Получить заметки конкретной записной книжки с параметрами
  getAllByNotebook: async (notebookId: number, params?: { search?: string; sortBy?: string; sortOrder?: string }) => {
    const response = await api.get<Note[]>(`/notebooks/${notebookId}/notes`, { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Note>(`/notes/${id}`);
    return response.data;
  },

  create: async (notebookId: number, data: CreateNoteDto) => {
    const response = await api.post<Note>(`/notebooks/${notebookId}/notes`, data);
    return response.data;
  },

  update: async (id: number, data: UpdateNoteDto) => {
    const response = await api.put<Note>(`/notes/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/notes/${id}`);
  },

  // Экспорт в JSON
  exportNotes: async () => {
    const response = await api.get<Note[]>('/notes/export');
    return response.data;
  },

  // Импорт из JSON
  importNotes: async (notes: any[]) => {
    const response = await api.post<{ imported: number; skipped: number }>('/notes/import', notes);
    return response.data;
  },

  exportDocx: async (id: number) => {
    const response = await api.get(`/notes/export/docx/${id}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};