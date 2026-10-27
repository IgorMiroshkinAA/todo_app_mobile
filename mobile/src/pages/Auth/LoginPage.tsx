import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    Link,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useSnackbar from '../../hooks/useSnackbar';

type Mode = 'login' | 'register';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, isAuthenticated } = useAuth();
    const { showSuccess } = useSnackbar();

    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Если уже авторизован — редирект на главную
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate, location]);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await login({ email, password });
                showSuccess('Добро пожаловать!');
            } else {
                await register({ email, password, name });
                showSuccess('Регистрация успешна!');
            }
            // Редирект произойдёт через useEffect выше
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                (mode === 'login' ? 'Неверный email или пароль' : 'Ошибка регистрации');
            setError(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (_: any, newMode: Mode) => {
        setMode(newMode);
        setError('');
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Tempo
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Управляй своим временем
                    </Typography>

                    <Tabs
                        value={mode}
                        onChange={handleTabChange}
                        sx={{ mb: 3, width: '100%' }}
                        variant="fullWidth"
                    >
                        <Tab label="Вход" value="login" />
                        <Tab label="Регистрация" value="register" />
                    </Tabs>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        {mode === 'register' && (
                            <TextField
                                label="Имя (опционально)"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                            />
                        )}

                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            autoFocus
                        />

                        <TextField
                            label="Пароль"
                            type="password"
                            fullWidth
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            inputProps={{ minLength: 6 }}
                            helperText={mode === 'register' ? 'Минимум 6 символов' : ''}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 1 }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : mode === 'login' ? (
                                'Войти'
                            ) : (
                                'Зарегистрироваться'
                            )}
                        </Button>
                    </Box>

                    <Typography variant="caption" color="textSecondary" sx={{ mt: 3, textAlign: 'center' }}>
                        {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
                        <Link
                            component="button"
                            type="button"
                            onClick={() => handleTabChange(null, mode === 'login' ? 'register' : 'login')}
                            sx={{ cursor: 'pointer' }}
                        >
                            {mode === 'login' ? 'Зарегистрируйтесь' : 'Войдите'}
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;