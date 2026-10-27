import React, { useState } from 'react';
import {
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    CircularProgress,
    Tooltip,
    Paper,
    Chip,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    InsertDriveFile as FileIcon,
    Image as ImageIcon,
    PictureAsPdf as PdfIcon,
    Description as DocIcon,
    TableChart as ExcelIcon,
    FolderZip as ZipIcon,
    AudioFile as AudioIcon,
    VideoFile as VideoIcon,
} from '@mui/icons-material';
import { attachmentService } from '../services/attachmentService';
import type { Attachment } from '../types/attachment';

interface FileUploadProps {
    noteId: number;
    attachments: Attachment[];
    onUpload: (attachment: Attachment) => void;
    onDelete: (id: number) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
                                                   noteId,
                                                   attachments,
                                                   onUpload,
                                                   onDelete,
                                               }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const attachment = await attachmentService.upload(noteId, file);
            onUpload(attachment);
        } catch (error) {
            console.error('Failed to upload file:', error);
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleDownload = (id: number, filename: string) => {
        const url = attachmentService.getDownloadUrl(id);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить файл?')) return;
        try {
            await attachmentService.delete(id);
            onDelete(id);
        } catch (error) {
            console.error('Failed to delete attachment:', error);
        }
    };

    const getFileIcon = (mimetype: string, extension: string) => {
        const ext = extension.toLowerCase();

        if (mimetype.startsWith('image/')) {
            return <ImageIcon />;
        }
        if (mimetype === 'application/pdf') {
            return <PdfIcon />;
        }
        if (mimetype === 'application/msword' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return <DocIcon />;
        }
        if (mimetype === 'application/vnd.ms-excel' || mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return <ExcelIcon />;
        }
        if (['zip', 'rar', '7z', 'gz'].includes(ext)) {
            return <ZipIcon />;
        }
        if (mimetype.startsWith('audio/')) {
            return <AudioIcon />;
        }
        if (mimetype.startsWith('video/')) {
            return <VideoIcon />;
        }
        return <FileIcon />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    return (
        <Box>
            {/* Кнопка загрузки */}
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    disabled={uploading}
                    sx={{ textTransform: 'none' }}
                >
                    {uploading ? <CircularProgress size={24} /> : 'Загрузить файл'}
                    <input
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                </Button>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
                    Макс. размер: 10MB
                </Typography>
            </Box>

            {/* Список файлов */}
            {attachments.length > 0 ? (
                <Paper variant="outlined" sx={{ p: 1 }}>
                    <List dense>
                        {attachments.map((attachment) => (
                            <ListItem
                                key={attachment.id}
                                secondaryAction={
                                    <Box>
                                        <Tooltip title="Скачать">
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleDownload(attachment.id, attachment.filename)}
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Удалить">
                                            <IconButton
                                                edge="end"
                                                color="error"
                                                onClick={() => handleDelete(attachment.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                }
                            >
                                <Box sx={{ mr: 2, color: 'primary.main' }}>
                                    {getFileIcon(attachment.mimetype, attachment.extension)}
                                </Box>
                                <ListItemText
                                    primary={attachment.filename}
                                    secondary={`${formatFileSize(attachment.size)} • ${attachment.extension.toUpperCase()}`}
                                    primaryTypographyProps={{
                                        style: { fontSize: '0.9rem' },
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            ) : (
                <Typography variant="body2" color="textSecondary">
                    Нет прикреплённых файлов
                </Typography>
            )}
        </Box>
    );
};

export default FileUpload;