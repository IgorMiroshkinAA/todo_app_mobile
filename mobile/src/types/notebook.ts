export interface Notebook {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateNotebookDto = Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateNotebookDto = Partial<CreateNotebookDto>;