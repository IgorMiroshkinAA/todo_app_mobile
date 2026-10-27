import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Box,
    IconButton,
    Tooltip,
    Divider,
    Paper,
} from '@mui/material';
import {
    FormatBold,
    FormatItalic,
    FormatStrikethrough,
    FormatListBulleted,
    FormatListNumbered,
    FormatQuote,
    Code,
    Title,
    HorizontalRule,
    Undo,
    Redo,
    FormatClear,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
                                                           value,
                                                           onChange,
                                                           placeholder = 'Начните писать...',
                                                           minHeight = 300,
                                                       }) => {
    const { mode } = useTheme();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    const handleFormat = (format: string) => {
        switch (format) {
            case 'bold':
                editor.chain().focus().toggleBold().run();
                break;
            case 'italic':
                editor.chain().focus().toggleItalic().run();
                break;
            case 'strike':
                editor.chain().focus().toggleStrike().run();
                break;
            case 'bulletList':
                editor.chain().focus().toggleBulletList().run();
                break;
            case 'orderedList':
                editor.chain().focus().toggleOrderedList().run();
                break;
            case 'blockquote':
                editor.chain().focus().toggleBlockquote().run();
                break;
            case 'codeBlock':
                editor.chain().focus().toggleCodeBlock().run();
                break;
            case 'heading':
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                break;
            case 'horizontalRule':
                editor.chain().focus().setHorizontalRule().run();
                break;
            case 'undo':
                editor.chain().focus().undo().run();
                break;
            case 'redo':
                editor.chain().focus().redo().run();
                break;
            case 'clear':
                editor.chain().focus().clearNodes().unsetAllMarks().run();
                break;
            default:
                break;
        }
    };

    const isActive = (format: string) => {
        switch (format) {
            case 'bold': return editor.isActive('bold');
            case 'italic': return editor.isActive('italic');
            case 'strike': return editor.isActive('strike');
            case 'bulletList': return editor.isActive('bulletList');
            case 'orderedList': return editor.isActive('orderedList');
            case 'blockquote': return editor.isActive('blockquote');
            case 'codeBlock': return editor.isActive('codeBlock');
            case 'heading': return editor.isActive('heading', { level: 2 });
            default: return false;
        }
    };

    const isDarkMode = mode === 'dark';

    return (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            {/* Панель инструментов */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    p: 1,
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'background.default',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {/* ... все кнопки без изменений ... */}
                <Tooltip title="Отменить (Ctrl+Z)">
                    <IconButton size="small" onClick={() => handleFormat('undo')}>
                        <Undo fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Повторить (Ctrl+Y)">
                    <IconButton size="small" onClick={() => handleFormat('redo')}>
                        <Redo fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem />

                <Tooltip title="Жирный (Ctrl+B)">
                    <IconButton
                        size="small"
                        onClick={() => handleFormat('bold')}
                        color={isActive('bold') ? 'primary' : 'default'}
                    >
                        <FormatBold fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Курсив (Ctrl+I)">
                    <IconButton
                        size="small"
                        onClick={() => handleFormat('italic')}
                        color={isActive('italic') ? 'primary' : 'default'}
                    >
                        <FormatItalic fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Зачёркнутый">
                    <IconButton
                        size="small"
                        onClick={() => handleFormat('strike')}
                        color={isActive('strike') ? 'primary' : 'default'}
                    >
                        <FormatStrikethrough fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem />

                <Tooltip title="Заголовок">
                    <IconButton
                        size="small"
                        onClick={() => handleFormat('heading')}
                        color={isActive('heading') ? 'primary' : 'default'}
                    >
                        <Title fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem />

                <Tooltip title="Маркированный список">
                    <IconButton
                        size="small"
                        onClick={() => handleFormat('bulletList')}
                        color={isActive('bulletList') ? 'primary' : 'default'}
                    >
                        <FormatListBulleted fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Нумерованный список">
                    <IconButton
                        size="small"
                        onClick={() => handleFormat('orderedList')}
                        color={isActive('orderedList') ? 'primary' : 'default'}
                    >
                        <FormatListNumbered fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem />

                <Tooltip title="Цитата">
                    <IconButton
                        size="small"
                        onClick={() => handleFormat('blockquote')}
                        color={isActive('blockquote') ? 'primary' : 'default'}
                    >
                        <FormatQuote fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Блок кода">
                    <IconButton
                        size="small"
                        onClick={() => handleFormat('codeBlock')}
                        color={isActive('codeBlock') ? 'primary' : 'default'}
                    >
                        <Code fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem />

                <Tooltip title="Горизонтальная линия">
                    <IconButton size="small" onClick={() => handleFormat('horizontalRule')}>
                        <HorizontalRule fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Очистить форматирование">
                    <IconButton size="small" onClick={() => handleFormat('clear')}>
                        <FormatClear fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Редактор */}
            <Box sx={{ p: 2, bgcolor: isDarkMode ? '#1e1e1e' : 'background.paper' }}>
                <EditorContent
                    editor={editor}
                    style={{
                        minHeight: `${minHeight}px`,
                        maxHeight: '600px',
                        overflow: 'auto',
                        color: isDarkMode ? '#ffffff' : '#000000',
                    }}
                />
            </Box>

            {/* Стили для редактора */}
            <style>
                {`
                    .ProseMirror {
                        outline: none;
                        min-height: 200px;
                    }
                    .ProseMirror p {
                        margin: 0 0 0.5em 0;
                    }
                    .ProseMirror ul,
                    .ProseMirror ol {
                        margin: 0.5em 0;
                        padding-left: 1.5em;
                    }
                    .ProseMirror h1 {
                        font-size: 2em;
                        font-weight: bold;
                        margin: 0.5em 0;
                    }
                    .ProseMirror h2 {
                        font-size: 1.5em;
                        font-weight: bold;
                        margin: 0.5em 0;
                    }
                    .ProseMirror h3 {
                        font-size: 1.17em;
                        font-weight: bold;
                        margin: 0.5em 0;
                    }
                    .ProseMirror blockquote {
                        border-left: 3px solid #ccc;
                        padding-left: 1em;
                        margin: 0.5em 0;
                        color: ${isDarkMode ? '#aaa' : '#666'};
                    }
                    .ProseMirror code {
                        background: ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
                        padding: 0.2em 0.4em;
                        border-radius: 3px;
                        font-family: monospace;
                    }
                    .ProseMirror pre {
                        background: ${isDarkMode ? '#2d2d2d' : '#1a1a1a'};
                        color: #f8f8f8;
                        padding: 1em;
                        border-radius: 5px;
                        overflow: auto;
                    }
                    .ProseMirror pre code {
                        background: none;
                        padding: 0;
                    }
                    .ProseMirror hr {
                        margin: 1em 0;
                    }
                    .ProseMirror .is-editor-empty:first-child::before {
                        content: attr(data-placeholder);
                        float: left;
                        color: ${isDarkMode ? '#666' : '#aaa'};
                        pointer-events: none;
                        height: 0;
                    }
                `}
            </style>
        </Paper>
    );
};

export default RichTextEditor;