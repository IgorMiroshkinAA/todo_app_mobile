import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { taskService } from '../../services/taskService';
import type { Task, CreateTaskDto, UpdateTaskDto, Priority } from '../../types/task';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [completed, setCompleted] = useState(false);

  // Load tasks
  const loadTasks = async () => {
    const data = await taskService.getAll();
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Handlers
  const handleCreate = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setCompleted(false);
    setOpenDialog(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate?.substring(0, 16) || '');
    setPriority(task.priority);
    setCompleted(task.completed);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    const data: CreateTaskDto = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority,
    };
    if (editingTask) {
      const updateData: UpdateTaskDto = { ...data, completed };
      await taskService.update(editingTask.id, updateData);
    } else {
      await taskService.create(data);
    }
    setOpenDialog(false);
    loadTasks();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Удалить задачу?')) {
      await taskService.delete(id);
      loadTasks();
    }
  };

  const toggleCompleted = async (task: Task) => {
    await taskService.update(task.id, { completed: !task.completed });
    loadTasks();
  };

  const priorityColor = (p: Priority): 'error' | 'warning' | 'success' | 'default' => {
    switch (p) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Задачи</Typography>
        <Button variant="contained" onClick={handleCreate}>
          Создать задачу
        </Button>
      </Box>

      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                opacity: task.completed ? 0.7 : 1,
                transition: '0.3s',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      wordBreak: 'break-word',
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Checkbox
                    checked={task.completed}
                    onChange={() => toggleCompleted(task)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Box>

                {task.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                  >
                    {task.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  <Chip
                    label={task.priority}
                    size="small"
                    color={priorityColor(task.priority)}
                    variant="outlined"
                  />
                  {task.dueDate && (
                    <Chip
                      label={new Date(task.dueDate).toLocaleDateString()}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>

              <CardActions>
                <Tooltip title="Редактировать">
                  <IconButton size="small" onClick={() => handleEdit(task)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton size="small" color="error" onClick={() => handleDelete(task.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for create/edit */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Редактировать задачу' : 'Создать задачу'}</DialogTitle>
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
            label="Срок выполнения"
            type="datetime-local"
            fullWidth
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Select
            fullWidth
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            margin="dense"
          >
            <MenuItem value="low">Низкий</MenuItem>
            <MenuItem value="medium">Средний</MenuItem>
            <MenuItem value="high">Высокий</MenuItem>
          </Select>
          {editingTask && (
            <FormControlLabel
              control={
                <Checkbox checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
              }
              label="Выполнено"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            {editingTask ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TasksPage;