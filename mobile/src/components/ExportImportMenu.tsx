import React, { useRef } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Download as DownloadIcon,
    Upload as UploadIcon,
    Description as JsonIcon,
    TableChart as ExcelIcon,
    ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';

interface ExportImportMenuProps {
    onExportJson: () => void;
    onExportExcel?: () => void;
    onImport: (data: any[]) => Promise<void>;
    exportLabel?: string;
    importLabel?: string;
}

const ExportImportMenu: React.FC<ExportImportMenuProps> = ({
                                                               onExportJson,
                                                               onExportExcel,
                                                               onImport,
                                                               exportLabel = 'Экспорт',
                                                               importLabel = 'Импорт',
                                                           }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleExportJson = () => {
        onExportJson();
        handleClose();
    };

    const handleExportExcel = () => {
        onExportExcel?.();
        handleClose();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
        handleClose();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!Array.isArray(data)) {
                throw new Error('Файл должен содержать массив');
            }

            await onImport(data);
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            throw error;
        } finally {
            event.target.value = '';
        }
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                endIcon={<ArrowDropDownIcon />}
                onClick={handleClick}
            >
                {exportLabel}
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleExportJson}>
                    <ListItemIcon>
                        <JsonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Экспорт в JSON</ListItemText>
                </MenuItem>

                {onExportExcel && (
                    <MenuItem onClick={handleExportExcel}>
                        <ListItemIcon>
                            <ExcelIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Экспорт в Excel</ListItemText>
                    </MenuItem>
                )}

                <MenuItem onClick={handleImportClick}>
                    <ListItemIcon>
                        <UploadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Импорт из JSON</ListItemText>
                </MenuItem>
            </Menu>

            <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </>
    );
};

export default ExportImportMenu;