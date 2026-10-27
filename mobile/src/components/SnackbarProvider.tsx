import React from 'react';
import { SnackbarProvider as NotistackProvider } from 'notistack';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface SnackbarProviderProps {
    children: React.ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
    return (
        <NotistackProvider
            maxSnack={5}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            action={(key) => (
                <IconButton
                    size="small"
                    onClick={() => {
                        // Закрываем уведомление
                        const snackbar = document.querySelector(`[data-key="${key}"]`);
                        if (snackbar) {
                            (snackbar as any).close();
                        }
                    }}
                    sx={{ color: 'white' }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            )}
        >
            {children}
        </NotistackProvider>
    );
};

export default SnackbarProvider;