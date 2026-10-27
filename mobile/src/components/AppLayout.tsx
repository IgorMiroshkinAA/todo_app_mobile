import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Box,
    Switch,
    Button,
    AppBar,
    IconButton,
} from '@mui/material';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NoteIcon from '@mui/icons-material/Note';
import NotebookIcon from '@mui/icons-material/Book';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import BottomNav from './BottomNav';

const drawerWidth = 280;

const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Задачи', icon: <AssignmentIcon />, path: '/' },
    { text: 'Записные книжки', icon: <NotebookIcon />, path: '/notebooks' },
    { text: 'Заметки', icon: <NoteIcon />, path: '/notes' },
    { text: 'Календарь', icon: <CalendarTodayIcon />, path: '/calendar' },
];

const AppLayout: React.FC = () => {
    const { mode, toggleTheme } = useTheme();
    const isDarkMode = mode === 'dark';
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerToggle = () => setDrawerOpen((prev) => !prev);
    const handleDrawerClose = () => setDrawerOpen(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Верхний AppBar с гамбургером */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: isDarkMode ? '#1e1e1e' : 'primary.main',
                    pt: 'env(safe-area-inset-top)', // ← отступ сверху под status bar
                }}
            >
                <Toolbar sx={{ minHeight: 56 }}> {/* ← фиксируем высоту */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 1,
                            minWidth: 48,   // ← увеличиваем кнопку
                            minHeight: 48,
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        Tempo Core
                    </Typography>
                    <NotificationBell />
                </Toolbar>
            </AppBar>

            {/* Выезжающий Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        pt: 12,
                    },
                }}
            >
                <List onClick={handleDrawerClose}>
                    {menuItems.map((item) => (
                        <ListItem
                            key={item.text}
                            component={NavLink}
                            to={item.path}
                            sx={{
                                color: isDarkMode ? '#ffffff' : '#1976d2',
                                '&.active': {
                                    backgroundColor: isDarkMode
                                        ? 'rgba(144, 202, 249, 0.25)'   // синий фон с прозрачностью
                                        : 'rgba(25, 118, 210, 0.12)',
                                    // Текст — БЕЛЫЙ в тёмной теме, синий в светлой
                                    color: isDarkMode ? '#ffffff' : '#1976d2',
                                    fontWeight: 600,
                                    borderRight: isDarkMode
                                        ? '4px solid #90caf9'
                                        : '4px solid #1976d2',
                                    '& .MuiListItemIcon-root': {
                                        // Иконка — светло-голубая, чтобы отличалась
                                        color: isDarkMode ? '#90caf9' : '#1976d2',
                                    },
                                    '&:hover': {
                                        backgroundColor: isDarkMode
                                            ? 'rgba(144, 202, 249, 0.35)'
                                            : 'rgba(25, 118, 210, 0.2)',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>

                <Box sx={{ flexGrow: 1 }} />

                {/* Профиль */}
                {user && (
                    <Box sx={{ px: 2, pb: 1 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: isDarkMode
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(0,0,0,0.04)',
                            }}
                        >
                            <PersonIcon />
                            <Box sx={{ overflow: 'hidden', flex: 1 }}>
                                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                    {user.name || user.email}
                                </Typography>
                                {user.name && (
                                    <Typography
                                        variant="caption"
                                        color="textSecondary"
                                        noWrap
                                        component="div"
                                    >
                                        {user.email}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Выйти */}
                <Box sx={{ px: 2, pb: 1 }}>
                    <Button
                        fullWidth
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        size="medium"
                        color="error"
                        variant="outlined"
                        sx={{ textTransform: 'none' }}
                    >
                        Выйти
                    </Button>
                </Box>

                {/* Тема */}
                <Box
                    sx={{
                        px: 2,
                        pb: 2,
                        pt: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        borderTop: '1px solid',
                        borderColor: isDarkMode ? '#333' : '#e0e0e0',
                    }}
                >
                    <Brightness7Icon />
                    <Switch checked={isDarkMode} onChange={toggleTheme} />
                    <Brightness4Icon />
                </Box>
            </Drawer>

            {/* Контент */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 2,
                    pt: 10, // отступ под AppBar
                    pb: 10, // отступ под BottomNav
                }}
            >
                <Outlet />
            </Box>

            {/* Нижняя навигация */}
            <BottomNav />
        </Box>
    );
};

export default AppLayout;