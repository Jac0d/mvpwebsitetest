import { useTheme } from '../context/ThemeContext';
import { createButtonStyles } from '../styles/buttonStyles';

export const useThemedStyles = () => {
  const { colors } = useTheme();
  
  return {
    buttonStyles: createButtonStyles(colors),
    colors
  };
}; 