import React from 'react';
import { Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, InputAdornment, Snackbar, Alert, IconButton, Tooltip, Tabs, Tab, CircularProgress } from '@mui/material';
import { Layout } from '../../components/layout/Layout';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import HandymanIcon from '@mui/icons-material/Handyman';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import ScienceIcon from '@mui/icons-material/Science';
import PowerIcon from '@mui/icons-material/Power';
import ConstructionIcon from '@mui/icons-material/Construction';
import WarningIcon from '@mui/icons-material/Warning';
import KitchenIcon from '@mui/icons-material/Kitchen';
import IronIcon from '@mui/icons-material/Iron';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import FactoryIcon from '@mui/icons-material/Factory';
import { buttonStyles } from '../../styles/buttonStyles';

export interface Lesson {
  id: number;
  name: string;
  icon: string;
  description: string;
  category: string;
  area: string;
  subArea?: string; // Optional sub-area for Industrial lessons
}

const lessonAreas = ['Industrial', 'Textiles', 'Kitchen', 'Maintenance'];
const lessonCategories = ['Safety', 'Tools', 'Machines', 'General'];
const industrialSubAreas = [
  'Workshop Safety',
  'Multiuse Workshop Equipment',
  'Metalworking',
  'Woodworking',
  'Painting & Finishing',
  'Heating & Forming'
];

const lessonIcons = {
  'Warning': <WarningIcon />,
  'Build': <BuildIcon />,
  'Handyman': <HandymanIcon />,
  'ElectricBolt': <ElectricBoltIcon />,
  'Science': <ScienceIcon />,
  'Power': <PowerIcon />,
  'Construction': <ConstructionIcon />,
  'Kitchen': <KitchenIcon />,
  'Iron': <IronIcon />,
  'HomeRepair': <HomeRepairServiceIcon />,
  'Factory': <FactoryIcon />,
};

const API_BASE = 'http://localhost:3001';

export default function LessonsPage() {
  const [tab, setTab] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [newLesson, setNewLesson] = React.useState({
    name: '',
    icon: '',
    description: '',
    category: '',
    area: '',
    subArea: '',
  });
  const [fieldError, setFieldError] = React.useState('');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [editingLesson, setEditingLesson] = React.useState<Lesson | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Load lessons when component mounts
  React.useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`${API_BASE}/lessons`);
        if (!response.ok) {
          throw new Error('Failed to fetch lessons');
        }
        const data = await response.json();
        console.log('Fetched lessons:', data); // Debug log
        setLessons(data);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setSnackbarSeverity('error');
        setSnackbarMessage('Failed to load lessons. Please refresh the page.');
        setSnackbarOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // Group lessons by area and sub-area for Industrial
  const lessonsByArea = lessonAreas.map(area => {
    const areaLessons = lessons.filter(lesson =>
      lesson.area === area &&
      (lesson.name.toLowerCase().includes(search.toLowerCase()) ||
       lesson.category.toLowerCase().includes(search.toLowerCase()) ||
       lesson.area.toLowerCase().includes(search.toLowerCase()) ||
       (lesson.subArea || '').toLowerCase().includes(search.toLowerCase()))
    );
    
    return {
      area,
      lessons: areaLessons
    };
  });

  // Compute which areas have lessons
  const areasWithLessons = lessonsByArea.filter(group => group.lessons.length > 0).map(group => group.area);

  // When clicking a tab, scroll to the section and filter
  const handleTabChange = (_: any, value: number) => {
    // First update the tab for filtering
    setTab(value);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // For Industrial area, filter by search and only show sub-areas with matching lessons
  const getIndustrialLessonsBySubArea = (lessons: Lesson[]) => {
    // First filter lessons by search
    const filteredLessons = search.trim() 
      ? lessons.filter(lesson => 
          lesson.name.toLowerCase().includes(search.toLowerCase()) ||
          lesson.category.toLowerCase().includes(search.toLowerCase())
        )
      : lessons;

    // Then group by sub-area and only return sub-areas that have matching lessons
    const subAreas = industrialSubAreas.map(subArea => ({
      subArea,
      lessons: filteredLessons.filter(lesson => lesson.subArea === subArea)
    }));

    // Only return sub-areas that have lessons after filtering
    return subAreas.filter(group => group.lessons.length > 0);
  };

  const handleAddEditLesson = async () => {
    setFieldError('');
    const { name, icon, description, category, area, subArea } = newLesson;
    if (!name.trim() || !icon || !category || !area) {
      setFieldError('Name, Icon, Category, and Area are required.');
      return;
    }
    if (area === 'Industrial' && !subArea) {
      setFieldError('Sub-area is required for Industrial lessons.');
      return;
    }

    try {
      if (editIndex !== null) {
        // Edit existing lesson
        const lessonToEdit = lessons[editIndex];
        const response = await fetch(`${API_BASE}/lessons/${lessonToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...lessonToEdit, ...newLesson })
        });

        if (!response.ok) {
          throw new Error('Failed to update lesson');
        }

        const updatedLesson = await response.json();
        setLessons(prev => prev.map(l => l.id === lessonToEdit.id ? updatedLesson : l));
      } else {
        // Add new lesson
        const newLessonWithId = { ...newLesson, id: Date.now() };
        const response = await fetch(`${API_BASE}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessons: [...lessons, newLessonWithId] })
        });

        if (!response.ok) {
          throw new Error('Failed to add lesson');
        }

        const data = await response.json();
        setLessons(data.lessons);
      }

      setDialogOpen(false);
      setNewLesson({ name: '', icon: '', description: '', category: '', area: '', subArea: '' });
      setEditIndex(null);
      setSnackbarSeverity('success');
      setSnackbarMessage(editIndex !== null ? 'Tool updated successfully!' : 'Tool added successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving lesson:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(editIndex !== null ? 'Failed to update tool. Please try again.' : 'Failed to add tool. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleEditClick = (idx: number) => {
    setEditIndex(idx);
    const lesson = lessons[idx];
    setNewLesson({
      name: lesson.name,
      icon: lesson.icon,
      description: lesson.description,
      category: lesson.category,
      area: lesson.area,
      subArea: lesson.subArea || '', // Ensure subArea is always defined
    });
    setDialogOpen(true);
    setFieldError('');
  };

  const handleDeleteClick = (idx: number) => {
    const lessonToDelete = lessons[idx];
    const updated = lessons.filter((_, i) => i !== idx);
    setLessons(updated);
    fetch(`${API_BASE}/lessons/${lessonToDelete.id}`, { method: 'DELETE' })
      .then(() => setSnackbarOpen(true));
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewLesson({ name: '', icon: '', description: '', category: '', area: '', subArea: '' });
    setEditIndex(null);
    setFieldError('');
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingLesson) return;

    fetch(`${API_BASE}/lessons/${editingLesson.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editingLesson),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }
      return response.json();
    })
    .then(updatedLesson => {
      setLessons(prev => prev.map(l => l.id === updatedLesson.id ? updatedLesson : l));
      setEditDialogOpen(false);
      setEditingLesson(null);
      setSnackbarSeverity('success');
      setSnackbarMessage('Lesson updated successfully!');
      setSnackbarOpen(true);
    })
    .catch(error => {
      console.error('Error updating lesson:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to update lesson. Please try again.');
      setSnackbarOpen(true);
    });
  };

  const EditDialog = () => (
    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                  <DialogTitle sx={{ fontWeight: 600 }}>
        Edit Lesson
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Name"
            fullWidth
            value={editingLesson?.name || ''}
            onChange={(e) => setEditingLesson(prev => prev ? { ...prev, name: e.target.value } : null)}
          />
          <TextField
            select
            label="Icon"
            fullWidth
            value={editingLesson?.icon || ''}
            onChange={(e) => setEditingLesson(prev => prev ? { ...prev, icon: e.target.value } : null)}
          >
            {Object.keys(lessonIcons).map((icon) => (
              <MenuItem key={icon} value={icon}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {lessonIcons[icon as keyof typeof lessonIcons]}
                  <span>{icon}</span>
                </Box>
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Category"
            fullWidth
            value={editingLesson?.category || ''}
            onChange={(e) => setEditingLesson(prev => prev ? { ...prev, category: e.target.value } : null)}
          >
            {lessonCategories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Area"
            fullWidth
            value={editingLesson?.area || ''}
            onChange={(e) => setEditingLesson(prev => prev ? { ...prev, area: e.target.value } : null)}
          >
            {lessonAreas.map((area) => (
              <MenuItem key={area} value={area}>{area}</MenuItem>
            ))}
          </TextField>
          {editingLesson?.area === 'Industrial' && (
            <TextField
              select
              label="Sub-Area"
              fullWidth
              value={editingLesson?.subArea || ''}
              onChange={(e) => setEditingLesson(prev => prev ? { ...prev, subArea: e.target.value } : null)}
            >
              {industrialSubAreas.map((subArea) => (
                <MenuItem key={subArea} value={subArea}>{subArea}</MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={editingLesson?.description || ''}
            onChange={(e) => setEditingLesson(prev => prev ? { ...prev, description: e.target.value } : null)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setEditDialogOpen(false)}
          {...buttonStyles.cancel}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveEdit}
          {...buttonStyles.primary}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderLessonCard = (lesson: Lesson) => (
    <Paper
      key={lesson.id}
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid #e0e7ff',
        bgcolor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
          transform: 'translateY(-1px)'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          color: '#4ecdc4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24
        }}>
          {lessonIcons[lesson.icon as keyof typeof lessonIcons]}
        </Box>
        <Box>
          <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: '#374151' }}>
            {lesson.name}
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: 14, fontFamily: 'Montserrat, sans-serif' }}>
            {lesson.category} • {lesson.area}{lesson.subArea ? ` • ${lesson.subArea}` : ''}
          </Typography>
        </Box>
      </Box>
      <IconButton
        size="small"
        onClick={() => handleEditLesson(lesson)}
        sx={{
          color: '#4ecdc4',
          '&:hover': {
            color: '#38b2ac',
            bgcolor: 'rgba(78, 205, 196, 0.08)'
          }
        }}
      >
        <EditIcon />
      </IconButton>
    </Paper>
  );

  return (
    <Layout
      title="Lessons"
      breadcrumbs={[
        <Typography key="lessons" color="text.primary" sx={{ fontWeight: 600, fontSize: 18 }}>Lessons</Typography>
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 240, right: 0, zIndex: 1099 }}>
        {/* Search Bar and Add Button */}
        <Box sx={{ bgcolor: '#fff', pt: 3, pb: 1 }}>
          <Box sx={{ maxWidth: 1000, minWidth: 360, mx: 'auto', px: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search lessons..."
                size="small"
                fullWidth
                sx={{ bgcolor: '#fff', borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#b0b0b0' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  setNewLesson({
                    name: '',
                    icon: '',
                    description: '',
                    category: '',
                    area: '',
                    subArea: '',
                  });
                  setEditIndex(null);
                  setDialogOpen(true);
                }}
                {...buttonStyles.primary}
              >
                Add Tool
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ position: 'sticky', top: 0, bgcolor: '#fff', zIndex: 1, borderBottom: '1px solid #e0e7ff', pt: 1, pb: 0.5 }}>
          <Box sx={{ maxWidth: 1000, minWidth: 360, mx: 'auto', px: 8, width: '100%' }}>
            <Tabs 
              value={tab} 
              onChange={handleTabChange} 
              textColor="primary" 
              indicatorColor="primary" 
              variant="scrollable" 
              scrollButtons="auto"
            >
              <Tab label="All Areas" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              {areasWithLessons.map((area) => (
                <Tab key={area} label={area} sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              ))}
            </Tabs>
          </Box>
        </Box>

        {/* Lessons List */}
        <Box sx={{ flex: 1, overflowY: 'auto' }} ref={scrollContainerRef}>
          <Box sx={{ px: 4, py: 4, maxWidth: 1000, minWidth: 540, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress sx={{ color: '#4ecdc4' }} />
              </Box>
            ) : lessons.length === 0 ? (
              <Box sx={{ textAlign: 'center', color: '#666', py: 4 }}>
                <Typography>No lessons found</Typography>
              </Box>
            ) : tab === 0 ? (
              <>
                {lessonsByArea.filter(group => group.lessons.length > 0).map(group => (
                  <Paper key={group.area} elevation={1} sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: '#f8fafc', border: '1px solid #e0e7ff' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>{group.area}</Typography>
                    {group.area === 'Industrial' ? (
                      // Industrial area with sub-areas
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {getIndustrialLessonsBySubArea(group.lessons).map(subGroup => (
                          <Paper
                            key={subGroup.subArea}
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: '#fff',
                              border: '1px solid #e0e7ff'
                            }}
                          >
                            <Typography 
                              sx={{ 
                                fontWeight: 600, 
                                color: '#4b5563', 
                                mb: 2,
                                fontSize: '1.1rem',
                                borderBottom: '2px solid #4ecdc4',
                                pb: 1
                              }}
                            >
                              {subGroup.subArea}
                            </Typography>
                            {subGroup.lessons.length > 0 ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {subGroup.lessons.map((lesson) => 
                                  renderLessonCard(lesson)
                                )}
                              </Box>
                            ) : (
                              <Box 
                                sx={{ 
                                  p: 2, 
                                  borderRadius: 2, 
                                  bgcolor: '#f8fafc',
                                  border: '1px solid #e0e7ff',
                                  color: '#6b7280',
                                  fontStyle: 'italic',
                                  fontSize: 14
                                }}
                              >
                                No lessons in this category yet
                              </Box>
                            )}
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      // Other areas without sub-areas
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {group.lessons.length > 0 ? (
                          group.lessons.map((lesson) => 
                            renderLessonCard(lesson)
                          )
                        ) : (
                          <Box 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2, 
                              bgcolor: '#fff',
                              border: '1px solid #e0e7ff',
                              color: '#6b7280',
                              fontStyle: 'italic',
                              fontSize: 14
                            }}
                          >
                            No lessons in this area yet
                          </Box>
                        )}
                      </Box>
                    )}
                  </Paper>
                ))}
              </>
            ) : (
              <>
                {(() => {
                  const area = areasWithLessons[tab - 1];
                  const group = lessonsByArea.find(g => g.area === area);
                  if (group && group.lessons.length > 0) {
                    return (
                      <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: '#f8fafc', border: '1px solid #e0e7ff' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>{group.area}</Typography>
                        {area === 'Industrial' ? (
                          // Industrial area with sub-areas
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {getIndustrialLessonsBySubArea(group.lessons).map(subGroup => (
                              <Paper
                                key={subGroup.subArea}
                                elevation={0}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: '#fff',
                                  border: '1px solid #e0e7ff'
                                }}
                              >
                                <Typography 
                                  sx={{ 
                                    fontWeight: 600, 
                                    color: '#4b5563', 
                                    mb: 2,
                                    fontSize: '1.1rem',
                                    borderBottom: '2px solid #4ecdc4',
                                    pb: 1
                                  }}
                                >
                                  {subGroup.subArea}
                                </Typography>
                                {subGroup.lessons.length > 0 ? (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {subGroup.lessons.map((lesson) => 
                                      renderLessonCard(lesson)
                                    )}
                                  </Box>
                                ) : (
                                  <Box 
                                    sx={{ 
                                      p: 2, 
                                      borderRadius: 2, 
                                      bgcolor: '#f8fafc',
                                      border: '1px solid #e0e7ff',
                                      color: '#6b7280',
                                      fontStyle: 'italic',
                                      fontSize: 14
                                    }}
                                  >
                                    No lessons in this category yet
                                  </Box>
                                )}
                              </Paper>
                            ))}
                          </Box>
                        ) : (
                          // Other areas without sub-areas
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {group.lessons.length > 0 ? (
                              group.lessons.map((lesson) => 
                                renderLessonCard(lesson)
                              )
                            ) : (
                              <Box 
                                sx={{ 
                                  p: 2, 
                                  borderRadius: 2, 
                                  bgcolor: '#fff',
                                  border: '1px solid #e0e7ff',
                                  color: '#6b7280',
                                  fontStyle: 'italic',
                                  fontSize: 14
                                }}
                              >
                                No lessons in this area yet
                              </Box>
                            )}
                          </Box>
                        )}
                      </Paper>
                    );
                  }
                  return (
                    <Typography sx={{ color: '#888' }}>
                      No lessons found in this area.
                    </Typography>
                  );
                })()}
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Add/Edit Lesson Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                  <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
          {editIndex !== null ? 'Edit Tool' : 'Add New Tool'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tool Name*"
              value={newLesson.name}
              onChange={e => setNewLesson({ ...newLesson, name: e.target.value })}
              size="small"
              error={!!fieldError && !newLesson.name}
              fullWidth
            />
            <TextField
              select
              label="Area*"
              value={newLesson.area}
              onChange={e => setNewLesson({ ...newLesson, area: e.target.value, subArea: '' })}
              size="small"
              error={!!fieldError && !newLesson.area}
              fullWidth
            >
              {lessonAreas.map(area => (
                <MenuItem key={area} value={area}>{area}</MenuItem>
              ))}
            </TextField>
            {newLesson.area === 'Industrial' && (
              <TextField
                select
                label="Sub-Area*"
                value={newLesson.subArea}
                onChange={e => setNewLesson({ ...newLesson, subArea: e.target.value })}
                size="small"
                error={!!fieldError && !newLesson.subArea}
                fullWidth
              >
                {industrialSubAreas.map(subArea => (
                  <MenuItem key={subArea} value={subArea}>{subArea}</MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              select
              label="Category*"
              value={newLesson.category}
              onChange={e => setNewLesson({ ...newLesson, category: e.target.value })}
              size="small"
              error={!!fieldError && !newLesson.category}
              fullWidth
            >
              {lessonCategories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Icon*"
              value={newLesson.icon}
              onChange={e => setNewLesson({ ...newLesson, icon: e.target.value })}
              size="small"
              error={!!fieldError && !newLesson.icon}
              fullWidth
            >
              {Object.entries(lessonIcons).map(([name, icon]) => (
                <MenuItem key={name} value={name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: '#4ecdc4' }}>{icon}</Box>
                    <Typography>{name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              value={newLesson.description}
              onChange={e => setNewLesson({ ...newLesson, description: e.target.value })}
              size="small"
              multiline
              rows={3}
              fullWidth
            />
            {fieldError && (
              <Typography color="error" sx={{ fontSize: 14 }}>{fieldError}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleDialogClose}
            {...buttonStyles.cancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddEditLesson}
            {...buttonStyles.primary}
          >
            {editIndex !== null ? 'Save Changes' : 'Add Tool'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {EditDialog()}
    </Layout>
  );
} 