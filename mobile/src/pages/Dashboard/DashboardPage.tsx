import React, { useEffect, useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    LinearProgress,
    Card,
    CardContent,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
} from '@mui/material';
import {
    Assignment as TaskIcon,
    CheckCircle as DoneIcon,
    Pending as PendingIcon,
    Note as NoteIcon,
    Description as NotebookIcon,
    Event as EventIcon,
    Refresh as RefreshIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { taskService } from '../../services/taskService';
import { noteService } from '../../services/noteService';
import { notebookService } from '../../services/notebookService';
import { eventService } from '../../services/eventService';
import type { Event } from '../../types/event';
import useSnackbar from '../../hooks/useSnackbar';

const DashboardPage: React.FC = () => {
    const { showError } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        totalNotes: 0,
        totalNotebooks: 0,
        totalEvents: 0,
    });
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

    useEffect(() => {
        loadStats();

        const handleFocus = () => loadStats();
        window.addEventListener('focus', handleFocus);

        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const [tasks, notes, notebooks, events] = await Promise.all([
                taskService.getAll(),
                noteService.getAll(),
                notebookService.getAll(),
                eventService.getAll(),
            ]);

            const now = new Date();

            const completedTasks = tasks.filter((t) => t.status === 'done');
            const pendingTasks = tasks.filter((t) => t.status !== 'done');
            const overdue = tasks.filter(
                (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
            );

            const upcoming = events
                .filter((e) => new Date(e.startTime) >= now)
                .sort(
                    (a, b) =>
                        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                )
                .slice(0, 5);

            setStats({
                totalTasks: tasks.length,
                completedTasks: completedTasks.length,
                pendingTasks: pendingTasks.length,
                overdueTasks: overdue.length,
                totalNotes: notes.length,
                totalNotebooks: notebooks.length,
                totalEvents: events.length,
            });

            setUpcomingEvents(upcoming);
        } catch (error) {
            console.error('Failed to load stats:', error);
            showError('Не удалось загрузить статистику');
        } finally {
            setLoading(false);
        }
    };

    const completionRate =
        stats.totalTasks > 0
            ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
            : 0;

    const formatEventDate = (isoString: string): string => {
        const date = new Date(isoString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const timeStr = date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        });

        if (eventDate.getTime() === today.getTime()) {
            return `Сегодня, ${timeStr}`;
        }
        if (eventDate.getTime() === tomorrow.getTime()) {
            return `Завтра, ${timeStr}`;
        }

        return `${date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
        })}, ${timeStr}`;
    };

    const getEventColor = (type: string): string => {
        switch (type) {
            case 'meeting':
                return '#9c27b0';
            case 'call':
                return '#2196f3';
            case 'appointment':
                return '#ff9800';
            default:
                return '#9e9e9e';
        }
    };

    const StatCard: React.FC<{
        title: string;
        value: number;
        icon: React.ReactNode;
        color: string;
    }> = ({ title, value, icon, color }) => (
        <Card sx={{ height: '100%', width: '100%' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            bgcolor: `${color}20`,
                            borderRadius: 2,
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 44,
                            minHeight: 44,
                        }}
                    >
                        {icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h5" fontWeight="bold" noWrap>
                            {value}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" noWrap>
                            {title}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ width: '100%', mt: 5 }}>
            {/* Заголовок */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                    gap: 1,
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        📊 Дашборд
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Статистика ваших задач, заметок и встреч
                    </Typography>
                </Box>
                <IconButton onClick={loadStats} disabled={loading} size="small">
                    <RefreshIcon />
                </IconButton>
            </Box>

            {/* Контейнер с карточками — flex вместо Grid */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    width: '100%',
                }}
            >
                {/* Карточки статистики — 2 в ряд */}
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150, maxWidth: 'calc(50% - 8px)' }}>
                    <StatCard
                        title="Всего задач"
                        value={stats.totalTasks}
                        icon={<TaskIcon sx={{ color: '#1976d2' }} />}
                        color="#1976d2"
                    />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150, maxWidth: 'calc(50% - 8px)' }}>
                    <StatCard
                        title="Выполнено"
                        value={stats.completedTasks}
                        icon={<DoneIcon sx={{ color: '#4caf50' }} />}
                        color="#4caf50"
                    />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150, maxWidth: 'calc(50% - 8px)' }}>
                    <StatCard
                        title="В работе"
                        value={stats.pendingTasks}
                        icon={<PendingIcon sx={{ color: '#ff9800' }} />}
                        color="#ff9800"
                    />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 150, maxWidth: 'calc(50% - 8px)' }}>
                    <StatCard
                        title="Просрочено"
                        value={stats.overdueTasks}
                        icon={<PendingIcon sx={{ color: '#f44336' }} />}
                        color="#f44336"
                    />
                </Box>

                {/* Прогресс выполнения */}
                <Box sx={{ flex: '1 1 100%', width: '100%' }}>
                    <Paper sx={{ p: 2, width: '100%' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Прогресс выполнения
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={completionRate}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                                {completionRate}%
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                            {stats.completedTasks} из {stats.totalTasks} задач выполнено
                        </Typography>
                    </Paper>
                </Box>

                {/* Заметки и книжки */}
                <Box sx={{ flex: '1 1 100%', width: '100%' }}>
                    <Paper sx={{ p: 2, width: '100%' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Заметки и книжки
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight="bold">
                                    {stats.totalNotes}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    <NoteIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                    Заметок
                                </Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem />
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight="bold">
                                    {stats.totalNotebooks}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    <NotebookIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                    Книжек
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                {/* Ближайшие встречи */}
                <Box sx={{ flex: '1 1 100%', width: '100%' }}>
                    <Paper sx={{ p: 2, width: '100%' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1.5,
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                📅 Ближайшие встречи
                            </Typography>
                            {stats.totalEvents > 0 && (
                                <Chip
                                    label={`Всего: ${stats.totalEvents}`}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                        </Box>

                        {upcomingEvents.length === 0 ? (
                            <Box sx={{ py: 3, textAlign: 'center' }}>
                                <CalendarIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body2" color="textSecondary">
                                    Нет предстоящих встреч
                                </Typography>
                            </Box>
                        ) : (
                            <List sx={{ p: 0 }}>
                                {upcomingEvents.map((event) => (
                                    <ListItem
                                        key={event.id}
                                        sx={{
                                            borderLeft: `4px solid ${getEventColor(event.type)}`,
                                            mb: 1,
                                            borderRadius: 1,
                                            bgcolor: 'background.default',
                                            px: 1.5,
                                            py: 1,
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <EventIcon sx={{ color: getEventColor(event.type) }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" fontWeight={500}>
                                                    {event.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: getEventColor(event.type),
                                                    }}
                                                >
                                                    {formatEventDate(event.startTime)}
                                                    {event.location && ` • ${event.location}`}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardPage;