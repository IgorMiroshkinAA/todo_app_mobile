export type PomodoroType = 'work' | 'short_break' | 'long_break';

export interface PomodoroSession {
    id: number;
    startedAt: string;
    endedAt?: string;
    duration: number;
    type: PomodoroType;
    completed: boolean;
    taskId: number;
    createdAt: string;
    updatedAt: string;
}

export interface PomodoroStats {
    totalSessions: number;
    totalMinutes: number;
    completedWorkSessions: number;
    todaySessions: number;
    todayMinutes: number;
}

export interface StartPomodoroDto {
    duration?: number;
    type?: PomodoroType;
}