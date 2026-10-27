import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    CircularProgress,
    Paper,
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { taskService } from '../../services/taskService';
import type { Task, TaskStatus } from '../../types/task';
import AddIcon from '@mui/icons-material/Add';
import TodayIcon from '@mui/icons-material/Today';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import { useTheme } from '../../contexts/ThemeContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import useSnackbar from '../../hooks/useSnackbar';
import EventDialog from '../../components/EventDialog';
import { eventService } from '../../services/eventService';
import type { Event as EventType } from '../../types/event';

interface CalendarEvent {
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
    };
}

const CalendarPage: React.FC = () => {
    const calendarRef = useRef<any>(null);
    const { showSuccess, showError } = useSnackbar();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    const [openEventDialog, setOpenEventDialog] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
    const [defaultEventDate, setDefaultEventDate] = useState<string>('');

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        id?: number;
        title: string;
        message: string;
    }>({
        open: false,
        title: '',
        message: '',
    });

    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [selectedDate, setSelectedDate] = useState<string>('');

    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [editStatus, setEditStatus] = useState<TaskStatus>('todo');

    const { mode } = useTheme();
    const isDarkMode = mode === 'dark';

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const loadTasks = async (start: Date, end: Date) => {
        setLoading(true);
        try {
            const [tasks, events] = await Promise.all([
                taskService.getCalendarTasks(start.toISOString(), end.toISOString()),
                loadEvents(start, end),
            ]);

            const calendarEvents = tasks.map((task: Task) => ({
                id: String(task.id),
                title: task.title,
                start: task.dueDate || new Date().toISOString(),
                allDay: true,
                backgroundColor: getPriorityColor(task.priority),
                borderColor: getPriorityColor(task.priority),
                textColor: '#ffffff',
                extendedProps: {
                    isEvent: false,
                    task: task,
                },
                className: task.completed ? 'completed-task' : '',
            }));

            setEvents([...calendarEvents, ...events] as any);
        } catch (error) {
            console.error('Failed to load calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadEvents = async (start: Date, end: Date) => {
        try {
            const events = await eventService.getForCalendar(
                start.toISOString(),
                end.toISOString(),
            );
            return events.map((event: EventType) => ({
                id: `event-${event.id}`,
                title: `📅 ${event.title}`,
                start: event.startTime,
                end: event.endTime,
                allDay: true,
                backgroundColor: '#9c27b0',
                borderColor: '#9c27b0',
                textColor: '#ffffff',
                extendedProps: {
                    isEvent: true,
                    event,
                },
            }));
        } catch (error) {
            console.error('Failed to load events:', error);
            return [];
        }
    };

    const handleDatesSet = (dateInfo: any) => {
        const { start, end } = dateInfo;
        setCurrentDate(start);
        loadTasks(start, end);
    };

    const handleEventClick = (clickInfo: any) => {
        if (clickInfo.event.extendedProps.isEvent) {
            setSelectedEvent(clickInfo.event.extendedProps.event);
            setOpenEventDialog(true);
        } else {
            const task = clickInfo.event.extendedProps.task;
            if (task) {
                setSelectedTask(task);
                setEditTitle(task.title);
                setEditDescription(task.description || '');
                setEditPriority(task.priority);
                setEditStatus(task.status);
                setOpenDialog(true);
            }
        }
    };

    const handleEventDrop = async (dropInfo: any) => {
        const taskId = parseInt(dropInfo.event.id);
        const newDate = dropInfo.event.startStr;

        try {
            await taskService.moveToDate(taskId, newDate);
            const updatedEvent = dropInfo.event;
            updatedEvent.setStart(newDate);
            updatedEvent.setAllDay(true);
            showSuccess('Задача перемещена');

            try {
                if (calendarRef.current) {
                    const calendarApi = calendarRef.current.getApi();
                    const start = calendarApi.view.activeStart;
                    const end = calendarApi.view.activeEnd;
                    await loadTasks(start, end);
                }
            } catch (loadError) {
                console.error('Failed to refresh calendar:', loadError);
            }
        } catch (error) {
            console.error('Failed to move task:', error);
            showError('Не удалось переместить задачу');
            dropInfo.revert();
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#f44336';
            case 'medium': return '#ff9800';
            case 'low': return '#4caf50';
            default: return '#9e9e9e';
        }
    };

    const goToToday = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.today();
            const now = new Date();
            setCurrentDate(now);
            const start = calendarApi.view.activeStart;
            const end = calendarApi.view.activeEnd;
            loadTasks(start, end);
        }
    };

    useEffect(() => {
        setCurrentDate(new Date());
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        loadTasks(start, end);
    }, []);

    const handleCreateTask = async () => {
        if (!newTitle.trim()) {
            showError('Введите название задачи');
            return;
        }

        let dueDate: string;
        if (selectedDate) {
            const dateObj = new Date(selectedDate);
            dateObj.setHours(23, 59, 59, 999);
            dueDate = dateObj.toISOString();
        } else {
            const dateObj = new Date();
            dateObj.setHours(23, 59, 59, 999);
            dueDate = dateObj.toISOString();
        }

        try {
            await taskService.create({
                title: newTitle,
                description: newDescription,
                dueDate: dueDate,
                priority: newPriority,
                status: 'todo',
            });

            setOpenCreateDialog(false);
            setNewTitle('');
            setNewDescription('');
            setNewPriority('medium');
            showSuccess('Задача создана');

            try {
                if (calendarRef.current) {
                    const calendarApi = calendarRef.current.getApi();
                    const start = calendarApi.view.activeStart;
                    const end = calendarApi.view.activeEnd;
                    await loadTasks(start, end);
                }
            } catch (loadError) {
                console.error('Failed to refresh calendar:', loadError);
            }
        } catch (error) {
            console.error('Failed to create task:', error);
            showError('Не удалось создать задачу');
        }
    };

    const handleEditTask = async () => {
        if (!selectedTask) return;

        try {
            await taskService.update(selectedTask.id, {
                title: editTitle,
                description: editDescription,
                priority: editPriority,
                status: editStatus,
            });

            setOpenDialog(false);
            setSelectedTask(null);
            showSuccess('Задача обновлена');

            try {
                if (calendarRef.current) {
                    const calendarApi = calendarRef.current.getApi();
                    const start = calendarApi.view.activeStart;
                    const end = calendarApi.view.activeEnd;
                    await loadTasks(start, end);
                }
            } catch (loadError) {
                console.error('Failed to refresh calendar:', loadError);
            }
        } catch (error) {
            console.error('Failed to update task:', error);
            showError('Не удалось обновить задачу');
        }
    };

    const handleDeleteClick = () => {
        setConfirmDialog({
            open: true,
            id: selectedTask?.id,
            title: 'Удалить задачу?',
            message: `Вы уверены, что хотите удалить задачу "${selectedTask?.title}"? Это действие нельзя отменить.`,
        });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDialog.id) return;
        setDeleteLoading(true);
        try {
            await taskService.delete(confirmDialog.id);
            setOpenDialog(false);
            setSelectedTask(null);
            showSuccess('Задача удалена');

            try {
                if (calendarRef.current) {
                    const calendarApi = calendarRef.current.getApi();
                    const start = calendarApi.view.activeStart;
                    const end = calendarApi.view.activeEnd;
                    await loadTasks(start, end);
                }
            } catch (loadError) {
                console.error('Failed to refresh calendar:', loadError);
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
            showError('Не удалось удалить задачу');
        } finally {
            setDeleteLoading(false);
            setConfirmDialog({ open: false, title: '', message: '' });
        }
    };

    const handleCancelDelete = () => {
        setConfirmDialog({ open: false, title: '', message: '' });
    };

    const handleDateClick = (dateInfo: any) => {
        setSelectedDate(dateInfo.dateStr);
        setDefaultEventDate(dateInfo.dateStr);
        setOpenCreateDialog(true);
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mt: 5 }}>
            {/* 1. Заголовок + текущая дата */}
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    📅 Календарь
                </Typography>
                <Box
                    component={Paper}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.5,
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        borderRadius: 2,
                    }}
                >
                    <CalendarTodayIcon sx={{ fontSize: 18, color: isDarkMode ? '#90caf9' : '#1976d2' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(currentDate)}
                    </Typography>
                </Box>
            </Box>

            {/* 2. Кнопки в ряд */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    variant="outlined"
                    startIcon={<TodayIcon />}
                    onClick={goToToday}
                    sx={{ flex: '1 1 auto', minWidth: 0, fontSize: '0.8rem' }}
                >
                    Сегодня
                </Button>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setSelectedDate(new Date().toISOString());
                        setOpenCreateDialog(true);
                    }}
                    sx={{ flex: '1 1 auto', minWidth: 0, fontSize: '0.8rem' }}
                >
                    Задачу
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<EventIcon />}
                    onClick={() => {
                        setSelectedEvent(null);
                        setDefaultEventDate(new Date().toISOString().split('T')[0]);
                        setOpenEventDialog(true);
                    }}
                    sx={{ flex: '1 1 auto', minWidth: 0, fontSize: '0.8rem' }}
                >
                    Встречу
                </Button>
            </Box>

            {/* 3. Легенда — компактная */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <Chip label="Высокий" size="small" sx={{ bgcolor: '#f44336', color: '#fff', height: 22, fontSize: '0.7rem' }} />
                <Chip label="Средний" size="small" sx={{ bgcolor: '#ff9800', color: '#fff', height: 22, fontSize: '0.7rem' }} />
                <Chip label="Низкий" size="small" sx={{ bgcolor: '#4caf50', color: '#fff', height: 22, fontSize: '0.7rem' }} />
                <Chip label="📅 Встреча" size="small" sx={{ bgcolor: '#9c27b0', color: '#fff', height: 22, fontSize: '0.7rem' }} />
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={30} />
                </Box>
            )}

            {/* 4. Календарь */}
            <Box
                sx={{
                    bgcolor: isDarkMode ? '#1e1e1e' : '#ffffff',
                    borderRadius: 2,
                    overflow: 'hidden',
                    p: 1,
                    width: '100%',
                    '& .fc': {
                        fontSize: '0.75rem', // ← уменьшенный шрифт
                        '& .fc-toolbar': {
                            flexWrap: 'wrap',
                            gap: 0.5,
                            mb: 1,
                        },
                        '& .fc-toolbar-title': {
                            fontSize: '1rem !important',
                            color: isDarkMode ? '#ffffff' : '#000000',
                        },
                        '& .fc-button': {
                            padding: '4px 8px !important',
                            fontSize: '0.75rem !important',
                            backgroundColor: isDarkMode ? '#2d2d2d' : '#1976d2',
                            borderColor: isDarkMode ? '#444444' : '#1976d2',
                            color: '#ffffff',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: isDarkMode ? '#3d3d3d' : '#1565c0',
                            },
                        },
                        '& .fc-button-active': {
                            backgroundColor: isDarkMode ? '#1976d2 !important' : '#1565c0 !important',
                        },
                        '& .fc-icon': {
                            fontSize: '1em',
                        },
                        // Дни недели
                        '& .fc-col-header-cell': {
                            backgroundColor: isDarkMode ? '#2d2d2d' : '#f5f5f5',
                            padding: '4px 0',
                        },
                        '& .fc-col-header-cell-cushion': {
                            color: isDarkMode ? '#ffffff' : '#000000',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            textDecoration: 'none',
                        },
                        // Ячейки дней
                        '& .fc-daygrid-day': {
                            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                        },
                        '& .fc-daygrid-day-frame': {
                            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                            minHeight: '60px !important',
                        },
                        '& .fc-daygrid-day-number': {
                            color: isDarkMode ? '#ffffff' : '#000000',
                            padding: '2px 4px',
                            fontSize: '0.75rem',
                        },
                        '& .fc-day-other': {
                            backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                        },
                        '& .fc-day-other .fc-daygrid-day-number': {
                            color: isDarkMode ? '#666666' : '#999999',
                        },
                        // Сегодня
                        '& .fc-day-today': {
                            backgroundColor: isDarkMode ? '#1a237e !important' : '#e3f2fd !important',
                        },
                        '& .fc-day-today .fc-daygrid-day-number': {
                            backgroundColor: '#1976d2 !important',
                            color: '#ffffff !important',
                            borderRadius: '50% !important',
                            width: '24px !important',
                            height: '24px !important',
                            display: 'flex !important',
                            alignItems: 'center !important',
                            justifyContent: 'center !important',
                            fontWeight: 'bold !important',
                            margin: '2px !important',
                            fontSize: '0.75rem !important',
                            padding: 0,
                        },
                        '& .fc-scrollgrid': {
                            borderColor: isDarkMode ? '#444444' : '#e0e0e0',
                        },
                        '& .fc-scrollgrid-section': {
                            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                        },
                        // События
                        '& .fc-event': {
                            fontSize: '0.65rem',
                            padding: '1px 2px',
                            border: 'none',
                            cursor: 'pointer',
                        },
                        '& .fc-daygrid-event': {
                            marginTop: '1px',
                            whiteSpace: 'normal',
                        },
                        '& .fc-daygrid-more-link': {
                            color: isDarkMode ? '#90caf9' : '#1976d2',
                            fontSize: '0.65rem',
                        },
                    },
                }}
            >
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
                    headerToolbar={{
                        left: 'prev,next',
                        center: 'title',
                        right: 'today',
                    }}
                    footerToolbar={{
                        left: '',
                        center: 'dayGridMonth,timeGridWeek',
                        right: '',
                    }}
                    initialView="dayGridMonth"
                    events={events}
                    datesSet={handleDatesSet}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    dateClick={handleDateClick}
                    editable={true}
                    droppable={true}
                    eventDurationEditable={true}
                    eventStartEditable={true}
                    allDaySlot={true}
                    height="auto"
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: false,
                    }}
                    eventClassNames={(arg) => {
                        const task = arg.event.extendedProps.task;
                        return task?.completed ? 'completed-task' : '';
                    }}
                    eventContent={(arg) => {
                        const task = arg.event.extendedProps.task;
                        return {
                            html: `
                                <div style="
                                    padding: 1px 2px;
                                    font-size: 0.65rem;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    ${task?.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}
                                    color: #ffffff;
                                ">
                                    ${arg.event.title}
                                </div>
                            `,
                        };
                    }}
                />
            </Box>

            <style>
                {`
                    .completed-task .fc-event-title {
                        text-decoration: line-through;
                        opacity: 0.7;
                    }
                    .fc-day:hover {
                        background-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
                    }
                    /* Убираем нижнюю границу у header, чтобы не было лишней линии */
                    .fc-theme-standard .fc-scrollgrid {
                        border-color: ${isDarkMode ? '#444444' : '#e0e0e0'};
                    }
                `}
            </style>

            {/* Диалог задачи — fullScreen */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullScreen>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Задача</Typography>
                        <IconButton onClick={() => setOpenDialog(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Название"
                        fullWidth
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Описание"
                        fullWidth
                        multiline
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Приоритет</InputLabel>
                        <Select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                            label="Приоритет"
                        >
                            <MenuItem value="low">Низкий</MenuItem>
                            <MenuItem value="medium">Средний</MenuItem>
                            <MenuItem value="high">Высокий</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Статус</InputLabel>
                        <Select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                            label="Статус"
                        >
                            <MenuItem value="todo">К выполнению</MenuItem>
                            <MenuItem value="in_progress">В процессе</MenuItem>
                            <MenuItem value="done">Выполнено</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Button color="error" onClick={handleDeleteClick}>
                        Удалить
                    </Button>
                    <Box>
                        <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
                        <Button onClick={handleEditTask} variant="contained" sx={{ ml: 1 }}>
                            Сохранить
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Диалог создания задачи — fullScreen */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullScreen>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Создать задачу</Typography>
                        <IconButton onClick={() => setOpenCreateDialog(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название"
                        fullWidth
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Описание"
                        fullWidth
                        multiline
                        rows={3}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Дата выполнения"
                        type="date"
                        fullWidth
                        value={selectedDate ? selectedDate.split('T')[0] : ''}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Приоритет</InputLabel>
                        <Select
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                            label="Приоритет"
                        >
                            <MenuItem value="low">Низкий</MenuItem>
                            <MenuItem value="medium">Средний</MenuItem>
                            <MenuItem value="high">Высокий</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenCreateDialog(false)}>Отмена</Button>
                    <Button onClick={handleCreateTask} variant="contained">
                        Создать
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                severity="error"
                loading={deleteLoading}
            />

            <EventDialog
                open={openEventDialog}
                onClose={() => setOpenEventDialog(false)}
                onSaved={() => {
                    if (calendarRef.current) {
                        const calendarApi = calendarRef.current.getApi();
                        const start = calendarApi.view.activeStart;
                        const end = calendarApi.view.activeEnd;
                        loadTasks(start, end);
                    }
                }}
                onDeleted={() => {
                    if (calendarRef.current) {
                        const calendarApi = calendarRef.current.getApi();
                        const start = calendarApi.view.activeStart;
                        const end = calendarApi.view.activeEnd;
                        loadTasks(start, end);
                    }
                }}
                event={selectedEvent}
                defaultDate={defaultEventDate}
            />
        </Box>
    );
};

export default CalendarPage;