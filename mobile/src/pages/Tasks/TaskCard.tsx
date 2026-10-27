import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    Checkbox,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, TaskStatus } from '../../types/task';
import type { Subtask } from '../../types/subtask';
import { subtaskService } from '../../services/subtaskService';
import { pomodoroService } from '../../services/pomodoroService';
import type { PomodoroStats } from '../../types/pomodoro';
import PomodoroTimer from '../../components/PomodoroTimer';
import { isoToLocalInput } from '../../utils/dateUtils';

interface TaskCardProps {
    task: Task;
    onUpdateStatus: (taskId: number, newStatus: TaskStatus) => void;
    onToggleComplete: (task: Task) => void;
    onDeleteTask: (id: number, title: string) => void;
    onEditTask: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
                                               task,
                                               onUpdateStatus,
                                               onToggleComplete,
                                               onDeleteTask,
                                               onEditTask,
                                           }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [editingTask, setEditingTask] = useState<Task>(task);

    const [openPomodoro, setOpenPomodoro] = useState(false);
    const [pomodoroStats, setPomodoroStats] = useState<PomodoroStats | null>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    // Проверка просрочки
    const isOverdue = (() => {
        if (!task.dueDate || task.status === 'done') return false;

        const dueDate = new Date(task.dueDate);
        const now = new Date();

        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return dueDateOnly < nowOnly;
    })();

    const priorityColor = (p: string) => {
        switch (p) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const loadSubtasks = async () => {
        try {
            const data = await subtaskService.getAllByTask(task.id);
            setSubtasks(data);
        } catch (error) {
            console.error('Failed to load subtasks:', error);
        }
    };

    const loadPomodoroStats = async () => {
        try {
            const data = await pomodoroService.getStats(task.id);
            setPomodoroStats(data);
        } catch (error) {
            console.error('Failed to load pomodoro stats:', error);
        }
    };

    useEffect(() => {
        loadPomodoroStats();
    }, [task.id]);

    useEffect(() => {
        loadSubtasks();
    }, [task.id]);

    useEffect(() => {
        if (openDialog) {
            loadSubtasks();
        }
    }, [openDialog]);

    const handleOpenDialog = () => {
        if (isSortableDragging) return;
        setEditingTask(task);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim()) return;
        try {
            await subtaskService.create(task.id, { title: newSubtaskTitle });
            setNewSubtaskTitle('');
            loadSubtasks();
        } catch (error) {
            console.error('Failed to add subtask:', error);
        }
    };

    const handleToggleSubtask = async (subtask: Subtask) => {
        try {
            await subtaskService.update(subtask.id, { completed: !subtask.completed });
            loadSubtasks();
        } catch (error) {
            console.error('Failed to update subtask:', error);
        }
    };

    const handleDeleteSubtask = async (id: number) => {
        try {
            await subtaskService.delete(id);
            loadSubtasks();
        } catch (error) {
            console.error('Failed to delete subtask:', error);
        }
    };

    const handleSaveTask = async () => {
        try {
            await onEditTask(editingTask);
            handleCloseDialog();
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSortableDragging) return;
        onToggleComplete(task);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSortableDragging) return;
        onEditTask(task);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSortableDragging) return;
        onDeleteTask(task.id, task.title);
    };

    const handlePomodoroClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSortableDragging) return;
        setOpenPomodoro(true);
    };

    // Перемещение между статусами
    const handleMoveStatus = async (direction: 'prev' | 'next') => {
        const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
        const currentIndex = statuses.indexOf(task.status);

        let newIndex = currentIndex;
        if (direction === 'next' && currentIndex < statuses.length - 1) {
            newIndex = currentIndex + 1;
        } else if (direction === 'prev' && currentIndex > 0) {
            newIndex = currentIndex - 1;
        }

        if (newIndex !== currentIndex) {
            await onUpdateStatus(task.id, statuses[newIndex]);
        }
    };

    const handleMovePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSortableDragging) return;
        handleMoveStatus('prev');
    };

    const handleMoveNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSortableDragging) return;
        handleMoveStatus('next');
    };

    const completedSubtasks = subtasks.filter(s => s.completed).length;
    const totalSubtasks = subtasks.length;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
        <>
            <Card
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                sx={{
                    cursor: 'grab',
                    border: isOverdue ? '2px solid red' : 'none',
                    '&:hover': { boxShadow: 6 },
                }}
            >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    {/* Заголовок + чекбокс */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                textDecoration: task.status === 'done' ? 'line-through' : 'none',
                                flex: 1,
                                cursor: 'pointer',
                                wordBreak: 'break-word',
                                fontWeight: 600,
                            }}
                            onClick={handleOpenDialog}
                        >
                            {task.title}
                        </Typography>
                        <Checkbox
                            checked={task.status === 'done'}
                            onChange={handleCheckboxClick}
                            onClick={(e) => e.stopPropagation()}
                            size="small"
                            sx={{ p: 0.5, ml: 0.5 }}
                        />
                    </Box>

                    {/* Описание */}
                    {task.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {task.description.length > 100 ? `${task.description.slice(0, 100)}...` : task.description}
                        </Typography>
                    )}

                    {/* Чипы (приоритет, дата, подзадачи, помодоро) */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        <Chip
                            label={task.priority}
                            size="small"
                            color={priorityColor(task.priority)}
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                        {task.dueDate && (
                            <Chip
                                label={new Date(task.dueDate).toLocaleDateString()}
                                size="small"
                                variant="outlined"
                                color={isOverdue ? 'error' : 'default'}
                                sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                        )}
                        {totalSubtasks > 0 && (
                            <Chip
                                label={`${completedSubtasks}/${totalSubtasks}`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                        )}
                        {pomodoroStats && pomodoroStats.totalMinutes > 0 && (
                            <Chip
                                icon={<TimerIcon sx={{ fontSize: 14 }} />}
                                label={`${pomodoroStats.completedWorkSessions} 🍅`}
                                size="small"
                                variant="outlined"
                                color="error"
                                sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                        )}
                    </Box>

                    {totalSubtasks > 0 && (
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ mt: 1, height: 4, borderRadius: 2 }}
                        />
                    )}

                    {/* Панель действий: стрелки слева, действия справа */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 1,
                            pt: 1,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        {/* Стрелки перемещения */}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {task.status !== 'todo' && (
                                <Tooltip title="Назад">
                                    <IconButton
                                        size="small"
                                        onClick={handleMovePrev}
                                        sx={{ p: 0.5 }}
                                    >
                                        <ArrowBackIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {task.status !== 'done' && (
                                <Tooltip title="Вперёд">
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={handleMoveNext}
                                        sx={{ p: 0.5 }}
                                    >
                                        <ArrowForwardIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>

                        {/* Действия */}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Помодоро">
                                <IconButton
                                    size="small"
                                    onClick={handlePomodoroClick}
                                    color="error"
                                    sx={{ p: 0.5 }}
                                >
                                    <TimerIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Редактировать">
                                <IconButton size="small" onClick={handleEditClick} sx={{ p: 0.5 }}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить">
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={handleDeleteClick}
                                    sx={{ p: 0.5 }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Диалог редактирования — полноэкранный для мобильных */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullScreen
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Редактировать задачу
                        <IconButton onClick={handleCloseDialog}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Название"
                        fullWidth
                        value={editingTask.title}
                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Описание"
                        fullWidth
                        multiline
                        rows={3}
                        value={editingTask.description || ''}
                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Срок выполнения"
                        type="datetime-local"
                        fullWidth
                        value={isoToLocalInput(editingTask.dueDate)}
                        onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* Подзадачи */}
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Подзадачи
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Название подзадачи"
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            fullWidth
                        />
                        <Button variant="contained" onClick={handleAddSubtask}>
                            <AddIcon />
                        </Button>
                    </Box>

                    <List dense>
                        {subtasks.map((subtask) => (
                            <ListItem key={subtask.id} sx={{ px: 0 }}>
                                <Checkbox
                                    checked={subtask.completed}
                                    onChange={() => handleToggleSubtask(subtask)}
                                    size="small"
                                />
                                <ListItemText
                                    primary={subtask.title}
                                    sx={{
                                        textDecoration: subtask.completed ? 'line-through' : 'none',
                                    }}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton size="small" color="error" onClick={() => handleDeleteSubtask(subtask.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog}>Отмена</Button>
                    <Button onClick={handleSaveTask} variant="contained">Сохранить</Button>
                </DialogActions>
            </Dialog>

            {/* Помодоро-таймер */}
            <PomodoroTimer
                open={openPomodoro}
                taskId={task.id}
                taskTitle={task.title}
                onClose={() => {
                    setOpenPomodoro(false);
                    loadPomodoroStats();
                }}
                onSessionComplete={loadPomodoroStats}
            />
        </>
    );
};

export default TaskCard;