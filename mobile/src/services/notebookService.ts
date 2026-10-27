import { api } from './api';
import type { Notebook, CreateNotebookDto, UpdateNotebookDto } from '../types/notebook';

export const notebookService = {
  getAll: async () => {
    const response = await api.get<Notebook[]>('/notebooks');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get<Notebook>(`/notebooks/${id}`);
    return response.data;
  },
  create: async (data: CreateNotebookDto) => {
    const response = await api.post<Notebook>('/notebooks', data);
    return response.data;
  },
  update: async (id: number, data: UpdateNotebookDto) => {
    const response = await api.put<Notebook>(`/notebooks/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/notebooks/${id}`);
  },
};