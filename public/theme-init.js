// External script, intentionally small and synchronous to avoid a theme flash.
try {
  const theme = localStorage.getItem('rayanesh-theme');
  if (theme === 'dark' || theme === 'light') document.documentElement.dataset.theme = theme;
} catch { /* Reading still works when browser storage is unavailable. */ }
