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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Tabs,
  Tab,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { noteService } from '../../services/noteService';
import { notebookService } from '../../services/notebookService';
import { attachmentService } from '../../services/attachmentService';
import type { Note, CreateNoteDto, UpdateNoteDto } from '../../types/note';
import type { Notebook } from '../../types/notebook';
import type { Attachment } from '../../types/attachment';
import RichTextEditor from '../../components/RichTextEditor';
import RichTextRenderer from '../../components/RichTextRenderer';
import FileUpload from '../../components/FileUpload';
import ConfirmDialog from '../../components/ConfirmDialog';
import useSnackbar from '../../hooks/useSnackbar';
import ExportImportMenu from '../../components/ExportImportMenu';

type SortOption = 'createdAt_desc' | 'createdAt_asc' | 'title_asc' | 'title_desc';

const AllNotesPage: React.FC = () => {
  const { showSuccess, showError } = useSnackbar();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt_desc');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notebookId, setNotebookId] = useState<number>('' as any);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

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

  const loadNotes = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      const [sortBy, sortOrder] = sortOption.split('_');
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;

      const data = await noteService.getAll(params);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
      showError('Не удалось загрузить заметки');
    } finally {
      setLoading(false);
    }
  };

  const loadNotebooks = async () => {
    try {
      const data = await notebookService.getAll();
      setNotebooks(data);
      if (data.length > 0 && !notebookId) {
        setNotebookId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load notebooks:', error);
    }
  };

  const loadAttachments = async (noteId: number) => {
    try {
      const data = await attachmentService.getAllByNote(noteId);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    }
  };

  useEffect(() => {
    loadNotebooks();
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadNotes, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, sortOption]);

  const handleCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setAttachments([]);
    if (notebooks.length > 0) setNotebookId(notebooks[0].id);
    setPreviewMode('edit');
    setOpenDialog(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setNotebookId(note.notebookId);
    setPreviewMode('edit');
    setOpenDialog(true);
    loadAttachments(note.id);
  };

  const handleSave = async () => {
    if (!notebookId) {
      showError('Выберите записную книжку');
      return;
    }
    const data: CreateNoteDto = { title, content };
    try {
      if (editingNote) {
        const updateData: UpdateNoteDto = { ...data, notebookId };
        await noteService.update(editingNote.id, updateData);
        showSuccess('Заметка обновлена');
      } else {
        await noteService.create(notebookId, data);
        showSuccess('Заметка создана');
      }
      setOpenDialog(false);
      setAttachments([]);
      loadNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
      showError('Не удалось сохранить заметку');
    }
  };

  const handleDeleteClick = (id: number, title: string) => {
    setConfirmDialog({
      open: true,
      id,
      title: 'Удалить заметку?',
      message: `Вы уверены, что хотите удалить заметку "${title}"? Это действие нельзя отменить.`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.id) return;
    setDeleteLoading(true);
    try {
      await noteService.delete(confirmDialog.id);
      showSuccess('Заметка удалена');
      loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
      showError('Не удалось удалить заметку');
    } finally {
      setDeleteLoading(false);
      setConfirmDialog({ open: false, title: '', message: '' });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, title: '', message: '' });
  };

  const getNotebookName = (id: number) => {
    const nb = notebooks.find((n) => n.id === id);
    return nb ? nb.name : 'Неизвестная книжка';
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAttachments([]);
  };

  const handleExportNotesJson = async () => {
    try {
      const notes = await noteService.exportNotes();
      const jsonStr = JSON.stringify(notes, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notes_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess('Заметки экспортированы');
    } catch (error) {
      console.error('Failed to export notes:', error);
      showError('Не удалось экспортировать заметки');
    }
  };

  const handleImportNotes = async (data: any[]) => {
    try {
      const response = await noteService.importNotes(data);
      showSuccess(`Импортировано: ${response.imported}, пропущено: ${response.skipped}`);
      loadNotes();
    } catch (error) {
      console.error('Failed to import notes:', error);
      showError('Не удалось импортировать заметки');
    }
  };

  const handleExportDocx = async (note: Note) => {
    try {
      const blob = await noteService.exportDocx(note.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${note.title}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess('Файл .docx скачан');
    } catch (error) {
      console.error('Failed to export docx:', error);
      showError('Не удалось экспортировать заметку');
    }
  };

  return (
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mt: 5 }}>
        {/* 1. Заголовок */}
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          📝 Все заметки
        </Typography>

        {/* 2. Кнопки в ряд */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
              variant="contained"
              onClick={handleCreate}
              sx={{ flex: '1 1 auto', minWidth: 0 }}
          >
            Создать
          </Button>
          <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
            <ExportImportMenu
                onExportJson={handleExportNotesJson}
                onImport={handleImportNotes}
            />
          </Box>
        </Box>

        {/* 3. Поиск */}
        <TextField
            size="small"
            placeholder="Поиск по заметкам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
              ),
              endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
              ),
            }}
        />

        {/* 4. Сортировка */}
        <FormControl size="small" fullWidth>
          <InputLabel>Сортировка</InputLabel>
          <Select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              label="Сортировка"
          >
            <MenuItem value="createdAt_desc">По дате (сначала новые)</MenuItem>
            <MenuItem value="createdAt_asc">По дате (сначала старые)</MenuItem>
            <MenuItem value="title_asc">По названию (А–Я)</MenuItem>
            <MenuItem value="title_desc">По названию (Я–А)</MenuItem>
          </Select>
        </FormControl>

        {/* 5. Список заметок — на всю ширину */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {notes.map((note) => (
              <Card
                  key={note.id}
                  sx={{
                    width: '100%',
                    transition: '0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {note.title}
                  </Typography>
                  <Box sx={{ maxHeight: 100, overflow: 'hidden', mb: 1 }}>
                    <RichTextRenderer content={note.content || ''} />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip
                        label={getNotebookName(note.notebookId)}
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                    <Chip
                        label={`📎 ${note.attachments?.length || 0}`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                  </Box>
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
                >
                  <IconButton size="small" onClick={() => handleEdit(note)} sx={{ p: 0.5 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleExportDocx(note)} sx={{ p: 0.5 }}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(note.id, note.title)}
                      sx={{ p: 0.5 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
          ))}
        </Box>

        {/* Диалог — fullScreen для мобильных */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullScreen>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editingNote ? 'Редактировать заметку' : 'Создать заметку'}
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                label="Заголовок"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <Tabs
                value={previewMode}
                onChange={(_, v) => setPreviewMode(v)}
                sx={{ mt: 2 }}
                variant="fullWidth"
            >
              <Tab label="Редактирование" value="edit" />
              <Tab label="Предпросмотр" value="preview" />
            </Tabs>

            {previewMode === 'edit' ? (
                <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Начните писать..."
                    minHeight={300}
                />
            ) : (
                <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                      minHeight: 200,
                      mt: 1,
                      bgcolor: 'background.default',
                    }}
                >
                  <RichTextRenderer content={content} />
                </Box>
            )}

            <FormControl fullWidth margin="dense">
              <InputLabel>Записная книжка</InputLabel>
              <Select
                  value={notebookId}
                  onChange={(e) => setNotebookId(e.target.value as number)}
                  label="Записная книжка"
              >
                {notebooks.map((nb) => (
                    <MenuItem key={nb.id} value={nb.id}>
                      {nb.name}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  📎 Вложения ({attachments.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {editingNote ? (
                    <FileUpload
                        noteId={editingNote.id}
                        attachments={attachments}
                        onUpload={(attachment) => setAttachments((prev) => [...prev, attachment])}
                        onDelete={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
                    />
                ) : (
                    <Typography variant="body2" color="textSecondary">
                      Сохраните заметку, чтобы загружать файлы
                    </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleSave} variant="contained">
              {editingNote ? 'Сохранить' : 'Создать'}
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

export default AllNotesPage;