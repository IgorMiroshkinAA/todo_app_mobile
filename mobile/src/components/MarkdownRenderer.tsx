import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Box } from '@mui/material';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
    if (!content) return null;

    return (
        <Box
            className={className}
            sx={{
                '& h1': { fontSize: '2rem', fontWeight: 600, my: 1 },
                '& h2': { fontSize: '1.5rem', fontWeight: 600, my: 1 },
                '& h3': { fontSize: '1.25rem', fontWeight: 600, my: 1 },
                '& p': { my: 0.5 },
                '& ul, & ol': { pl: 2, my: 0.5 },
                '& li': { my: 0.25 },
                '& code': {
                    bgcolor: 'rgba(0,0,0,0.08)',
                    px: 0.5,
                    borderRadius: 0.5,
                    fontFamily: 'monospace',
                },
                '& pre': {
                    bgcolor: 'rgba(0,0,0,0.08)',
                    p: 1,
                    borderRadius: 1,
                    overflow: 'auto',
                },
                '& blockquote': {
                    borderLeft: '3px solid #ccc',
                    pl: 2,
                    ml: 1,
                    color: 'text.secondary',
                },
                '& table': {
                    borderCollapse: 'collapse',
                    width: '100%',
                    my: 1,
                },
                '& th, & td': {
                    border: '1px solid #ddd',
                    p: 0.5,
                },
                '& th': {
                    bgcolor: 'rgba(0,0,0,0.05)',
                },
                '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                },
            }}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
            >
                {content}
            </ReactMarkdown>
        </Box>
    );
};

export default MarkdownRenderer;