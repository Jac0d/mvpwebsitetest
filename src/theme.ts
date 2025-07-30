import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
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