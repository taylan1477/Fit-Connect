/**
 * Date formatting and normalization utilities
 * Fit-Connect Turkish Date Standard: GG-AA-YYYY (DD-MM-YYYY)
 */

export const formatDisplayDate = (date: string | Date | undefined | null): string => {
  if (!date) return '';

  if (typeof date === 'string') {
    const str = date.trim();

    // Already in DD-MM-YYYY format
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
      return str;
    }

    // If in DD.MM.YYYY or DD/MM/YYYY format
    const dmyAlt = str.match(/^(\d{2})[./](\d{2})[./](\d{4})$/);
    if (dmyAlt) {
      return `${dmyAlt[1]}-${dmyAlt[2]}-${dmyAlt[3]}`;
    }

    // If in YYYY-MM-DD format (or ISO date string)
    const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      const [_, year, month, day] = ymdMatch;
      return `${day}-${month}-${year}`;
    }

    // Fallback for JS Date parseable strings
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const d = String(parsed.getDate()).padStart(2, '0');
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const y = parsed.getFullYear();
      return `${d}-${m}-${y}`;
    }

    return str;
  }

  if (date instanceof Date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  }

  return '';
};

export const getTodayDisplayDate = (): string => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
};

export const toISODate = (dateStr: string | undefined | null): string => {
  if (!dateStr) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(dateStr).trim();

  // If format is DD-MM-YYYY or DD.MM.YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{2})[-./](\d{2})[-./](\d{4})$/);
  if (dmyMatch) {
    const [_, day, month, year] = dmyMatch;
    return `${year}-${month}-${day}`;
  }

  // If already YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
  }

  return str;
};
