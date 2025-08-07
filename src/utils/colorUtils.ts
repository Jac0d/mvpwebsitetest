// Utility functions for automatic color generation

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Darken a color by a percentage (0-1)
export function darkenColor(hex: string, amount: number = 0.2): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const darkenedR = Math.max(0, Math.floor(rgb.r * (1 - amount)));
  const darkenedG = Math.max(0, Math.floor(rgb.g * (1 - amount)));
  const darkenedB = Math.max(0, Math.floor(rgb.b * (1 - amount)));
  
  return rgbToHex(darkenedR, darkenedG, darkenedB);
}

// Lighten a color by a percentage (0-1)
export function lightenColor(hex: string, amount: number = 0.2): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const lightenedR = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * amount));
  const lightenedG = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * amount));
  const lightenedB = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * amount));
  
  return rgbToHex(lightenedR, lightenedG, lightenedB);
}

// Get a very light tint for backgrounds (much lighter)
export function getTintColor(hex: string, amount: number = 0.95): string {
  return lightenColor(hex, amount);
}

// Get a subtle background color
export function getSubtleBackground(hex: string): string {
  return getTintColor(hex, 0.85);
}

// Get appropriate text color (dark or light) based on background luminance
export function getContrastTextColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#374151';
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  // Return dark text for light backgrounds, light text for dark backgrounds
  return luminance > 0.6 ? '#374151' : '#ffffff';
}

// Generate a complete color palette from essential colors
export interface EssentialColors {
  primary: string;
  secondary: string;
  containerPaper: string;
  sideMenu: string;
  iconPrimary: string;
}

export function generateColorPalette(essentials: EssentialColors) {
  const { primary, secondary, containerPaper, sideMenu, iconPrimary } = essentials;
  
  return {
    primary,
    primaryHover: darkenColor(primary, 0.15),
    secondary,
    secondaryHover: darkenColor(secondary, 0.15),
    containerPaper,
    sideMenu,
    sideMenuHover: darkenColor(sideMenu, 0.1),
    sideMenuText: getContrastTextColor(sideMenu),
    sideMenuIcon: iconPrimary,
    iconPrimary,
    // Fixed colors that won't change
    background: '#f8fafc',
    textPrimary: '#374151',
    textSecondary: '#888',
    border: '#e0e7ff'
  };
}

// Color format conversion utilities
export function hexToHsl(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'hsl(0, 0%, 0%)';
  
  const { r, g, b } = rgb;
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }
  
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export function hexToRgbString(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'rgb(0, 0, 0)';
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
} 