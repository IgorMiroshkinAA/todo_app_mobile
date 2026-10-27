export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateTaskDto = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'status'> & {
  completed?: boolean;
  status?: TaskStatus;
};

export type UpdateTaskDto = Partial<CreateTaskDto> & {
  completed?: boolean;
  status?: TaskStatus;
};