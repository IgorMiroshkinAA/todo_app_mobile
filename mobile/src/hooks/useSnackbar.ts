import { useSnackbar as useNotistack } from 'notistack';

export const useSnackbar = () => {
    const { enqueueSnackbar, closeSnackbar } = useNotistack();

    const showSuccess = (message: string) => {
        enqueueSnackbar(message, {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        });
    };

    const showError = (message: string) => {
        enqueueSnackbar(message, {
            variant: 'error',
            autoHideDuration: 5000,
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        });
    };

    const showWarning = (message: string) => {
        enqueueSnackbar(message, {
            variant: 'warning',
            autoHideDuration: 4000,
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        });
    };

    const showInfo = (message: string) => {
        enqueueSnackbar(message, {
            variant: 'info',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        });
    };

    return { showSuccess, showError, showWarning, showInfo, closeSnackbar };
};

export default useSnackbar;