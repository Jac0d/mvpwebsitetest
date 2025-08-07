import { createTheme } from '@mui/material/styles';

// Define simplified custom color palettes - only the essential colors that should be editable
export interface CustomColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  containerPaper: string;
  sideMenu: string;
  sideMenuHover: string;
  sideMenuText: string;
  sideMenuIcon: string;
  iconPrimary: string;
  // Fixed colors that won't change
  background: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export const themePresets: Record<string, CustomColors> = {
  default: {
    primary: '#4ecdc4',
    primaryHover: '#38b2ac',
    secondary: '#269b96',
    secondaryHover: '#1e7e7e',
    containerPaper: '#f8fafc',
    sideMenu: '#1a1a1a',
    sideMenuHover: '#2d2d2d',
    sideMenuText: '#fff',
    sideMenuIcon: '#4ecdc4',
    iconPrimary: '#4ecdc4',
    // Fixed colors
    background: '#f8fafc',
    textPrimary: '#374151',
    textSecondary: '#888',
    border: '#e0e7ff'
  }
};

// Extend MUI theme interface
declare module '@mui/material/styles' {
  interface Theme {
    customColors: CustomColors;
  }
  interface ThemeOptions {
    customColors?: CustomColors;
  }
}

export const createCustomTheme = (themeKey: keyof typeof themePresets = 'default') => {
  const customColors = themePresets[themeKey];
  
  return createTheme({
    customColors,
    palette: {
      primary: {
        main: customColors.primary,
      },
      secondary: {
        main: customColors.secondary,
      },
    },
    typography: {
      fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      h1: {
        fontFamily: 'Montserrat, sans-serif',
      },
      h2: {
        fontFamily: 'Montserrat, sans-serif',
      },
      h3: {
        fontFamily: 'Montserrat, sans-serif',
      },
      h4: {
        fontFamily: 'Montserrat, sans-serif',
      },
      h5: {
        fontFamily: 'Montserrat, sans-serif',
      },
      h6: {
        fontFamily: 'Montserrat, sans-serif',
      },
      body1: {
        fontFamily: 'Montserrat, sans-serif',
      },
      body2: {
        fontFamily: 'Montserrat, sans-serif',
      },
      button: {
        fontFamily: 'Montserrat, sans-serif',
      },
      caption: {
        fontFamily: 'Montserrat, sans-serif',
      },
      overline: {
        fontFamily: 'Montserrat, sans-serif',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: 'Montserrat, sans-serif',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              fontFamily: 'Montserrat, sans-serif',
            },
            '& .MuiInputLabel-root': {
              fontFamily: 'Montserrat, sans-serif',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            fontFamily: 'Montserrat, sans-serif',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: 'Montserrat, sans-serif',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontFamily: 'Montserrat, sans-serif',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontFamily: 'Montserrat, sans-serif',
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            fontFamily: 'Montserrat, sans-serif',
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontFamily: 'Montserrat, sans-serif',
          },
          secondary: {
            fontFamily: 'Montserrat, sans-serif',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            fontFamily: 'Montserrat, sans-serif',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: 'Montserrat, sans-serif',
          },
        },
      },
    },
  });
};

// Export default theme for backward compatibility
export const theme = createCustomTheme('default'); 