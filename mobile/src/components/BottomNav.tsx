import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NoteIcon from '@mui/icons-material/Note';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
    { label: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Задачи', icon: <AssignmentIcon />, path: '/' },
    { label: 'Заметки', icon: <NoteIcon />, path: '/notes' },
    { label: 'Календарь', icon: <CalendarTodayIcon />, path: '/calendar' },
];

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getCurrentTab = () => {
        const item = navItems.find((item) =>
            item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)
        );
        return item ? item.path : false;
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: (theme) => theme.zIndex.appBar,
                pb: 'env(safe-area-inset-bottom)', // для iPhone с вырезом
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={getCurrentTab()}
                onChange={(_, newValue) => navigate(newValue)}
                sx={{
                    height: 64,
                }}
            >
                {navItems.map((item) => (
                    <BottomNavigationAction
                        key={item.path}
                        label={item.label}
                        icon={item.icon}
                        value={item.path}
                        sx={{
                            minWidth: 'auto',
                            '& .MuiBottomNavigationAction-label': {
                                fontSize: '0.7rem',
                            },
                        }}
                    />
                ))}
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNav;