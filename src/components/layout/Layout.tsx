import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: React.ReactNode[];
}

const drawerWidth = 240;

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

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`,
          bgcolor: '#fff',
          color: '#222',
          boxShadow: 1
        }}
      >
        <Toolbar>
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
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: colors.sideMenu,
            color: colors.sideMenuText,
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.sideMenuText }}>
            MVP
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
                }}
              >
                <ListItemIcon sx={{ color: colors.sideMenuIcon }}>
                  {item.icon}
                </ListItemIcon>
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
              </ListItem>
            </Box>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          width: `calc(100% - ${drawerWidth}px)`,
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