import type { Task } from './task';

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    extendedProps: {
        task: Task;
        priority: 'low' | 'medium' | 'high';
        status: 'todo' | 'in_progress' | 'done';
        completed: boolean;
    };
}