import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    IconButton,
    Chip,
    CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { pomodoroService } from '../services/pomodoroService';
import type { PomodoroType, PomodoroStats } from '../types/pomodoro';
import useSnackbar from '../hooks/useSnackbar';

interface PomodoroTimerProps {
    open: boolean;
    taskId: number;
    taskTitle: string;
    onClose: () => void;
    onSessionComplete?: () => void;
}

const PRESETS = {
    work: 25,
    short_break: 5,
    long_break: 15,
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
                                                         open,
                                                         taskId,
                                                         taskTitle,
                                                         onClose,
                                                         onSessionComplete,
                                                     }) => {
    const { showSuccess, showError } = useSnackbar();
    const [type, setType] = useState<PomodoroType>('work');
    const [duration, setDuration] = useState(PRESETS.work); // в минутах
    const [timeLeft, setTimeLeft] = useState(PRESETS.work * 60); // в секундах
    const [isRunning, setIsRunning] = useState(false);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [stats, setStats] = useState<PomodoroStats | null>(null);
    const [completedCycles, setCompletedCycles] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Загружаем статистику при открытии
    useEffect(() => {
        if (open) {
            loadStats();
        }
    }, [open, taskId]);

    const loadStats = async () => {
        try {
            const data = await pomodoroService.getStats(taskId);
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    // Таймер
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            handleComplete();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, timeLeft]);

    const handleComplete = async () => {
        setIsRunning(false);
        if (sessionId) {
            try {
                await pomodoroService.stop(sessionId, true);
                setSessionId(null);
                showSuccess('Сессия завершена!');

                if (type === 'work') {
                    setCompletedCycles((prev) => prev + 1);
                }

                loadStats();
                onSessionComplete?.();
            } catch (error) {
                console.error('Failed to stop session:', error);
            }
        }
    };

    const handleStart = async () => {
        try {
            const session = await pomodoroService.start(taskId, {
                duration,
                type,
            });
            setSessionId(session.id);
            setIsRunning(true);
        } catch (error) {
            console.error('Failed to start session:', error);
            showError('Не удалось начать сессию');
        }
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleResume = () => {
        setIsRunning(true);
    };

    const handleStop = async () => {
        setIsRunning(false);
        if (sessionId) {
            try {
                await pomodoroService.stop(sessionId, false);
                setSessionId(null);
                showSuccess('Сессия остановлена');
                loadStats();
            } catch (error) {
                console.error('Failed to stop session:', error);
            }
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(duration * 60);
    };

    const handleTypeChange = (_: any, newType: PomodoroType | null) => {
        if (!newType || isRunning) return;
        setType(newType);
        const newDuration = PRESETS[newType];
        setDuration(newDuration);
        setTimeLeft(newDuration * 60);
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        const total = duration * 60;
        return ((total - timeLeft) / total) * 100;
    };

    const getColor = () => {
        switch (type) {
            case 'work': return '#f44336';
            case 'short_break': return '#4caf50';
            case 'long_break': return '#2196f3';
            default: return '#1976d2';
        }
    };

    const handleClose = () => {
        if (isRunning) {
            if (!window.confirm('Сессия ещё идёт. Прервать?')) return;
        }
        handleStop();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">🍅 Помодоро</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Typography variant="caption" color="textSecondary">
                    {taskTitle}
                </Typography>
            </DialogTitle>

            <DialogContent>
                {/* Переключатель режима */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <ToggleButtonGroup
                        value={type}
                        exclusive
                        onChange={handleTypeChange}
                        disabled={isRunning}
                        size="small"
                    >
                        <ToggleButton value="work">Работа</ToggleButton>
                        <ToggleButton value="short_break">Перерыв 5м</ToggleButton>
                        <ToggleButton value="long_break">Перерыв 15м</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Таймер */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                            variant="determinate"
                            value={100}
                            size={200}
                            thickness={4}
                            sx={{ color: 'rgba(0,0,0,0.1)' }}
                        />
                        <CircularProgress
                            variant="determinate"
                            value={getProgress()}
                            size={200}
                            thickness={4}
                            sx={{
                                color: getColor(),
                                position: 'absolute',
                                left: 0,
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                            }}
                        >
                            <Typography
                                variant="h3"
                                component="div"
                                sx={{ fontWeight: 'bold', color: getColor() }}
                            >
                                {formatTime(timeLeft)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {type === 'work' ? 'Работа' : 'Перерыв'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Кнопки управления */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                    {!isRunning && !sessionId && (
                        <Button
                            variant="contained"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleStart}
                            sx={{ bgcolor: getColor() }}
                        >
                            Начать
                        </Button>
                    )}

                    {isRunning && (
                        <Button
                            variant="contained"
                            startIcon={<PauseIcon />}
                            onClick={handlePause}
                            color="warning"
                        >
                            Пауза
                        </Button>
                    )}

                    {!isRunning && sessionId && (
                        <>
                            <Button
                                variant="contained"
                                startIcon={<PlayArrowIcon />}
                                onClick={handleResume}
                                sx={{ bgcolor: getColor() }}
                            >
                                Продолжить
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<StopIcon />}
                                onClick={handleStop}
                                color="error"
                            >
                                Стоп
                            </Button>
                        </>
                    )}

                    <Button
                        variant="outlined"
                        startIcon={<RestartAltIcon />}
                        onClick={handleReset}
                        disabled={isRunning}
                    >
                        Сброс
                    </Button>
                </Box>

                {/* Статистика */}
                {stats && (
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: 'background.default',
                            borderRadius: 2,
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Статистика задачи
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
                            <Box>
                                <Typography variant="h6">{stats.todaySessions}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Сегодня
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6">{stats.completedWorkSessions}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Всего сессий
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6">
                                    {Math.floor(stats.totalMinutes / 60)}ч {stats.totalMinutes % 60}м
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Общее время
                                </Typography>
                            </Box>
                        </Box>

                        {completedCycles > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    label={`Циклов завершено: ${completedCycles}`}
                                    color="success"
                                    size="small"
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PomodoroTimer;