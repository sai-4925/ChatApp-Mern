import { createContext, useState, useEffect, useCallback } from 'react';
import { THEMES } from '../constants';

export const ThemeContext = createContext(null);

const applyThemeClass = (theme) => {
  const isDark =
    theme === THEMES.DARK ||
    (theme === THEMES.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => localStorage.getItem('chatapp_theme') || THEMES.SYSTEM);

  useEffect(() => {
    applyThemeClass(theme);
    localStorage.setItem('chatapp_theme', theme);

    if (theme === THEMES.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyThemeClass(theme);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme) => setThemeState(newTheme), []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
