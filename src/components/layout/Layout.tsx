import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: React.ReactNode[];
}

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

const menuItems = [
  { text: 'Classes', icon: <SchoolIcon />, path: '/classes' },
  { text: 'Students', icon: <PeopleIcon />, path: '/students' },
  { text: 'Staff', icon: <PersonIcon />, path: '/staff' },
  { text: 'Lessons', icon: <MenuBookIcon />, path: '/lessons' },
  { text: 'Equipment', icon: <BuildIcon />, path: '/equipment' },
];

export function Layout({ children, title, breadcrumbs }: LayoutProps) {
  const location = useLocation();
  const { colors } = useTheme();
  const muiTheme = useMuiTheme();
  
  // Check if screen is small enough to collapse sidebar
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('lg'));
  const isVerySmallScreen = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Determine if sidebar should be collapsed based on screen size
  useEffect(() => {
    if (isVerySmallScreen) {
      setIsCollapsed(true);
    } else if (isSmallScreen) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [isSmallScreen, isVerySmallScreen]);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const currentDrawerWidth = isCollapsed ? collapsedDrawerWidth : drawerWidth;

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.sideMenuText }}>
          {isCollapsed ? 'MVP' : 'MVP'}
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <Box
            key={item.text}
            component={RouterLink}
            to={item.path}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <ListItem
              sx={{
                bgcolor: (location.pathname === item.path || (location.pathname === '/' && item.path === '/classes')) ? colors.sideMenuHover : 'transparent',
                '&:hover': {
                  bgcolor: colors.sideMenuHover,
                },
                minHeight: 48,
                px: isCollapsed ? 2 : 3,
              }}
            >
              <ListItemIcon sx={{ color: colors.sideMenuIcon, minWidth: isCollapsed ? 0 : 40 }}>
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      color: colors.sideMenuText,
                      fontWeight: 400,
                      fontSize: 14
                    } 
                  }}
                />
              )}
            </ListItem>
          </Box>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${currentDrawerWidth}px)`, 
          ml: `${currentDrawerWidth}px`,
          bgcolor: '#fff',
          color: '#222',
          boxShadow: 1,
          transition: muiTheme.transitions.create(['width', 'margin'], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          {isVerySmallScreen && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          {breadcrumbs ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Typography color="text.secondary" sx={{ mx: 1 }}>/</Typography>}
                  {crumb}
                </React.Fragment>
              ))}
            </Box>
          ) : (
            <Typography variant="h6" sx={{ color: '#374151', fontWeight: 600 }}>
              {title}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Permanent drawer for larger screens */}
      <Drawer
        sx={{
          width: currentDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            bgcolor: colors.sideMenu,
            color: colors.sideMenuText,
            transition: muiTheme.transitions.create('width', {
              easing: muiTheme.transitions.easing.sharp,
              duration: muiTheme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
          display: { xs: 'none', sm: 'block' },
        }}
        variant="permanent"
        anchor="left"
      >
        {drawerContent}
      </Drawer>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: colors.sideMenu,
            color: colors.sideMenuText,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          width: `calc(100% - ${currentDrawerWidth}px)`,
          transition: muiTheme.transitions.create(['width', 'margin'], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
} 