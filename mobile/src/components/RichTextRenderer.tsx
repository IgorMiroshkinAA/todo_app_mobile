import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

interface RichTextRendererProps {
    content: string;
    className?: string;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className }) => {
    const { mode } = useTheme();
    const isDarkMode = mode === 'dark';

    if (!content) return null;

    return (
        <Box
            className={className}
            sx={{
                '& p': { margin: '0 0 0.5em 0' },
                '& ul, & ol': { margin: '0.5em 0', paddingLeft: '1.5em' },
                '& h1': { fontSize: '2em', fontWeight: 'bold', margin: '0.5em 0' },
                '& h2': { fontSize: '1.5em', fontWeight: 'bold', margin: '0.5em 0' },
                '& h3': { fontSize: '1.17em', fontWeight: 'bold', margin: '0.5em 0' },
                '& blockquote': {
                    borderLeft: '3px solid #ccc',
                    paddingLeft: '1em',
                    margin: '0.5em 0',
                    color: isDarkMode ? '#aaa' : '#666',
                },
                '& code': {
                    background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    padding: '0.2em 0.4em',
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                },
                '& pre': {
                    background: isDarkMode ? '#2d2d2d' : '#1a1a1a',
                    color: '#f8f8f8',
                    padding: '1em',
                    borderRadius: '5px',
                    overflow: 'auto',
                },
                '& pre code': {
                    background: 'none',
                    padding: 0,
                },
                '& hr': { margin: '1em 0' },
                '& img': { maxWidth: '100%', height: 'auto' },
                color: isDarkMode ? '#ffffff' : '#000000',
            }}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};

export default RichTextRenderer;