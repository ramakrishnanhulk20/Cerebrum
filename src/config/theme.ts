// Theme tokens and types used across the app.
// This file intentionally exports simple theme objects and a Theme type.
// The actual ThemeProvider and runtime logic live in `src/contexts/ThemeContext.tsx`.

export type Theme = {
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
  };
  spacing?: Record<string, string>;
  [key: string]: any;
};

export const theme: Theme = {
  colors: {
    background: '#0f172a',
    foreground: '#e6eef8',
    primary: '#06b6d4',
    secondary: '#7c3aed',
  },
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
};

export const darkTheme: Theme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#020617',
    foreground: '#e6eef8',
  },
};
