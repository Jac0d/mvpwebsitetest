import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { createCustomTheme, themePresets, CustomColors } from '../theme';

interface ThemeContextType {
  currentTheme: string;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
  colors: CustomColors;
  customThemes: Record<string, CustomColors>;
  saveCustomTheme: (name: string, colors: CustomColors) => void;
  deleteCustomTheme: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a CustomThemeProvider');
  }
  return context;
};

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  // Load custom themes from localStorage
  const [customThemes, setCustomThemes] = useState<Record<string, CustomColors>>(() => {
    const savedCustomThemes = localStorage.getItem('app-custom-themes');
    return savedCustomThemes ? JSON.parse(savedCustomThemes) : {};
  });

  // Load theme from localStorage or default to 'default'
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem('app-theme');
    const allThemes = { ...themePresets, ...customThemes };
    return savedTheme && savedTheme in allThemes ? savedTheme : 'default';
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('app-theme', currentTheme);
  }, [currentTheme]);

  // Save custom themes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('app-custom-themes', JSON.stringify(customThemes));
  }, [customThemes]);

  const setTheme = (themeName: string) => {
    const allThemes = { ...themePresets, ...customThemes };
    if (themeName in allThemes) {
      setCurrentTheme(themeName);
    }
  };

  const saveCustomTheme = (name: string, colors: CustomColors) => {
    setCustomThemes(prev => ({
      ...prev,
      [name]: colors
    }));
  };

  const deleteCustomTheme = (name: string) => {
    setCustomThemes(prev => {
      const newThemes = { ...prev };
      delete newThemes[name];
      return newThemes;
    });
    // If the deleted theme was active, switch to default
    if (currentTheme === name) {
      setCurrentTheme('default');
    }
  };

  const allThemes = { ...themePresets, ...customThemes };
  const availableThemes = Object.keys(allThemes);
  const colors = allThemes[currentTheme] || themePresets.default;
  
  // Create theme with current colors (whether preset or custom)
  const muiTheme = currentTheme in themePresets 
    ? createCustomTheme(currentTheme as keyof typeof themePresets)
    : createTheme({
        customColors: colors,
        palette: {
          primary: { main: colors.primary },
          secondary: { main: colors.secondary },
        },
        typography: {
          fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        },
      });

  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes,
    colors,
    customThemes,
    saveCustomTheme,
    deleteCustomTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={muiTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}; 