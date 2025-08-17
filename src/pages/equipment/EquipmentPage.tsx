import React from 'react';
import { Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, InputAdornment, Snackbar, Alert, Tabs, Tab, IconButton, Tooltip, Checkbox, Radio, Menu } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import HandymanIcon from '@mui/icons-material/Handyman';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import ScienceIcon from '@mui/icons-material/Science';
import PowerIcon from '@mui/icons-material/Power';
import ConstructionIcon from '@mui/icons-material/Construction';
import FactoryIcon from '@mui/icons-material/Factory';
import KitchenIcon from '@mui/icons-material/Kitchen';
import IronIcon from '@mui/icons-material/Iron';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import * as XLSX from 'xlsx';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  code: string;
  location: string;
  photo?: string;
  purchasePrice?: number;
}

const equipmentTypes = ['Hand Tool', 'Power Tool', 'Machine', 'Portable Appliance', 'Fixed Appliance'];

const API_BASE = 'http://localhost:3001';

export default function EquipmentPage() {
  const { colors, buttonStyles } = useThemedStyles();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [newEquipment, setNewEquipment] = React.useState({
    name: '',
    type: '',
    code: '',
    location: '',
    purchasePrice: '',
  });
  const [fieldError, setFieldError] = React.useState('');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [rooms, setRooms] = React.useState<string[]>([]);
  const [roomDialogOpen, setRoomDialogOpen] = React.useState(false);
  const [newRoom, setNewRoom] = React.useState('');
  const [roomError, setRoomError] = React.useState('');
  const [selectedRoomTab, setSelectedRoomTab] = React.useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = React.useState<Equipment | null>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = React.useState(false);
  const [selectedRoomsForDownload, setSelectedRoomsForDownload] = React.useState<string[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Lesson linking state
  const [linkLessonDialogOpen, setLinkLessonDialogOpen] = React.useState(false);
  const [lessons, setLessons] = React.useState<any[]>([]);
  const [lessonSearch, setLessonSearch] = React.useState('');
  const [lessonDialogTab, setLessonDialogTab] = React.useState(0);
  const [selectedLesson, setSelectedLesson] = React.useState<string | null>(null);
  const [linkedLesson, setLinkedLesson] = React.useState<any | null>(null);

  // Room editing state
  const [editRoomDialogOpen, setEditRoomDialogOpen] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState('');
  const [editingRoomOriginal, setEditingRoomOriginal] = React.useState('');
  const [editRoomError, setEditRoomError] = React.useState('');
  const [roomMenuAnchorEl, setRoomMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRoomForMenu, setSelectedRoomForMenu] = React.useState<string>('');
  const roomMenuOpen = Boolean(roomMenuAnchorEl);
  const [deleteRoomDialogOpen, setDeleteRoomDialogOpen] = React.useState(false);
  const [roomToDelete, setRoomToDelete] = React.useState<string>('');

  // Lesson icons
  const lessonIcons: { [key: string]: JSX.Element } = {
    'Warning': <WarningIcon color="inherit" fontSize="inherit" />,
    'Build': <BuildIcon color="inherit" fontSize="inherit" />,
    'Handyman': <HandymanIcon color="inherit" fontSize="inherit" />,
    'ElectricBolt': <ElectricBoltIcon color="inherit" fontSize="inherit" />,
    'Science': <ScienceIcon color="inherit" fontSize="inherit" />,
    'Power': <PowerIcon color="inherit" fontSize="inherit" />,
    'Construction': <ConstructionIcon color="inherit" fontSize="inherit" />,
    'Factory': <FactoryIcon color="inherit" fontSize="inherit" />,
    'Kitchen': <KitchenIcon color="inherit" fontSize="inherit" />,
    'Iron': <IronIcon color="inherit" fontSize="inherit" />,
    'HomeRepair': <HomeRepairServiceIcon color="inherit" fontSize="inherit" />
  };

  // Lesson sorting function
  const sortLessonsByPageOrder = (lessonNames: string[], allLessons: any[]) => {
    const lessonAreas = ['Industrial', 'Textiles', 'Kitchen', 'Maintenance'];
    const industrialSubAreas = [
      'Workshop Safety', 'Multiuse Workshop Equipment', 'Metalworking', 'Woodworking', 'Painting & Finishing', 'Heating & Forming'
    ];
    const lessonMap = new Map();
    allLessons.forEach(lesson => { lessonMap.set(lesson.name, lesson); });
    return lessonNames.sort((a, b) => {
      const lessonA = lessonMap.get(a);
      const lessonB = lessonMap.get(b);
      if (!lessonA || !lessonB) return 0;
      const areaA = lessonAreas.indexOf(lessonA.area);
      const areaB = lessonAreas.indexOf(lessonB.area);
      if (areaA !== areaB) return areaA - areaB;
      if (lessonA.area === 'Industrial' && lessonB.area === 'Industrial') {
        const subAreaA = industrialSubAreas.indexOf(lessonA.subArea || '');
        const subAreaB = industrialSubAreas.indexOf(lessonB.subArea || '');
        if (subAreaA !== subAreaB) return subAreaA - subAreaB;
      }
      const originalIndexA = allLessons.findIndex(l => l.name === a);
      const originalIndexB = allLessons.findIndex(l => l.name === b);
      return originalIndexA - originalIndexB;
    });
  };

  // Fetch lessons when dialog opens
  React.useEffect(() => {
    if (linkLessonDialogOpen) {
      fetch(`${API_BASE}/lessons`)
        .then(res => res.json())
        .then(data => setLessons(data))
        .catch(() => setLessons([]));
    }
  }, [linkLessonDialogOpen]);

  // Fetch equipment and rooms on mount
  React.useEffect(() => {
    fetch(`${API_BASE}/equipment`).then(res => res.json()).then(data => setEquipment(data));
    fetch(`${API_BASE}/rooms`).then(res => res.json()).then(data => setRooms(data));
  }, []);

  // Filtered equipment by search
  const searchedEquipment = equipment.filter(eq =>
    eq.name.toLowerCase().includes(search.toLowerCase()) ||
    (eq.code || '').toLowerCase().includes(search.toLowerCase()) ||
    eq.type.toLowerCase().includes(search.toLowerCase())
  );

  // When clicking a tab, scroll to the section and filter
  const handleTabChange = (_: any, value: number) => {
    // First update the tab for filtering
    setSelectedRoomTab(value);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddEditEquipment = async () => {
    setFieldError('');
    const { name, type, code, location, purchasePrice } = newEquipment;
    if (!name.trim() || !type || !location.trim()) {
      setFieldError('All fields except Serial Number and Purchase Price are required.');
      return;
    }
    
    if (editIndex !== null) {
      // Edit
      const updated = equipment.map((eq, idx) => idx === editIndex ? { 
        ...eq, 
        ...newEquipment,
        purchasePrice: newEquipment.purchasePrice ? parseFloat(newEquipment.purchasePrice.replace('$', '')) : undefined
      } : eq);
      setEquipment(updated);
      fetch(`${API_BASE}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipment: updated })
      }).then(() => {
        window.location.reload();
      });
    } else {
      // Add
      const generateEquipmentId = (name, location) => {
        const nameInitials = name.split(' ').map(word => word[0]).join('').toUpperCase();
        const locationInitial = location ? location[0].toUpperCase() : '';
        const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
        return `${nameInitials}${locationInitial}${randomDigits}`;
      }
      const newEq = { 
        ...newEquipment, 
        id: generateEquipmentId(newEquipment.name, newEquipment.location),
        purchasePrice: newEquipment.purchasePrice ? parseFloat(newEquipment.purchasePrice.replace('$', '')) : undefined
      };
      const updated = [...equipment, newEq];
      setEquipment(updated);
      
      // Save equipment first
      const equipmentResponse = await fetch(`${API_BASE}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipment: updated })
      });
      
      if (equipmentResponse.ok) {
        // If lesson is selected, link it to the new equipment
        if (selectedLesson) {
          const lesson = lessons.find(l => l.name === selectedLesson);
          if (lesson) {
            try {
              await fetch(`${API_BASE}/equipment/${newEq.id}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId: lesson.id })
              });
            } catch (error) {
              console.error('Error linking lesson:', error);
            }
          }
        }
        window.location.reload();
      }
    }
    setDialogOpen(false);
    setNewEquipment({ name: '', type: '', code: '', location: '', purchasePrice: '' });
    setEditIndex(null);
    setSelectedLesson(null);
    setLinkedLesson(null);
    setSnackbarMessage('Equipment updated successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleEditClick = (idx: number) => {
    setEditIndex(idx);
    setNewEquipment({ 
      ...equipment[idx], 
      purchasePrice: equipment[idx].purchasePrice ? `$${equipment[idx].purchasePrice}` : ''
    });
    setDialogOpen(true);
    setFieldError('');
  };

  const handleDeleteClick = (idx: number) => {
    const eqToDelete = equipment[idx];
    setEquipmentToDelete(eqToDelete);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewEquipment({ name: '', type: '', code: '', location: '', purchasePrice: '' });
    setEditIndex(null);
    setSelectedLesson(null);
    setLinkedLesson(null);
    setFieldError('');
  };

  const handleAddRoom = () => {
    setRoomError('');
    const roomName = newRoom.trim();
    if (!roomName) {
      setRoomError('Room name is required.');
      return;
    }
    if (rooms.includes(roomName)) {
      setRoomError('Room already exists.');
      return;
    }
    const updated = [...rooms, roomName];
    setRooms(updated);
    fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rooms: updated })
    });
    setRoomDialogOpen(false);
    setNewRoom('');
    setRoomError('');
    setSelectedRoomTab(rooms.length + 1); // select new room tab
  };

  const handleDeleteConfirmation = () => {
    if (equipmentToDelete) {
      const updated = equipment.filter((_, i) => i !== equipment.findIndex(e => e.id === equipmentToDelete.id));
      setEquipment(updated);
      fetch(`${API_BASE}/equipment/${equipmentToDelete.id}`, { method: 'DELETE' })
        .then(() => {
          setSnackbarMessage('Equipment deleted successfully!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        });
    }
    setDeleteDialogOpen(false);
    setEquipmentToDelete(null);
  };

  const handleDownloadClick = () => {
    setSelectedRoomsForDownload([]);
    setDownloadDialogOpen(true);
  };

  const handleSelectAllRooms = () => {
    const allSelected = selectedRoomsForDownload.length === rooms.length;
    if (allSelected) {
      setSelectedRoomsForDownload([]);
    } else {
      setSelectedRoomsForDownload([...rooms]);
    }
  };

  const handleRoomToggle = (room: string) => {
    setSelectedRoomsForDownload(prev => 
      prev.includes(room) 
        ? prev.filter(r => r !== room)
        : [...prev, room]
    );
  };

  // Room editing functions
  const handleRoomMenuClick = (event: React.MouseEvent<HTMLElement>, room: string) => {
    event.stopPropagation();
    setRoomMenuAnchorEl(event.currentTarget);
    setSelectedRoomForMenu(room);
  };

  const handleRoomMenuClose = () => {
    setRoomMenuAnchorEl(null);
    setSelectedRoomForMenu('');
  };

  const handleEditRoom = () => {
    handleRoomMenuClose();
    setEditingRoom(selectedRoomForMenu);
    setEditingRoomOriginal(selectedRoomForMenu);
    setEditRoomError('');
    setEditRoomDialogOpen(true);
  };

  const handleSaveEditRoom = () => {
    setEditRoomError('');
    const newRoomName = editingRoom.trim();
    
    if (!newRoomName) {
      setEditRoomError('Room name is required.');
      return;
    }
    
    if (newRoomName === editingRoomOriginal) {
      setEditRoomDialogOpen(false);
      return;
    }
    
    if (rooms.includes(newRoomName)) {
      setEditRoomError('Room name already exists.');
      return;
    }

    // Update rooms array
    const updatedRooms = rooms.map(room => 
      room === editingRoomOriginal ? newRoomName : room
    );
    setRooms(updatedRooms);

    // Update equipment locations
    const updatedEquipment = equipment.map(eq => 
      eq.location === editingRoomOriginal ? { ...eq, location: newRoomName } : eq
    );
    setEquipment(updatedEquipment);

    // Save to backend
    fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rooms: updatedRooms })
    });

    fetch(`${API_BASE}/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equipment: updatedEquipment })
    });

    setEditRoomDialogOpen(false);
    setEditingRoom('');
    setEditingRoomOriginal('');
    setSnackbarMessage('Room updated successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleDeleteRoom = () => {
    handleRoomMenuClose();
    const roomToDeleteName = selectedRoomForMenu;
    
    // Check if room has equipment
    const equipmentInRoom = equipment.filter(eq => eq.location === roomToDeleteName);
    
    if (equipmentInRoom.length > 0) {
      // Show error message - room has equipment
      setSnackbarMessage(`Cannot delete room "${roomToDeleteName}". Please move or delete all equipment in this room first.`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Room is empty, proceed with delete confirmation
    setRoomToDelete(roomToDeleteName);
    setDeleteRoomDialogOpen(true);
  };

  const handleConfirmDeleteRoom = () => {
    if (!roomToDelete) return;
    
    // Remove room from rooms array
    const updatedRooms = rooms.filter(room => room !== roomToDelete);
    setRooms(updatedRooms);
    
    // Save to backend
    fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rooms: updatedRooms })
    });
    
    setDeleteRoomDialogOpen(false);
    setRoomToDelete('');
    setSnackbarMessage('Room deleted successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const exportEquipmentToExcel = () => {
    // Filter equipment by selected rooms
    const filteredEquipment = selectedRoomsForDownload.length === 0 
      ? equipment 
      : equipment.filter(eq => selectedRoomsForDownload.includes(eq.location));

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data for export
    const equipmentData = filteredEquipment.map(eq => ({
      'Equipment ID': eq.id,
      'Name': eq.name,
      'Type': eq.type,
      'Serial Number': eq.code || '',
      'Location': eq.location,
      'Purchase Price': eq.purchasePrice ? `$${eq.purchasePrice.toFixed(2)}` : '',
      'Photo URL': eq.photo || ''
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(equipmentData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Equipment ID
      { wch: 30 }, // Name
      { wch: 15 }, // Type
      { wch: 20 }, // Serial Number
      { wch: 20 }, // Location
      { wch: 15 }, // Purchase Price
      { wch: 40 }  // Photo URL
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Equipment Inventory');

    // Generate filename with room info
    const roomText = selectedRoomsForDownload.length === 0 
      ? 'All_Rooms' 
      : selectedRoomsForDownload.length === 1 
        ? selectedRoomsForDownload[0].replace(/\s+/g, '_')
        : 'Selected_Rooms';

    // Save file
    XLSX.writeFile(wb, `Equipment_Inventory_${roomText}.xlsx`);
    
    // Close dialog
    setDownloadDialogOpen(false);
  };

  return (
    <Layout
      title="Equipment"
      breadcrumbs={[
        <Typography key="equipment" color="text.primary" sx={{ fontWeight: 600, fontSize: 18 }}>Equipment</Typography>
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: { xs: 0, md: '64px', lg: '240px' }, right: 0, zIndex: 1099 }}>
        {/* Search, Add Equipment, Add Room */}
        <Box sx={{ bgcolor: '#fff', pt: 3, pb: 1 }}>
          <Box sx={{ maxWidth: 1000, minWidth: 600, mx: 'auto', px: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search equipment..."
              size="small"
              sx={{ flex: 1, minWidth: 180, bgcolor: '#fff', borderRadius: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                                          <SearchIcon sx={{ color: colors.iconPrimary }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              {...buttonStyles.secondary}
              startIcon={<DownloadIcon />}
              onClick={handleDownloadClick}
            >
              Download Excel
            </Button>
            <Button
              {...buttonStyles.primary}
              startIcon={<AddIcon />}
              onClick={() => { setDialogOpen(true); setEditIndex(null); setNewEquipment({ name: '', type: '', code: '', location: '', purchasePrice: '' }); setFieldError(''); }}
            >
              Add Equipment
            </Button>
            <Button
              {...buttonStyles.primary}
              startIcon={<AddIcon />}
              onClick={() => { setRoomDialogOpen(true); setNewRoom(''); setRoomError(''); }}
            >
              Add Room
            </Button>
          </Box>
        </Box>
        {/* Room Tabs */}
        <Box sx={{ position: 'sticky', top: 0, bgcolor: '#fff', zIndex: 1, borderBottom: `1px solid ${colors.border}`, pt: 1, pb: 0.5 }}>
          <Box sx={{ maxWidth: 1000, minWidth: 600, mx: 'auto', px: 8, width: '100%' }}>
            <Tabs 
              value={selectedRoomTab} 
              onChange={handleTabChange} 
              textColor="primary" 
              indicatorColor="primary" 
              variant="scrollable" 
              scrollButtons="auto"
            >
              <Tab label="All Rooms" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              {rooms.map((room, i) => (
                <Tab key={room} label={room} sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              ))}
            </Tabs>
          </Box>
        </Box>
        {/* Equipment List */}
        <Box sx={{ flex: 1, overflowY: 'auto' }} ref={scrollContainerRef}>
          <Box sx={{ px: 4, py: 4, maxWidth: 1000, minWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {rooms.length === 0 ? (
              <Typography sx={{ color: '#bbb', fontSize: 14 }}>No rooms found. Please add a room first.</Typography>
            ) : (
              selectedRoomTab === 0 ? (
                // All Rooms: group by room, only show rooms with matching equipment
                rooms
                  .map(room => {
                    const roomEquipment = searchedEquipment.filter(eq => eq.location === room);
                    if (roomEquipment.length === 0) return null;
                    return (
                      <Paper key={room} elevation={1} sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: colors.containerPaper, border: `1px solid ${colors.border}`, position: 'relative' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>{room}</Typography>
                          <Tooltip title="Room options" arrow>
                            <IconButton 
                              size="small" 
                              sx={{ color: colors.iconPrimary }} 
                              onClick={(e) => handleRoomMenuClick(e, room)}
                            >
                              <MoreVertIcon sx={{ fontSize: 20 }}/>
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {roomEquipment.length === 0 ? (
                            <Typography sx={{ color: '#bbb', fontSize: 14, ml: 1 }}>No equipment in this room matches your search.</Typography>
                          ) : (
                            roomEquipment.map((eq, idx) => (
                              <Box key={eq.id} sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                p: 2, 
                                borderRadius: 2, 
                                bgcolor: '#fff', 
                                border: `1px solid ${colors.border}`,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease-in-out',
                                cursor: 'pointer',
                                '&:hover': {
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
                                  transform: 'translateY(-1px)',
                                  bgcolor: '#f8fafc'
                                }
                              }}
                              onClick={() => navigate(`/equipment/${eq.id}`)}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                  {eq.photo ? (
                                    <img src={`${API_BASE}${eq.photo}`} alt={eq.name} style={{ width: 56, height: 56, borderRadius: '8px', objectFit: 'cover' }} />
                                  ) : (
                                    <Box sx={{ width: 56, height: 56, borderRadius: '8px', bgcolor: colors.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      {/* You can put an icon here if you want */}
                                    </Box>
                                  )}
                                  <Box>
                                    <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>{eq.name}</Typography>
                                    <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
                                      Type: {eq.type} {eq.code ? `| Serial Number: ${eq.code}` : ''}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="Edit" arrow>
                                    <IconButton 
                                      size="small" 
                                      sx={{ color: colors.iconPrimary }} 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(equipment.findIndex(e => e.id === eq.id));
                                      }}>
                                      <EditIcon sx={{ fontSize: 20 }}/>
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete" arrow>
                                    <IconButton 
                                      size="small" 
                                      sx={{ color: '#e57373' }} 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(equipment.findIndex(e => e.id === eq.id));
                                      }}>
                                      <DeleteIcon sx={{ fontSize: 20 }}/>
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            ))
                          )}
                        </Box>
                      </Paper>
                    )
                  })
                  .filter(Boolean)
              ) : (
                // Single Room View
                (() => {
                  const room = rooms[selectedRoomTab - 1];
                  const roomEquipment = searchedEquipment.filter(eq => eq.location === room);
                  if (!room) return null;

                  return (
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: colors.containerPaper, border: `1px solid ${colors.border}`, position: 'relative' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>{room}</Typography>
                        <Tooltip title="Room options" arrow>
                          <IconButton 
                            size="small" 
                            sx={{ color: colors.iconPrimary }} 
                            onClick={(e) => handleRoomMenuClick(e, room)}
                          >
                            <MoreVertIcon sx={{ fontSize: 20 }}/>
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {roomEquipment.length === 0 ? (
                          <Typography sx={{ color: '#bbb', fontSize: 14, ml: 1 }}>No equipment in this room matches your search.</Typography>
                        ) : (
                          roomEquipment.map((eq, idx) => (
                            <Box key={eq.id} sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              p: 2, 
                              borderRadius: 2, 
                              bgcolor: '#fff', 
                              border: `1px solid ${colors.border}`,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                              transition: 'all 0.2s ease-in-out',
                              cursor: 'pointer',
                              '&:hover': {
                                boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
                                transform: 'translateY(-1px)',
                                bgcolor: '#f8fafc'
                              }
                            }}
                            onClick={() => navigate(`/equipment/${eq.id}`)}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                {eq.photo ? (
                                  <img src={`${API_BASE}${eq.photo}`} alt={eq.name} style={{ width: 56, height: 56, borderRadius: '8px', objectFit: 'cover' }} />
                                ) : (
                                                                      <Box sx={{ width: 56, height: 56, borderRadius: '8px', bgcolor: colors.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {/* You can put an icon here if you want */}
                                  </Box>
                                )}
                                <Box>
                                  <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>{eq.name}</Typography>
                                  <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
                                    Type: {eq.type} {eq.code ? `| Serial Number: ${eq.code}` : ''}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit" arrow>
                                  <IconButton 
                                    size="small" 
                                                                          sx={{ color: colors.iconPrimary }} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(equipment.findIndex(e => e.id === eq.id));
                                    }}>
                                    <EditIcon sx={{ fontSize: 20 }}/>
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#e57373' }} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(equipment.findIndex(e => e.id === eq.id));
                                    }}>
                                    <DeleteIcon sx={{ fontSize: 20 }}/>
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          ))
                        )}
                      </Box>
                    </Paper>
                  );
                })()
              )
            )}
          </Box>
        </Box>
        {/* Dialogs and Snackbars */}
        <Dialog open={dialogOpen} onClose={handleDialogClose} PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 420 } }}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>{editIndex !== null ? 'Edit Equipment' : 'Add Equipment'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={newEquipment.name}
              onChange={e => setNewEquipment(s => ({ ...s, name: e.target.value }))}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
            />
            <TextField
              label="Type"
              value={newEquipment.type}
              onChange={e => setNewEquipment(s => ({ ...s, type: e.target.value }))}
              select
              fullWidth
              size="small"
            >
              {equipmentTypes.map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Serial Number (optional)"
              value={newEquipment.code}
              onChange={e => setNewEquipment(s => ({ ...s, code: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Location (Room)"
              value={newEquipment.location}
              onChange={e => setNewEquipment(s => ({ ...s, location: e.target.value }))}
              select
              fullWidth
              size="small"
              disabled={rooms.length === 0}
              error={rooms.length === 0}
              helperText={rooms.length === 0 ? 'No rooms available. Please add a room first.' : ''}
            >
              {rooms.map(room => (
                <MenuItem key={room} value={room}>{room}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Purchase Price (optional)"
              value={newEquipment.purchasePrice}
              onChange={e => {
                const value = e.target.value;
                // Allow only numbers, decimal point, and $ symbol
                let cleanValue = value.replace(/[^0-9.$]/g, '');
                
                // Handle $ symbol - only allow at the beginning
                const hasAtStart = cleanValue.startsWith('$');
                cleanValue = cleanValue.replace(/\$/g, '');
                if (hasAtStart) cleanValue = '$' + cleanValue;
                
                // Ensure only one decimal point
                const parts = cleanValue.replace('$', '').split('.');
                if (parts.length > 2) {
                  cleanValue = (hasAtStart ? '$' : '') + parts[0] + '.' + parts.slice(1).join('');
                }
                
                setNewEquipment(s => ({ ...s, purchasePrice: cleanValue }));
              }}
              onFocus={e => {
                if (!e.target.value) {
                  setNewEquipment(s => ({ ...s, purchasePrice: '$' }));
                }
              }}
              onBlur={e => {
                if (e.target.value === '$') {
                  setNewEquipment(s => ({ ...s, purchasePrice: '' }));
                }
              }}
              fullWidth
              size="small"
              inputProps={{ 
                inputMode: 'decimal',
                pattern: '[0-9]*'
              }}
            />
            
            {/* Lesson Linking Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 14, fontFamily: 'Montserrat, sans-serif' }}>
                Related Lesson:
              </Typography>
              {selectedLesson ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                    {selectedLesson}
                  </Typography>
                  <Tooltip title="Remove Lesson" arrow>
                    <IconButton 
                      size="small" 
                      sx={{ color: '#9ca3af', ml: 0.5, '&:hover': { color: '#ef4444' } }} 
                      onClick={() => setSelectedLesson(null)}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Button 
                  startIcon={<LinkIcon sx={{ fontSize: 16 }}/>} 
                  onClick={() => setLinkLessonDialogOpen(true)}
                  sx={{ ...buttonStyles.primary, py: 0.2, px: 1, fontSize: 13, textTransform: 'none', fontWeight: 600 }}
                >
                  Link a Lesson
                </Button>
              )}
            </Box>
            
            {fieldError && <Typography sx={{ color: 'error.main', fontSize: 13 }}>{fieldError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button {...buttonStyles.primary} onClick={handleAddEditEquipment}>
              {editIndex !== null ? 'Save Changes' : 'Add Equipment'}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Add Room Dialog */}
        <Dialog open={roomDialogOpen} onClose={() => setRoomDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Add Room</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Room Name"
              value={newRoom}
              onChange={e => setNewRoom(e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
            />
            {roomError && <Typography sx={{ color: 'error.main', fontSize: 13 }}>{roomError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.primary} onClick={handleAddRoom}>
              Add Room
            </Button>
          </DialogActions>
        </Dialog>
        {/* Download Equipment Dialog */}
        <Dialog open={downloadDialogOpen} onClose={() => setDownloadDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
            Select Rooms to Download
          </DialogTitle>
          <DialogContent sx={{ pb: 2 }}>
            <Typography sx={{ mb: 3, fontSize: 16, color: '#6b7280' }}>
              Choose which rooms to include in the equipment inventory export:
            </Typography>
            
            {/* Select All Option */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                cursor: 'pointer',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
              }}
              onClick={handleSelectAllRooms}
            >
              <Checkbox
                checked={selectedRoomsForDownload.length === rooms.length && rooms.length > 0}
                indeterminate={selectedRoomsForDownload.length > 0 && selectedRoomsForDownload.length < rooms.length}
                onChange={handleSelectAllRooms}
                sx={{ mr: 1 }}
              />
              <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#374151' }}>
                Select All Rooms
              </Typography>
            </Box>

            {/* Individual Room Options */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {rooms.map((room) => (
                <Box 
                  key={room}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                  onClick={() => handleRoomToggle(room)}
                >
                  <Checkbox
                    checked={selectedRoomsForDownload.includes(room)}
                    onChange={() => handleRoomToggle(room)}
                    sx={{ mr: 1 }}
                  />
                  <Typography sx={{ fontSize: 16, color: '#374151' }}>
                    {room}
                  </Typography>
                  <Typography sx={{ ml: 'auto', fontSize: 14, color: '#6b7280' }}>
                    ({equipment.filter(eq => eq.location === room).length} items)
                  </Typography>
                </Box>
              ))}
            </Box>

            {rooms.length === 0 && (
              <Typography sx={{ textAlign: 'center', color: '#6b7280', fontSize: 16, py: 4 }}>
                No rooms available. Please add some rooms first.
              </Typography>
            )}


          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setDownloadDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              {...buttonStyles.primary} 
              onClick={exportEquipmentToExcel}
              disabled={selectedRoomsForDownload.length === 0}
            >
              Download Excel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Delete Equipment</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
              Are you sure you want to delete this equipment?
            </Typography>
            {equipmentToDelete && (
              <Typography sx={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>
                Equipment: {equipmentToDelete.name} ({equipmentToDelete.type})
              </Typography>
            )}
            <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.danger} onClick={handleDeleteConfirmation}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        {/* Room Menu */}
        <Menu
          anchorEl={roomMenuAnchorEl}
          open={roomMenuOpen}
          onClose={handleRoomMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleEditRoom}>
            <EditIcon sx={{ fontSize: 16, mr: 1, color: colors.iconPrimary }} />
            Edit Room
          </MenuItem>
          <MenuItem onClick={handleDeleteRoom}>
            <DeleteIcon sx={{ fontSize: 16, mr: 1, color: '#e57373' }} />
            Delete Room
          </MenuItem>
        </Menu>

        {/* Edit Room Dialog */}
        <Dialog open={editRoomDialogOpen} onClose={() => setEditRoomDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Edit Room</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Room Name"
              value={editingRoom}
              onChange={e => setEditingRoom(e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
            />
            {editRoomError && <Typography sx={{ color: 'error.main', fontSize: 13 }}>{editRoomError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setEditRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.primary} onClick={handleSaveEditRoom}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Room Confirmation Dialog */}
        <Dialog open={deleteRoomDialogOpen} onClose={() => setDeleteRoomDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Delete Room</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
              Are you sure you want to delete this room?
            </Typography>
            {roomToDelete && (
              <Typography sx={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>
                Room: {roomToDelete}
              </Typography>
            )}
            <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setDeleteRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.danger} onClick={handleConfirmDeleteRoom}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Link Lesson Dialog */}
        <Dialog open={linkLessonDialogOpen} onClose={() => setLinkLessonDialogOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { maxWidth: 600, width: 600, height: 800 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Select Lesson</DialogTitle>
          <DialogContent sx={{ p: 0, height: '100%' }}>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fff', px: 3, pt: 1, pb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search lessons"
                value={lessonSearch}
                onChange={e => setLessonSearch(e.target.value)}
                size="small"
              />
              <Tabs
                value={lessonDialogTab}
                onChange={(_, newValue) => setLessonDialogTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { fontFamily: 'Montserrat, sans-serif', textTransform: 'none', fontSize: 14, minWidth: 100 }, mt: 2 }}
              >
                <Tab label="Industrial" />
                <Tab label="Kitchen" />
                <Tab label="Textiles" />
                <Tab label="Maintenance" />
              </Tabs>
            </Box>
            <Box sx={{ overflowY: 'auto', maxHeight: 670, p: 3, pt: 2 }}>
              {/* Group and filter lessons by area and subArea */}
              {(() => {
                let area = '';
                if (lessonDialogTab === 0) area = 'Industrial';
                if (lessonDialogTab === 1) area = 'Kitchen';
                if (lessonDialogTab === 2) area = 'Textiles';
                if (lessonDialogTab === 3) area = 'Maintenance';
                
                // If there's a search term, search across all areas
                // If no search term, only show lessons from the selected tab
                const filteredLessons = lessons.filter(lesson => {
                  const matchesSearch = lesson.name.toLowerCase().includes(lessonSearch.toLowerCase());
                  if (lessonSearch.trim()) {
                    // When searching, show lessons from all areas that match the search
                    return matchesSearch;
                  } else {
                    // When not searching, only show lessons from the selected tab
                    return lesson.area === area && matchesSearch;
                  }
                });
                // Group by subArea
                const grouped = filteredLessons.reduce((acc, lesson) => {
                  const sub = lesson.subArea || 'Other';
                  if (!acc[sub]) acc[sub] = [];
                  acc[sub].push(lesson);
                  return acc;
                }, {} as Record<string, typeof lessons>);
                // Sort lessons within each group
                Object.keys(grouped).forEach(subArea => {
                  grouped[subArea] = sortLessonsByPageOrder(grouped[subArea].map(l => l.name), lessons).map(lessonName => lessons.find(l => l.name === lessonName)).filter(Boolean) as typeof lessons;
                });
                // Sort sub-areas for Industrial
                const industrialSubAreas = [
                  'Workshop Safety', 'Multiuse Workshop Equipment', 'Metalworking', 'Woodworking', 'Painting & Finishing', 'Heating & Forming'
                ];
                const sortedSubAreas = Object.keys(grouped).sort((a, b) => {
                  if (area === 'Industrial') {
                    const indexA = industrialSubAreas.indexOf(a);
                    const indexB = industrialSubAreas.indexOf(b);
                    if (a === 'Other') return 1;
                    if (b === 'Other') return -1;
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA === -1 && indexB === -1) return 0;
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                  }
                  return a.localeCompare(b);
                });
                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {sortedSubAreas.map(sub => (
                      <Box key={sub}>
                        <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: 15, mb: 1 }}>{sub}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {grouped[sub].map((lesson: any) => (
                            <Box key={lesson.id || lesson.name} sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }, cursor: 'pointer' }}
                              onClick={() => setSelectedLesson(lesson.name)}
                            >
                              <Radio
                                checked={selectedLesson === lesson.name}
                                onChange={() => setSelectedLesson(lesson.name)}
                                onClick={e => e.stopPropagation()}
                                color="primary"
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ color: colors.iconPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                  {lessonIcons[lesson.icon]}
                                </Box>
                                <Box>
                                  <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{lesson.name}</Typography>
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                );
              })()}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLinkLessonDialogOpen(false)} {...buttonStyles.cancel}>Cancel</Button>
            <Button
              onClick={() => {
                setLinkLessonDialogOpen(false);
                setLessonSearch('');
              }}
              {...buttonStyles.primary}
              disabled={!selectedLesson}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage || 'Success!'}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
} 