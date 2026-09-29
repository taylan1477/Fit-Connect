import React, { createContext, useState, useContext } from 'react';

export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  colors: {
    background: '#F0FDF4',
    card: '#FFFFFF',
    text: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  }
});

export const ThemeProvider = ({ children }: any) => {
  const [isDark, setIsDark] = useState(false);

  const colors = isDark ? {
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    textMuted: '#9CA3AF',
    border: '#374151',
  } : {
    background: '#F0FDF4',
    card: '#FFFFFF',
    text: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(!isDark), colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
