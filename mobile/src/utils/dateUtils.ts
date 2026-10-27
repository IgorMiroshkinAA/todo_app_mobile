// Конвертация ISO (UTC) → строка для datetime-local (локальное время)
export const isoToLocalInput = (isoString: string | null | undefined): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
};

// Конвертация строки из datetime-local (локальное время) → ISO (UTC)
export const localInputToIso = (localString: string): string | null => {
    if (!localString) return null;
    return new Date(localString).toISOString();
};