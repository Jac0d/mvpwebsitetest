import { CustomColors, themePresets } from '../theme';
import { useTheme } from '../context/ThemeContext';

export const createButtonStyles = (colors: CustomColors) => ({
  primary: {
    variant: "contained" as const,
    sx: {
      bgcolor: `${colors.primary} !important`,
      color: '#fff !important',
      textTransform: 'none !important',
      fontWeight: 500,
      fontFamily: 'Montserrat, sans-serif',
      borderRadius: '4px',
      px: 2,
      py: 1,
      whiteSpace: 'nowrap',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1) !important',
      '&:hover': { 
        bgcolor: `${colors.primaryHover} !important`,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15) !important'
      }
    }
  },
  secondary: {
    variant: "contained" as const,
    sx: {
      bgcolor: '#fff !important',
      color: `${colors.secondary} !important`,
      textTransform: 'none !important',
      fontWeight: 500,
      fontFamily: 'Montserrat, sans-serif',
      border: `1px solid ${colors.secondary}`,
      borderRadius: '4px',
      px: 2,
      py: 1,
      whiteSpace: 'nowrap',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1) !important',
      '&:hover': { 
        bgcolor: `${colors.containerPaper} !important`,
        color: `${colors.secondaryHover} !important`,
        border: `1px solid ${colors.secondaryHover}`,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15) !important'
      }
    }
  },
  cancel: {
    variant: "contained" as const,
    sx: {
      bgcolor: '#d3d7df !important',
      color: '#222 !important',
      textTransform: 'none !important',
      fontWeight: 500,
      fontFamily: 'Montserrat, sans-serif',
      borderRadius: '4px',
      px: 2,
      py: 1,
      whiteSpace: 'nowrap',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1) !important',
      '&:hover': { 
        bgcolor: '#b8c0cc !important',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15) !important'
      }
    }
  },
  danger: {
    variant: "contained" as const,
    sx: {
      bgcolor: '#e57373 !important',
      color: '#fff !important',
      textTransform: 'none !important',
      fontWeight: 500,
      fontFamily: 'Montserrat, sans-serif',
      borderRadius: '4px',
      px: 2,
      py: 1,
      whiteSpace: 'nowrap',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1) !important',
      '&:hover': { 
        bgcolor: '#c53030 !important',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15) !important'
      }
    }
  },
  success: {
    variant: "contained" as const,
    sx: {
      bgcolor: '#10b981 !important',
      color: '#fff !important',
      textTransform: 'none !important',
      fontWeight: 500,
      fontFamily: 'Montserrat, sans-serif',
      borderRadius: '4px',
      px: 2,
      py: 1,
      whiteSpace: 'nowrap',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1) !important',
      '&:hover': { 
        bgcolor: '#059669 !important',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15) !important'
      }
    }
  },
  disabled: {
    variant: "contained" as const,
    sx: {
      bgcolor: '#f3f4f6 !important',
      color: '#9ca3af !important',
      textTransform: 'none !important',
      fontWeight: 500,
      fontFamily: 'Montserrat, sans-serif',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      px: 2,
      py: 1,
      whiteSpace: 'nowrap',
      boxShadow: 'none !important',
      cursor: 'not-allowed !important',
      opacity: 0.6,
      width: '100%',
      '&:hover': { 
        bgcolor: '#f3f4f6 !important',
        color: '#9ca3af !important',
        border: '1px solid #d1d5db',
        boxShadow: 'none !important',
        cursor: 'not-allowed !important',
        opacity: 0.6
      }
    }
  },
  secondaryFull: {
    variant: "contained" as const,
    sx: {
      bgcolor: '#fff !important',
      color: `${colors.secondary} !important`,
      textTransform: 'none !important',
      fontWeight: 500,
      fontFamily: 'Montserrat, sans-serif',
      border: `1px solid ${colors.secondary}`,
      borderRadius: '4px',
      px: 2,
      py: 1,
      whiteSpace: 'nowrap',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1) !important',
      width: '100%',
      '&:hover': { 
        bgcolor: `${colors.containerPaper} !important`,
        color: `${colors.secondaryHover} !important`,
        border: `1px solid ${colors.secondaryHover}`,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15) !important'
      }
    }
  },
  successFull: {
    variant: "contained" as const,
    sx: {
      bgcolor: '#10b981 !important',
      color: '#fff !important',
      textTransform: 'none !important',
      fontWeight: 500,
      fontFamily: 'Montserrat, sans-serif',
      borderRadius: '4px',
      px: 2,
      py: 1,
      whiteSpace: 'nowrap',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1) !important',
      width: '100%',
      '&:hover': { 
        bgcolor: '#059669 !important',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15) !important'
      }
    }
  },
  dangerFull: {
    variant: "contained" as const,
    sx: {
      bgcolor: '#e57373 !important',
      color: '#fff !important',
      textTransform: 'none !important',
      fontWeight: 500,
      fontFamily: 'Montserrat, sans-serif',
      borderRadius: '4px',
      px: 2,
      py: 1,
      whiteSpace: 'nowrap',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1) !important',
      width: '100%',
      '&:hover': { 
        bgcolor: '#c53030 !important',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15) !important'
      }
    }
  }
});

// Create a hook that returns themed button styles
export const useButtonStyles = () => {
  const { colors } = useTheme();
  return createButtonStyles(colors);
};

// Export default button styles using the default theme
export const buttonStyles = createButtonStyles(themePresets.default); 