// src/contexts/ThemeContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { theme, darkTheme } from '../config/theme';
import type { Theme } from '../config/theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true); // Default dark

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ 
      theme: isDark ? darkTheme : theme, // Ready for light mode
      isDark, 
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
