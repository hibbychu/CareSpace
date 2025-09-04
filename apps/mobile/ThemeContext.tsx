import React, { createContext, useState } from "react";
import { lightTheme, darkTheme } from "./theme"; // import your themes

export const ThemeContext = createContext({
  isDarkTheme: false,
  toggleTheme: () => {},
  theme: lightTheme, // default theme
});

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const toggleTheme = () => setIsDarkTheme(prev => !prev);

  const theme = isDarkTheme ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
