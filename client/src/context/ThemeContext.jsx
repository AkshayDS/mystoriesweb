import { createContext, useContext, useEffect, useState } from 'react';
import { genreThemes } from '../themes/genreThemes';

const ThemeContext = createContext({
  theme: genreThemes.default,
  mode: 'dark',
  setGenre: () => {},
  toggleMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(genreThemes.default);
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('storynest-mode') || 'dark';
  });

  const setGenre = (genreSlug) => {
    const theme = genreThemes[genreSlug] || genreThemes.default;
    setCurrentTheme(theme);
  };

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('storynest-mode', next);
      return next;
    });
  };

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;

    // Set genre theme via data-theme attribute (maps to CSS variable blocks)
    root.setAttribute('data-theme', currentTheme.slug);

    // Set light/dark mode
    root.setAttribute('data-mode', mode === 'light' ? 'light' : 'dark');
  }, [currentTheme, mode]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, mode, setGenre, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
