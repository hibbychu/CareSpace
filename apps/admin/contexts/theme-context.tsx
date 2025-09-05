'use client';

import { createContext, useContext, ReactNode } from 'react';

export const lightTheme = {
  background: "#fff",
  text: "#000",
  primary: "#7b2cbf",
  secondary: "#9688B2",
  text2: "#7b2cbf",
  searchBarBackground: "#f0f0f0",
  searchBarPlaceHolderText: "#aaa",
  postBodyText: "#555",
  bottomBorder: "gray",
  iconsGrey: "grey",
  commentBackground: "#DADADA",
  cardBackground: "#fff",
  shadow: "#1A1A1A",
  dateGrey: "#aaa",
  reportRed: "#d32f2f",
};

export const darkTheme = {
  background: "#121212",
  text: "#ffffff",
  primary: "#9c4dcc",
  secondary: "#b39ddb",
  text2: "#9c4dcc",
  searchBarBackground: "#2a2a2a",
  searchBarPlaceHolderText: "#888",
  postBodyText: "#cccccc",
  bottomBorder: "#444",
  iconsGrey: "#888",
  commentBackground: "#3a3a3a",
  cardBackground: "#1e1e1e",
  shadow: "#000000",
  dateGrey: "#888",
  reportRed: "#f44336",
};

type Theme = typeof lightTheme;

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // For now, we'll use light theme by default
  // You can later add state management for theme switching
  const isDark = false;
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    // Placeholder for theme toggle functionality
    console.log('Theme toggle not implemented yet');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
