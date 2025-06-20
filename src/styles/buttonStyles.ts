export const buttonStyles = {
  primary: {
    variant: "contained" as const,
    sx: {
      bgcolor: '#4ecdc4 !important',
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
        bgcolor: '#38b2ac !important',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15) !important'
      }
    }
  },
  secondary: {
    variant: "contained" as const,
    sx: {
      bgcolor: '#fff !important',
      color: '#269b96 !important',
      textTransform: 'none !important',
      fontWeight: 500,
      fontFamily: 'Montserrat, sans-serif',
      border: '1px solid #269b96',
      borderRadius: '4px',
      px: 2,
      py: 1,
      whiteSpace: 'nowrap',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1) !important',
      '&:hover': { 
        bgcolor: '#f8fffe !important',
        color: '#1e7e7e !important',
        border: '1px solid #1e7e7e',
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
        bgcolor: '#bfc3cb !important',
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
  }
}; 