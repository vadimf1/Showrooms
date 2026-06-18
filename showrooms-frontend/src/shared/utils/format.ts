export const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatBirthDate = (s: string | null) =>
  s ? formatDate(s) : '';

export const displayPhone = (p: string) => p ? `+${p}` : '—';

export const stripPlus = (v: string) => v.replace(/^\+/, '');

export const noSpaces = (v: string) => v.replace(/\s/g, '');

export const onlyPhone = (v: string) => v.replace(/[^\d+\(\)\-]/g, '');

export const userInitials = (user: { first_name?: string | null; last_name?: string | null; email?: string | null } | null) => {
  const fn = user?.first_name?.[0] ?? '';
  const ln = user?.last_name?.[0] ?? '';
  return (fn + ln).toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
};
