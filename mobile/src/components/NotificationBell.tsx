import React, { useState, useEffect, useRef } from 'react';
import {
    IconButton,
    Badge,
    Popover,
    List,
    ListItem,
    Typography,
    Box,
    Button,
    Tooltip,
    Divider,
    CircularProgress,
} from '@mui/material';
import { keyframes } from '@mui/system';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';
import { LocalNotifications } from '@capacitor/local-notifications';

declare global {
    interface Window {
        electronAPI?: {
            showNotification: (title: string, body: string) => void;
            getVersion: () => string;
        };
    }
}

const fadeInSlideDown = keyframes`
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [newNotificationIds, setNewNotificationIds] = useState<number[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const { mode } = useTheme();
    const isDarkMode = mode === 'dark';

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getAll();
            const oldUnreadIds = new Set(notifications.filter(n => !n.read).map(n => n.id));

            setNotifications(data);
            const unread = data.filter((n: Notification) => !n.read);
            setUnreadCount(unread.length);

            const newUnreadIds = new Set(unread.map(n => n.id));
            const newNotifications = unread.filter(n => !oldUnreadIds.has(n.id));

            setNewNotificationIds(newNotifications.map(n => n.id));

            for (const notification of newNotifications) {
                showSystemNotification(notification);
            }

            setTimeout(() => setNewNotificationIds([]), 1000);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const showSystemNotification = async (notification: Notification) => {
        const title = notification.type === 'overdue' ? '❗ Просрочена' : '⏰ Напоминание';
        const message = notification.message;

        try {
            const perm = await LocalNotifications.checkPermissions();
            if (perm.display !== 'granted') {
                await LocalNotifications.requestPermissions();
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: notification.id,
                        title,
                        body: message,
                        schedule: { at: new Date(Date.now() + 1000) },
                    },
                ],
            });
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    };

    useEffect(() => {
        loadNotifications();

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        intervalRef.current = setInterval(loadNotifications, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            await loadNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            await loadNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await notificationService.delete(id);
            await loadNotifications();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const open = Boolean(anchorEl);

    const getIcon = (type: string) => {
        switch (type) {
            case 'overdue':
                return '❗';
            case 'upcoming':
                return '⏰';
            case 'event_soon':
                return '📅';
            default:
                return '📌';
        }
    };

    return (
        <>
            <Tooltip title="Уведомления">
                <IconButton onClick={handleClick} size="large">
                    <Badge badgeContent={unreadCount} color="error">
                        {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
                    </Badge>
                </IconButton>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        width: 400,
                        maxHeight: 500,
                        p: 0,
                        bgcolor: isDarkMode ? '#1e1e1e' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#000000',
                        '& .MuiDivider-root': {
                            borderColor: isDarkMode ? '#444444' : '#e0e0e0',
                        },
                    },
                }}
            >
                <Box sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: isDarkMode ? '#444444' : '#e0e0e0',
                }}>
                    <Typography variant="h6" sx={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                        Уведомления
                    </Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllAsRead}>
                            Отметить все
                        </Button>
                    )}
                </Box>

                <Divider />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={30} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="textSecondary">Нет уведомлений</Typography>
                    </Box>
                ) : (
                    <List sx={{ overflow: 'auto', maxHeight: 400, p: 0 }}>
                        {notifications.map((notification) => (
                            <ListItem
                                key={notification.id}
                                sx={{
                                    backgroundColor: notification.read
                                        ? 'transparent'
                                        : isDarkMode ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.08)',
                                    borderBottom: '1px solid',
                                    borderColor: isDarkMode ? '#444444' : '#e0e0e0',
                                    '&:hover': {
                                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                                    },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    py: 1.5,
                                    animation: newNotificationIds.includes(notification.id)
                                        ? `${fadeInSlideDown} 0.5s ease-out`
                                        : 'none',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1 }}>
                                    <Typography variant="h6" sx={{ fontSize: '1.2rem', lineHeight: 1 }}>
                                        {getIcon(notification.type)}
                                    </Typography>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: notification.read ? 'normal' : 'bold',
                                                wordBreak: 'break-word',
                                                color: isDarkMode ? '#ffffff' : '#000000',
                                            }}
                                        >
                                            {notification.message}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: isDarkMode ? '#aaaaaa' : '#666666' }}>
                                            {formatDistanceToNow(new Date(notification.createdAt), {
                                                addSuffix: true,
                                                locale: ru,
                                            })}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, ml: 4 }}>
                                    {!notification.read && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            sx={{
                                                textTransform: 'none',
                                                color: isDarkMode ? '#90caf9' : '#1976d2',
                                                borderColor: isDarkMode ? '#444444' : '#1976d2',
                                            }}
                                        >
                                            Прочитано
                                        </Button>
                                    )}
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(notification.id)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Удалить
                                    </Button>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Popover>
        </>
    );
};

export default NotificationBell;