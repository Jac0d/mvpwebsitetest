import React from 'react';
import { Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, InputAdornment, Snackbar, Alert, Tabs, Tab, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { buttonStyles } from '../../styles/buttonStyles';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  code: string;
  location: string;
  photo?: string;
}

const equipmentTypes = ['Tool', 'Machine', 'PPE', 'Material', 'Other'];

const API_BASE = 'http://localhost:3001';

export default function EquipmentPage() {
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
  });
  const [fieldError, setFieldError] = React.useState('');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [rooms, setRooms] = React.useState<string[]>([]);
  const [roomDialogOpen, setRoomDialogOpen] = React.useState(false);
  const [newRoom, setNewRoom] = React.useState('');
  const [roomError, setRoomError] = React.useState('');
  const [selectedRoomTab, setSelectedRoomTab] = React.useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = React.useState<Equipment | null>(null);

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

  const handleAddEditEquipment = () => {
    setFieldError('');
    const { name, type, code, location } = newEquipment;
    if (!name.trim() || !type || !location.trim()) {
      setFieldError('All fields except Serial Number are required.');
      return;
    }
    if (editIndex !== null) {
      // Edit
      const updated = equipment.map((eq, idx) => idx === editIndex ? { ...eq, ...newEquipment } : eq);
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
      const newEq = { ...newEquipment, id: generateEquipmentId(newEquipment.name, newEquipment.location) };
      const updated = [...equipment, newEq];
      setEquipment(updated);
      fetch(`${API_BASE}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipment: updated })
      }).then(() => {
        window.location.reload();
      });
    }
    setDialogOpen(false);
    setNewEquipment({ name: '', type: '', code: '', location: '' });
    setEditIndex(null);
    setSnackbarOpen(true);
  };

  const handleEditClick = (idx: number) => {
    setEditIndex(idx);
    setNewEquipment({ ...equipment[idx] });
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
    setNewEquipment({ name: '', type: '', code: '', location: '' });
    setEditIndex(null);
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
        .then(() => setSnackbarOpen(true));
    }
    setDeleteDialogOpen(false);
    setEquipmentToDelete(null);
  };

  return (
    <Layout
      title="Equipment"
      breadcrumbs={[
        <Typography key="equipment" color="text.primary" sx={{ fontWeight: 600, fontSize: 18 }}>Equipment</Typography>
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 240, right: 0, zIndex: 1099 }}>
        {/* Search, Add Equipment, Add Room */}
        <Box sx={{ bgcolor: '#fff', pt: 3, pb: 1 }}>
          <Box sx={{ maxWidth: 1000, minWidth: 360, mx: 'auto', px: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search equipment..."
              size="small"
              sx={{ flex: 1, minWidth: 180, bgcolor: '#fff', borderRadius: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#b0b0b0' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              {...buttonStyles.primary}
              startIcon={<AddIcon />}
              onClick={() => { setDialogOpen(true); setEditIndex(null); setNewEquipment({ name: '', type: '', code: '', location: '' }); setFieldError(''); }}
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
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e7ff', pt: 1, pb: 0.5 }}>
          <Box sx={{ maxWidth: 1000, minWidth: 360, mx: 'auto', px: 8, width: '100%' }}>
            <Tabs value={selectedRoomTab} onChange={(_, v) => setSelectedRoomTab(v)} textColor="primary" indicatorColor="primary" variant="scrollable" scrollButtons="auto">
              <Tab label="All Rooms" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', fontSize: 16, textTransform: 'none' }} />
              {rooms.map((room, i) => (
                <Tab key={room} label={room} sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', fontSize: 16, textTransform: 'none' }} />
              ))}
            </Tabs>
          </Box>
        </Box>
        {/* Equipment List */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Box sx={{ px: 4, py: 4, maxWidth: 1000, minWidth: 540, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                      <Paper key={room} elevation={1} sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: '#f8fafc', border: '1px solid #e0e7ff' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>{room}</Typography>
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
                                border: '1px solid #e0e7ff',
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
                                    <Box sx={{ width: 56, height: 56, borderRadius: '8px', bgcolor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
                                      sx={{ color: '#9ca3af' }} 
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
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: '#f8fafc', border: '1px solid #e0e7ff' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>{room}</Typography>
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
                              border: '1px solid #e0e7ff',
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
                                  <Box sx={{ width: 56, height: 56, borderRadius: '8px', bgcolor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
                                    sx={{ color: '#9ca3af' }} 
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
        <Snackbar open={snackbarOpen} autoHideDuration={2500} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
            Success!
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
} 