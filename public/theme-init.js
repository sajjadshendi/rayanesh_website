// External script, intentionally small and synchronous to avoid a theme flash.
try {
  const theme = localStorage.getItem('rayanesh-theme');
  if (theme === 'dark' || theme === 'light') document.documentElement.dataset.theme = theme;
  else if (matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme = 'dark';
} catch { /* Reading still works when browser storage is unavailable. */ }
