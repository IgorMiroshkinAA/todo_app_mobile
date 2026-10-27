import { api } from './api';
import type { Attachment } from '../types/attachment';

export const attachmentService = {
    // Получить все вложения заметки
    getAllByNote: async (noteId: number) => {
        const response = await api.get<Attachment[]>(`/attachments/note/${noteId}`);
        return response.data;
    },

    // Загрузить файл (исправленная версия)
    upload: async (noteId: number, file: File) => {
        const formData = new FormData();
        // Добавляем файл с явным указанием имени в UTF-8
        formData.append('file', file, file.name);

        const response = await api.post<Attachment>(
            `/attachments/upload/${noteId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
        return response.data;
    },

    // Скачать файл
    getDownloadUrl: (id: number) => {
        return `${api.defaults.baseURL}/attachments/download/${id}`;
    },

    // Удалить вложение
    delete: async (id: number) => {
        await api.delete(`/attachments/${id}`);
    },
};