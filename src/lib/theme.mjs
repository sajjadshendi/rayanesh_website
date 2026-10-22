import { createHash } from 'node:crypto';

// Run before first paint, without a blocking network request. Only these exact
// bytes are allowed inline by the CSP; never add user-controlled data here.
export const themeInit = `try {
  const theme = localStorage.getItem('rayanesh-theme');
  if (theme === 'dark' || theme === 'light') document.documentElement.dataset.theme = theme;
  else if (matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme = 'dark';
} catch { /* Reading still works when browser storage is unavailable. */ }
`;
export const themeHash = `sha256-${createHash('sha256').update(themeInit).digest('base64')}`;
