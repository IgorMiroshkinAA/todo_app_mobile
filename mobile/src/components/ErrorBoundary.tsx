import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Paper sx={{ p: 4, m: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" gutterBottom>
                        Что-то пошло не так
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {this.state.error?.message || 'Произошла непредвиденная ошибка'}
                    </Typography>
                    <Button variant="contained" onClick={this.handleReset}>
                        Попробовать снова
                    </Button>
                </Paper>
            );
        }

        return this.props.children;
    }
}

// HOC для использования с snackbar
export const ErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
    const { enqueueSnackbar } = useSnackbar();

    const handleError = (error: Error) => {
        enqueueSnackbar(error.message || 'Произошла ошибка', {
            variant: 'error',
            autoHideDuration: 5000,
        });
    };

    // Передаём функцию обработки ошибок в классовый компонент
    // (в простом варианте можно использовать классовый компонент напрямую)
    return (
        <ErrorBoundaryClass fallback={fallback}>
            {children}
        </ErrorBoundaryClass>
    );
};

export default ErrorBoundary;