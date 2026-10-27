import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SnackbarProvider } from './components/SnackbarProvider';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import KanbanBoard from './pages/Tasks/KanbanBoard';
import NotebooksPage from './pages/Notebooks/NotebooksPage';
import NotesPage from './pages/Notes/NotesPage';
import AllNotesPage from './pages/Notes/AllNotesPage';
import CalendarPage from './pages/Calendar/CalendarPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import LoginPage from './pages/Auth/LoginPage';

function App() {
    return (
        <ThemeProvider>
            <SnackbarProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* Публичный маршрут */}
                            <Route path="/login" element={<LoginPage />} />

                            {/* Защищённые маршруты через Outlet */}
                            <Route element={<ProtectedRoute />}>
                                <Route element={<AppLayout />}>
                                    <Route path="/" element={<KanbanBoard />} />
                                    <Route path="/tasks" element={<KanbanBoard />} />
                                    <Route path="/dashboard" element={<DashboardPage />} />
                                    <Route path="/notebooks" element={<NotebooksPage />} />
                                    <Route path="/notebooks/:notebookId/notes" element={<NotesPage />} />
                                    <Route path="/notes" element={<AllNotesPage />} />
                                    <Route path="/calendar" element={<CalendarPage />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Route>
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default App;