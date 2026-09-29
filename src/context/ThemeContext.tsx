import React, { createContext, useState, useContext } from 'react';

// PT-App Legacy Color Palette Tokens
export const PTTheme = {
  dark: {
    background: '#121212',          // Scaffold Background
    card: '#1E1E1E',                // Surface / Card Background
    primary: '#FF6B00',             // Primary Accent (Turuncu)
    primaryGlow: 'rgba(255, 107, 0, 0.25)', // Accent Glow / Border
    success: '#4CAF50',             // Financial / Success (Yeşil)
    warning: '#FFA000',             // Warning / Alert (Sarı/Turuncu)
    danger: '#E53935',              // Danger / Expired (Kırmızı)
    text: '#FFFFFF',                // Text Primary
    textMuted: '#9E9E9E',           // Text Secondary (Muted)
    border: '#2C2C2C',              // Border / Divider
    inputBackground: '#161616',     // Input Background
    progressBarEmpty: '#121212',     // Linear progress bar empty state
  },
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    primary: '#FF6B00',
    primaryGlow: 'rgba(255, 107, 0, 0.15)',
    success: '#4CAF50',
    warning: '#FFA000',
    danger: '#E53935',
    text: '#121212',
    textMuted: '#757575',
    border: '#E0E0E0',
    inputBackground: '#F0F0F0',
    progressBarEmpty: '#E0E0E0',
  },
  radius: {
    card: 14,
    button: 10,
    badge: 6,
    sheet: 24,
  },
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof PTTheme.dark;
  radius: typeof PTTheme.radius;
  getStatusColor: (remainingSessions: number) => { color: string; label: string; bg: string };
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: PTTheme.dark,
  radius: PTTheme.radius,
  getStatusColor: () => ({ color: '#4CAF50', label: 'Aktif', bg: 'rgba(76, 175, 80, 0.15)' }),
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Default to dark theme as required by PT-App Legacy design identity
  const [isDark, setIsDark] = useState<boolean>(true);

  const colors = isDark ? PTTheme.dark : PTTheme.light;
  const radius = PTTheme.radius;

  // Seans Kuralları & Durum Yönetimi Mantığı:
  // Kalan ders > 3 -> Aktif (Yeşil)
  // Kalan ders <= 3 ve > 0 -> Az Kaldı (Turuncu/Sarı)
  // Kalan ders == 0 -> Bitti (Kırmızı)
  const getStatusColor = (remainingSessions: number) => {
    if (remainingSessions <= 0) {
      return {
        color: PTTheme.dark.danger,
        label: 'Bitti',
        bg: 'rgba(229, 57, 53, 0.15)',
      };
    }
    if (remainingSessions <= 3) {
      return {
        color: PTTheme.dark.warning,
        label: 'Az Kaldı',
        bg: 'rgba(255, 160, 0, 0.15)',
      };
    }
    return {
      color: PTTheme.dark.success,
      label: 'Aktif',
      bg: 'rgba(76, 175, 80, 0.15)',
    };
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme: () => setIsDark(!isDark),
        colors,
        radius,
        getStatusColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
