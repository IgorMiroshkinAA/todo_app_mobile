import type { Attachment } from './attachment';

export interface Note {
  id: number;
  title: string;
  content?: string;
  notebookId: number;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[]; // <-- Добавьте это поле
}

export type CreateNoteDto = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'notebookId'>;
export type UpdateNoteDto = Partial<CreateNoteDto> & { notebookId?: number };