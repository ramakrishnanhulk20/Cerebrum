import { createContext, useContext, useState, type ReactNode } from 'react';
import { theme } from '../config/theme';

interface ThemeContextType {
  currentTheme: typeof theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme] = useState(theme);

  return (
    <ThemeContext.Provider value={{ currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
