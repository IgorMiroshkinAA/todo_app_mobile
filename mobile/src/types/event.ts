export type EventType = 'meeting' | 'call' | 'appointment' | 'other';

export interface Event {
    id: number;
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    location?: string;
    type: EventType;
    attendees?: string[];
    synced: boolean;
    externalId?: string;
    externalProvider: string;
    createdAt: string;
    updatedAt: string;
}

export type CreateEventDto = Omit<Event, 'id' | 'synced' | 'externalId' | 'externalProvider' | 'createdAt' | 'updatedAt'>;
export type UpdateEventDto = Partial<CreateEventDto>;