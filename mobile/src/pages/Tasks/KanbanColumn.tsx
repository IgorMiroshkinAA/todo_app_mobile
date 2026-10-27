import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../../types/task';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
    title: string;
    status: TaskStatus;
    tasks: Task[];
    onUpdateStatus: (taskId: number, newStatus: TaskStatus) => void;
    onToggleComplete: (task: Task) => void;
    onDeleteTask: (id: number, title: string) => void;
    onEditTask: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
                                                       title,
                                                       status,
                                                       tasks,
                                                       onUpdateStatus,
                                                       onToggleComplete,
                                                       onDeleteTask,
                                                       onEditTask,
                                                   }) => {
    const theme = useTheme();
    const { setNodeRef } = useDroppable({
        id: `column-${status}`,
    });

    const getColumnColor = () => {
        switch (status) {
            case 'todo': return theme.palette.info.light;
            case 'in_progress': return theme.palette.warning.light;
            case 'done': return theme.palette.success.light;
            default: return theme.palette.grey[300];
        }
    };

    return (
        <Paper
            ref={setNodeRef}
            sx={{
                width: '100%',
                height: 'calc(100vh - 340px)', // ← фиксированная высота
                minHeight: 300,
                p: 1.5,
                bgcolor: getColumnColor(),
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden', // ← скрываем внешний overflow
            }}
        >
            {/* Заголовок колонки */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                    flexShrink: 0,
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold">
                    {title}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        bgcolor: 'rgba(0,0,0,0.1)',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                    }}
                >
                    {tasks.length}
                </Typography>
            </Box>

            {/* Скроллируемая область с задачами */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch', // ← плавный скролл на iOS
                    pr: 0.5, // отступ для скроллбара
                }}
            >
                <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onUpdateStatus={onUpdateStatus}
                                onToggleComplete={onToggleComplete}
                                onDeleteTask={onDeleteTask}
                                onEditTask={onEditTask}
                            />
                        ))}
                    </Box>
                </SortableContext>
            </Box>
        </Paper>
    );
};

export default KanbanColumn;