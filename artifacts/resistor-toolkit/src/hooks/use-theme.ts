import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('electrolab-theme');
      return saved !== null ? saved === 'dark' : true; // default dark
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('electrolab-theme', isDark ? 'dark' : 'light');
    } catch { /* storage unavailable */ }
  }, [isDark]);

  return { isDark, toggleTheme: () => setIsDark(prev => !prev) };
}
