export type NotificationType = 'overdue' | 'upcoming' | 'event_soon';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
    read: boolean;
    taskId?: number | null;
    eventId?: number | null;
    createdAt: string;
    task?: {
        id: number;
        title: string;
    };
    event?: {
        id: number;
        title: string;
    };
}