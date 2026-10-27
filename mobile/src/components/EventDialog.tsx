import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { eventService } from '../services/eventService';
import type { Event as EventType, EventType as EventKind } from '../types/event';
import useSnackbar from '../hooks/useSnackbar';
import ConfirmDialog from './ConfirmDialog';
import {isoToLocalInput} from "../utils/dateUtils.ts";
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';

interface EventDialogProps {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    onDeleted?: () => void; // <-- новое
    event?: EventType | null;
    defaultDate?: string;
}

const EventDialog: React.FC<EventDialogProps> = ({
                                                     open,
                                                     onClose,
                                                     onSaved,
                                                     onDeleted,
                                                     event,
                                                     defaultDate,
                                                 }) => {
    const { showSuccess, showError } = useSnackbar();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState<EventKind>('meeting');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [attendees, setAttendees] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ConfirmDialog для удаления
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
    }>({
        open: false,
        title: '',
        message: '',
    });

    useEffect(() => {
        if (open) {
            if (event) {
                setTitle(event.title);
                setDescription(event.description || '');
                setLocation(event.location || '');
                setType(event.type);
                setStartTime(isoToLocalInput(event.startTime));
                setEndTime(isoToLocalInput(event.endTime));
                setAttendees((event.attendees || []).join(', '));
            } else {
                setTitle('');
                setDescription('');
                setLocation('');
                setType('meeting');
                setStartTime(defaultDate ? `${defaultDate}T10:00` : '');
                setEndTime(defaultDate ? `${defaultDate}T11:00` : '');
                setAttendees('');
            }
        }
    }, [open, event, defaultDate]);

    const handleSave = async () => {
        if (!title.trim()) {
            showError('Введите название встречи');
            return;
        }
        if (!startTime) {
            showError('Укажите дату и время начала');
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const attendeesList = attendees
                .split(',')
                .map((a) => a.trim())
                .filter((a) => a.length > 0);

            const data = {
                title,
                description: description || undefined,
                location: location || undefined,
                type,
                startTime: new Date(startTime).toISOString(),
                endTime: endTime ? new Date(endTime).toISOString() : undefined,
                attendees: attendeesList,
            };

            if (event && event.id) {
                await eventService.update(event.id, data);
                showSuccess('Встреча обновлена');
            } else {
                await eventService.create(data);
                showSuccess('Встреча создана');
            }

            onClose();

            try {
                onSaved();
            } catch (refreshError) {
                console.error('Failed to refresh calendar:', refreshError);
            }
        } catch (error) {
            console.error('Failed to save event:', error);
            showError('Не удалось сохранить встречу');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        if (!event) return;
        setConfirmDialog({
            open: true,
            title: 'Удалить встречу?',
            message: `Вы уверены, что хотите удалить встречу "${event.title}"? Это действие нельзя отменить.`,
        });
    };

    const handleConfirmDelete = async () => {
        if (!event) return;
        setDeleteLoading(true);
        try {
            await eventService.delete(event.id);
            showSuccess('Встреча удалена');
            setConfirmDialog({ open: false, title: '', message: '' });
            onClose();

            try {
                if (onDeleted) {
                    onDeleted();
                } else {
                    onSaved();
                }
            } catch (refreshError) {
                console.error('Failed to refresh calendar:', refreshError);
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
            showError('Не удалось удалить встречу');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDialog({ open: false, title: '', message: '' });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullScreen>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {event ? 'Редактировать встречу' : 'Создать встречу'}
                        <IconButton onClick={onClose}>
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
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Описание"
                        fullWidth
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Начало"
                        type="datetime-local"
                        fullWidth
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Окончание"
                        type="datetime-local"
                        fullWidth
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Место"
                        fullWidth
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Тип</InputLabel>
                        <Select
                            value={type}
                            onChange={(e) => setType(e.target.value as EventKind)}
                            label="Тип"
                        >
                            <MenuItem value="meeting">Встреча</MenuItem>
                            <MenuItem value="call">Звонок</MenuItem>
                            <MenuItem value="appointment">Приём</MenuItem>
                            <MenuItem value="other">Другое</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        label="Участники (email через запятую)"
                        fullWidth
                        multiline
                        rows={2}
                        value={attendees}
                        onChange={(e) => setAttendees(e.target.value)}
                        placeholder="user1@example.com, user2@example.com"
                    />
                    {attendees && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {attendees.split(',').map((email, idx) => (
                                email.trim() && (
                                    <Chip key={idx} label={email.trim()} size="small" />
                                )
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Box>
                        {event && (
                            <Button
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDeleteClick}
                                disabled={loading || deleteLoading}
                            >
                                Удалить
                            </Button>
                        )}
                    </Box>
                    <Box>
                        <Button onClick={onClose} disabled={loading || deleteLoading}>
                            Отмена
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            disabled={loading || deleteLoading}
                            sx={{ ml: 1 }}
                        >
                            {event ? 'Сохранить' : 'Создать'}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* ConfirmDialog для удаления */}
            <ConfirmDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                severity="error"
                loading={deleteLoading}
            />
        </>
    );
};

export default EventDialog;