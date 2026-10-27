import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from 'react-router-dom';
import { notebookService } from '../../services/notebookService';
import type { Notebook, CreateNotebookDto } from '../../types/notebook';
import ConfirmDialog from '../../components/ConfirmDialog';
import useSnackbar from '../../hooks/useSnackbar';

const NotebooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id?: number;
    title: string;
    message: string;
  }>({
    open: false,
    title: '',
    message: '',
  });

  const loadNotebooks = async () => {
    try {
      const data = await notebookService.getAll();
      setNotebooks(data);
    } catch (error) {
      console.error('Failed to load notebooks:', error);
      showError('Не удалось загрузить записные книжки');
    }
  };

  useEffect(() => {
    loadNotebooks();
  }, []);

  const handleCreate = () => {
    setEditingNotebook(null);
    setName('');
    setDescription('');
    setOpenDialog(true);
  };

  const handleEdit = (notebook: Notebook) => {
    setEditingNotebook(notebook);
    setName(notebook.name);
    setDescription(notebook.description || '');
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showError('Введите название');
      return;
    }
    const data: CreateNotebookDto = { name, description };
    try {
      if (editingNotebook) {
        await notebookService.update(editingNotebook.id, data);
        showSuccess('Записная книжка обновлена');
      } else {
        await notebookService.create(data);
        showSuccess('Записная книжка создана');
      }
      setOpenDialog(false);
      loadNotebooks();
    } catch (error) {
      console.error('Failed to save notebook:', error);
      showError('Не удалось сохранить записную книжку');
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setConfirmDialog({
      open: true,
      id,
      title: 'Удалить записную книжку?',
      message: `Вы уверены, что хотите удалить книжку "${name}"? Все заметки внутри также будут удалены. Это действие нельзя отменить.`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.id) return;
    setDeleteLoading(true);
    try {
      await notebookService.delete(confirmDialog.id);
      showSuccess('Записная книжка удалена');
      loadNotebooks();
    } catch (error) {
      console.error('Failed to delete notebook:', error);
      showError('Не удалось удалить записную книжку');
    } finally {
      setDeleteLoading(false);
      setConfirmDialog({ open: false, title: '', message: '' });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, title: '', message: '' });
  };

  const openNotebook = (id: number) => {
    navigate(`/notebooks/${id}/notes`);
  };

  return (
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mt: 5 }}>
        {/* 1. Заголовок */}
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          📚 Записные книжки
        </Typography>

        {/* 2. Кнопка "Создать" */}
        <Button
            variant="contained"
            onClick={handleCreate}
            fullWidth
        >
          Создать книжку
        </Button>

        {/* 3. Список книжек — на всю ширину */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {notebooks.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <MenuBookIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Пока нет записных книжек
                </Typography>
              </Box>
          ) : (
              notebooks.map((notebook) => (
                  <Card
                      key={notebook.id}
                      sx={{
                        width: '100%',
                        cursor: 'pointer',
                        transition: '0.2s',
                        '&:hover': { boxShadow: 4 },
                      }}
                      onClick={() => openNotebook(notebook.id)}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <MenuBookIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                          {notebook.name}
                        </Typography>
                      </Box>
                      {notebook.description && (
                          <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                          >
                            {notebook.description}
                          </Typography>
                      )}
                    </CardContent>

                    <CardActions
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          justifyContent: 'flex-end',
                          gap: 0.5,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton size="small" onClick={() => handleEdit(notebook)} sx={{ p: 0.5 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(notebook.id, notebook.name)}
                          sx={{ p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
              ))
          )}
        </Box>

        {/* Диалог — fullScreen для мобильных */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullScreen>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editingNotebook ? 'Редактировать книжку' : 'Создать книжку'}
              <IconButton onClick={() => setOpenDialog(false)}>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <TextField
                margin="dense"
                label="Описание"
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
            <Button onClick={handleSave} variant="contained">
              {editingNotebook ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog
            open={confirmDialog.open}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            severity="error"
            loading={deleteLoading}
        />
      </Box>
  );
};

export default NotebooksPage;