export interface Subtask {
    id: number;
    title: string;
    completed: boolean;
    taskId: number;
    createdAt: string;
    updatedAt: string;
}

export type CreateSubtaskDto = Omit<Subtask, 'id' | 'createdAt' | 'updatedAt' | 'taskId'>;
export type UpdateSubtaskDto = Partial<CreateSubtaskDto> & {
    completed?: boolean;
};