import React, { useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Tooltip, IconButton, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, InputAdornment } from '@mui/material';
import { Layout } from '../../components/layout/Layout';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import * as XLSX from 'xlsx';
import DownloadIcon from '@mui/icons-material/Download';
import { buttonStyles } from '../../styles/buttonStyles';

// Staff type
export interface Staff {
  id: number;
  name: string;
  role: string;
  userID: string;
}

const staffRoles = ['Teaching Staff', 'Support Staff', 'Maintenance Staff'];

const API_BASE = 'http://localhost:3001';

export default function StaffPage() {
  const [tab, setTab] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<Staff | null>(null);
  const [newStaff, setNewStaff] = React.useState({
    firstName: '',
    surname: '',
    role: '',
    userID: '',
  });
  const [editStaff, setEditStaff] = React.useState<{
    id: number | null;
    firstName: string;
    surname: string;
    role: string;
    userID: string;
  }>({
    id: null,
    firstName: '',
    surname: '',
    role: '',
    userID: '',
  });
  const [fieldError, setFieldError] = React.useState('');
  const [editFieldError, setEditFieldError] = React.useState('');
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false);
  const [bulkError, setBulkError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [bulkSuccessDialogOpen, setBulkSuccessDialogOpen] = React.useState(false);
  const [bulkResults, setBulkResults] = React.useState<{
    successful: number;
    duplicates: string[];
    formatErrors: string[];
    totalProcessed: number;
  }>({
    successful: 0,
    duplicates: [],
    formatErrors: [],
    totalProcessed: 0
  });
  const [archiveError, setArchiveError] = React.useState('');
  const [userIDManuallyEdited, setUserIDManuallyEdited] = React.useState(false);

  // Group staff by role, sorted by surname
  const staffByRole = staffRoles.map(role => ({
    role,
    staff: staff
      .filter(s => s.role === role && (
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.userID.toLowerCase().includes(search.toLowerCase())
      ))
      .sort((a, b) => {
        const aSurname = a.name.split(' ').slice(-1)[0].toLowerCase();
        const bSurname = b.name.split(' ').slice(-1)[0].toLowerCase();
        return aSurname.localeCompare(bSurname);
      })
  }));

  // Fetch staff on mount
  useEffect(() => {
    fetch(`${API_BASE}/staff`)
      .then(res => res.json())
      .then(data => setStaff(data));
  }, []);

  // Update User ID automatically unless manually edited
  useEffect(() => {
    if (!userIDManuallyEdited) {
      const first = newStaff.firstName.trim().toLowerCase().replace(/\s+/g, '');
      const last = newStaff.surname.trim().toLowerCase().replace(/\s+/g, '');
      if (first && last) {
        setNewStaff(s => ({ ...s, userID: `${first}.${last}` }));
      } else {
        setNewStaff(s => ({ ...s, userID: '' }));
      }
    }
    // Only run when firstName or surname changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newStaff.firstName, newStaff.surname]);

  const handleAddStaff = () => {
    setFieldError('');
    const { firstName, surname, role, userID } = newStaff;
    if (!firstName.trim() || !surname.trim() || !role || !userID.trim()) {
      setFieldError('All fields are required.');
      return;
    }
    if (staff.some(s => s.userID.trim().toLowerCase() === userID.trim().toLowerCase())) {
      setFieldError('A staff member with this User ID already exists.');
      return;
    }
    const name = `${firstName.trim()} ${surname.trim()}`;
    const newStaffObj = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      name,
      role,
      userID: userID.trim(),
    };
    // POST to backend
    fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff: [newStaffObj] }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          fetch(`${API_BASE}/staff`)
            .then(res => res.json())
            .then(data => setStaff(data));
          setAddDialogOpen(false);
          setNewStaff({ firstName: '', surname: '', role: '', userID: '' });
          setUserIDManuallyEdited(false);
          setFieldError('');
        } else {
          setFieldError('Failed to add staff member.');
        }
      });
  };

  const handleEditClick = (staffMember: Staff) => {
    const [firstName, ...surnameParts] = staffMember.name.split(' ');
    setEditStaff({
      id: staffMember.id,
      firstName,
      surname: surnameParts.join(' '),
      role: staffMember.role,
      userID: staffMember.userID,
    });
    setEditFieldError('');
    setEditDialogOpen(true);
  };

  const handleEditStaff = () => {
    setEditFieldError('');
    const { id, firstName, surname, role, userID } = editStaff;
    if (!firstName.trim() || !surname.trim() || !role || !userID.trim()) {
      setEditFieldError('All fields are required.');
      return;
    }
    if (!/^[a-z]+\.[a-z]+$/.test(userID.trim())) {
      setEditFieldError('User ID must be in the format firstname.lastname (all lowercase, no spaces).');
      return;
    }
    if (staff.some(s => s.userID.trim().toLowerCase() === userID.trim().toLowerCase() && s.id !== id)) {
      setEditFieldError('A staff member with this User ID already exists.');
      return;
    }
    const name = `${firstName.trim()} ${surname.trim()}`;
    setStaff(prev => prev.map(s => s.id === id ? { ...s, name, role, userID: userID.trim() } : s));
    setEditDialogOpen(false);
  };

  const handleArchiveClick = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setArchiveDialogOpen(true);
  };

  const handleArchiveStaff = () => {
    if (selectedStaff) {
      setArchiveError('');
      fetch(`${API_BASE}/staff/${selectedStaff.id}`, {
        method: 'DELETE',
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            fetch(`${API_BASE}/staff`)
              .then(res => res.json())
              .then(data => setStaff(data));
            setArchiveDialogOpen(false);
            setSelectedStaff(null);
            setArchiveError('');
          } else {
            if (result.message && result.message.includes('assigned to a class')) {
              setArchiveError('Cannot delete staff member: They are an active teacher or participant in a class. Remove them from all classes first.');
            } else {
              setArchiveError('Failed to delete staff member.');
            }
          }
        })
        .catch(() => {
          setArchiveError('Failed to delete staff member.');
        });
    }
  };

  const handleBulkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkError('');
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    // Don't process the file immediately, just store it for later upload
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Check if it's a valid file type
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (validTypes.includes(fileExtension)) {
        setSelectedFile(file);
        setBulkError('');
      } else {
        setBulkError('Please select a valid file type (.csv, .xlsx, or .xls)');
      }
    }
  };

  const handleBulkUpload = () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setBulkError('');
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) {
        setIsUploading(false);
        return;
      }
      
      try {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        let added = 0;
        let skipped = 0;
        let duplicates: string[] = [];
        let formatErrors: string[] = [];
        const newStaffList: Staff[] = [];
        
        rows.forEach((row, i) => {
          const firstName = row['First Name']?.toString().trim();
          const surname = row['Surname']?.toString().trim();
          const userID = row['User ID']?.toString().trim();
          const role = row['Staff Role']?.toString().trim();
          
          if (!firstName || !surname || !userID || !role) {
            const errorMsg = `Row ${i + 2}: Missing required field(s).`;
            formatErrors.push(errorMsg);
            skipped++;
            return;
          }
          
          if (!/^[a-z]+\.[a-z]+$/.test(userID)) {
            const errorMsg = `Row ${i + 2}: User ID must be in the format firstname.lastname (all lowercase, no spaces).`;
            formatErrors.push(errorMsg);
            skipped++;
            return;
          }
          
          // Check for duplicates but still allow upload
          if (staff.some(s => s.userID.trim().toLowerCase() === userID.toLowerCase()) || newStaffList.some(s => s.userID.trim().toLowerCase() === userID.toLowerCase())) {
            duplicates.push(`${firstName} ${surname} (${userID})`);
            skipped++;
            return;
          }
          
          newStaffList.push({
            id: Date.now() + added + i, // unique id
            name: `${firstName} ${surname}`,
            role,
            userID,
          });
          added++;
        });
        
        // Only proceed with upload if there are valid staff to add
        if (newStaffList.length === 0) {
          setIsUploading(false);
          setBulkError('No valid staff members found to upload. Please check your file format.');
          return;
        }
        
        // POST to backend
        fetch(`${API_BASE}/staff`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ staff: newStaffList }),
        })
          .then(res => res.json())
          .then(result => {
            setIsUploading(false);
            if (result.success) {
              fetch(`${API_BASE}/staff`)
                .then(res => res.json())
                .then(data => setStaff(data));
              setBulkDialogOpen(false);
              setBulkResults({
                successful: added,
                duplicates: duplicates,
                formatErrors: formatErrors,
                totalProcessed: added + skipped
              });
              setBulkSuccessDialogOpen(true);
              // Reset file selection
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            } else {
              setBulkError('Upload failed. Please try again.');
            }
          })
          .catch(() => {
            setIsUploading(false);
            setBulkError('Upload failed. Please check your connection and try again.');
          });
      } catch (err) {
        setIsUploading(false);
        setBulkError('Failed to parse file. Please ensure it is a valid Excel file.');
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['INSTRUCTIONS: Please enter one of: Teaching Staff, Support Staff, Maintenance Staff in the Staff Role column.'],
      ['First Name', 'Surname', 'User ID', 'Staff Role'],
      ['', '', '', 'Teaching Staff'],
      ['', '', '', 'Support Staff'],
      ['', '', '', 'Maintenance Staff'],
    ]);
    // Add data validation for Staff Role column (Excel validation, no dropdown) for D3:D100
    if (!ws['!dataValidation']) ws['!dataValidation'] = [];
    for (let i = 3; i <= 100; i++) {
      ws['!dataValidation'].push({
        sqref: `D${i}`,
        type: 'list',
        formulas: ['"Teaching Staff,Support Staff,Maintenance Staff"'],
        allowBlank: true,
        showInputMessage: true,
        showErrorMessage: true,
        errorTitle: 'Invalid Role',
        error: 'Please enter exactly: Teaching Staff, Support Staff, or Maintenance Staff.'
      });
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Staff');
    XLSX.writeFile(wb, 'staff_bulk_upload_template.xlsx');
  };

  return (
    <Layout
      title="Staff"
      breadcrumbs={[
        <Typography key="staff" color="text.primary" sx={{ fontWeight: 600, fontSize: 18 }}>Staff</Typography>
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 240, right: 0, zIndex: 1099 }}>
      {/* Search and Add Staff */}
        <Box sx={{ bgcolor: '#fff', pt: 3, pb: 1 }}>
          <Box sx={{ maxWidth: 1000, minWidth: 360, mx: 'auto', px: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search staff..."
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
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              {...buttonStyles.primary}
            >
              Add Staff
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => setBulkDialogOpen(true)}
              {...buttonStyles.primary}
            >
              Bulk Upload
            </Button>
          </Box>
        </Box>
        {/* Tabs */}
        <Box sx={{ position: 'sticky', top: 0, bgcolor: '#fff', zIndex: 1, borderBottom: '1px solid #e0e7ff', pt: 1, pb: 0.5 }}>
          <Box sx={{ maxWidth: 1000, minWidth: 360, mx: 'auto', px: 8, width: '100%' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary" variant="scrollable" scrollButtons="auto">
              <Tab label="All Staff" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              {staffRoles.map((r, i) => (
                <Tab key={r} label={r} sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              ))}
            </Tabs>
          </Box>
        </Box>
        {/* Content */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Box sx={{ px: 4, py: 4, maxWidth: 1000, minWidth: 540, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {tab === 0 && (
              <>
                {staffByRole.filter(group => group.staff.length > 0).map(group => (
                  <Paper key={group.role} elevation={1} sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: '#f8fafc', border: '1px solid #e0e7ff' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>{group.role}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {group.staff.map(staffMember => (
                        <Box
                          key={staffMember.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: '#fff',
                            border: '1px solid #e0e7ff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>{staffMember.name}</Typography>
                            <Typography sx={{ fontSize: 13, color: '#888' }}>
                              User ID: {staffMember.userID}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Reset staff password" arrow>
                              <IconButton size="small" sx={{ color: '#4ecdc4' }}>
                                <LockResetIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit staff details" arrow>
                              <IconButton size="small" sx={{ color: '#4ecdc4' }} onClick={() => handleEditClick(staffMember)}>
                                <EditIcon color="inherit" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove / archive staff" arrow>
                              <IconButton size="small" sx={{ color: '#e57373' }} onClick={() => handleArchiveClick(staffMember)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                ))}
              </>
            )}
            {tab > 0 && (
              <>
                {staffByRole[tab - 1].staff.length > 0 ? (
                  <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: '#f8fafc', border: '1px solid #e0e7ff' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>{staffByRole[tab - 1].role}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {staffByRole[tab - 1].staff.map(staffMember => (
                        <Box
                          key={staffMember.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: '#fff',
                            border: '1px solid #e0e7ff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>{staffMember.name}</Typography>
                            <Typography sx={{ fontSize: 13, color: '#888' }}>
                              User ID: {staffMember.userID}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Reset staff password" arrow>
                              <IconButton size="small" sx={{ color: '#4ecdc4' }}>
                                <LockResetIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit staff details" arrow>
                              <IconButton size="small" sx={{ color: '#4ecdc4' }} onClick={() => handleEditClick(staffMember)}>
                                <EditIcon color="inherit" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove / archive staff" arrow>
                              <IconButton size="small" sx={{ color: '#e57373' }} onClick={() => handleArchiveClick(staffMember)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                ) : (
                  <Typography sx={{ color: '#bbb', fontSize: 14 }}>No staff in this role.</Typography>
                )}
              </>
            )}
          </Box>
        </Box>
        {/* Add Staff Dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Add Staff</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="First Name"
              value={newStaff.firstName}
              onChange={e => {
                setNewStaff(s => ({ ...s, firstName: e.target.value }));
                setUserIDManuallyEdited(false);
              }}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
            />
            <TextField
              label="Surname"
              value={newStaff.surname}
              onChange={e => {
                setNewStaff(s => ({ ...s, surname: e.target.value }));
                setUserIDManuallyEdited(false);
              }}
              fullWidth
              size="small"
            />
            <TextField
              label="User ID"
              value={newStaff.userID}
              onChange={e => {
                setNewStaff(s => ({ ...s, userID: e.target.value }));
                setUserIDManuallyEdited(true);
              }}
              fullWidth
              size="small"
            />
            <TextField
              label="Staff Role"
              value={newStaff.role}
              onChange={e => setNewStaff(s => ({ ...s, role: e.target.value }))}
              select
              fullWidth
              size="small"
            >
              {staffRoles.map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            {fieldError && <Typography sx={{ color: 'error.main', fontSize: 13 }}>{fieldError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button
              onClick={() => setAddDialogOpen(false)}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStaff}
              {...buttonStyles.primary}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
        {/* Edit Staff Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Edit Staff</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="First Name"
              value={editStaff.firstName}
              onChange={e => setEditStaff(s => ({ ...s, firstName: e.target.value }))}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
            />
            <TextField
              label="Surname"
              value={editStaff.surname}
              onChange={e => setEditStaff(s => ({ ...s, surname: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="User ID"
              value={editStaff.userID}
              onChange={e => setEditStaff(s => ({ ...s, userID: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Staff Role"
              value={editStaff.role}
              onChange={e => setEditStaff(s => ({ ...s, role: e.target.value }))}
              select
              fullWidth
              size="small"
            >
              {staffRoles.map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            {editFieldError && <Typography sx={{ color: 'error.main', fontSize: 13 }}>{editFieldError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button
              onClick={() => setEditDialogOpen(false)}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditStaff}
              {...buttonStyles.primary}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
        {/* Archive/Remove Staff Dialog */}
        <Dialog open={archiveDialogOpen} onClose={() => { setArchiveDialogOpen(false); setArchiveError(''); }} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Archive/Remove Staff</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography>Are you sure you want to archive/remove <b>{selectedStaff?.name}</b>?</Typography>
            {archiveError && <Typography sx={{ color: 'error.main', fontSize: 13, mt: 2 }}>{archiveError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button
              onClick={() => { setArchiveDialogOpen(false); setArchiveError(''); }}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleArchiveStaff}
              {...buttonStyles.danger}
            >
              Archive
            </Button>
          </DialogActions>
        </Dialog>
        {/* Bulk Upload Dialog */}
        <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Bulk Upload Staff</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#374151' }}>
              Upload a CSV or Excel file to add multiple staff members at once.
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#888', fontFamily: 'Montserrat, sans-serif' }}>
              Ensure the file contains columns for First Name, Surname, User ID, and Staff Role.
            </Typography>
            
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              variant="outlined"
              sx={{
                borderColor: '#4ecdc4',
                color: '#4ecdc4',
                '&:hover': {
                  borderColor: '#45b7aa',
                  backgroundColor: 'rgba(78, 205, 196, 0.04)'
                }
              }}
            >
              Download Excel Template
            </Button>
            
            <Box sx={{ 
              border: '2px dashed #e0e7ff', 
              borderRadius: 2, 
              p: 3, 
              textAlign: 'center',
              bgcolor: selectedFile ? '#f0f9ff' : isDragOver ? '#e8f5e8' : '#f8fafc',
              borderColor: selectedFile ? '#4ecdc4' : isDragOver ? '#4caf50' : '#e0e7ff',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                borderColor: selectedFile ? '#45b7aa' : '#4ecdc4',
                bgcolor: selectedFile ? '#f0f9ff' : '#f0f9ff'
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#4ecdc4', mb: 1 }}>
                  File Selected
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#374151', mb: 2 }}>
                  {selectedFile.name}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  sx={{ color: '#e57373', borderColor: '#e57373' }}
                >
                  Remove File
                </Button>
              </Box>
            ) : isDragOver ? (
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#4caf50', mb: 1 }}>
                  Drop your file here
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#2e7d32' }}>
                  Release to upload your Excel or CSV file
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151', mb: 1 }}>
                  No file selected
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#888', mb: 2 }}>
                  Click to select or drag and drop your Excel or CSV file here
                </Typography>
              </Box>
            )}
          </Box>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleBulkFile}
          />
          
          {bulkError && (
            <Typography sx={{ color: 'error.main', fontSize: 13, bgcolor: '#ffebee', p: 2, borderRadius: 1 }}>
              {bulkError}
            </Typography>
          )}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button
              onClick={() => {
                setBulkDialogOpen(false);
                setSelectedFile(null);
                setBulkError('');
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
            {!selectedFile ? (
              <Button
                onClick={() => fileInputRef.current?.click()}
                {...buttonStyles.primary}
              >
                Add File
              </Button>
            ) : (
              <Button
                onClick={handleBulkUpload}
                disabled={isUploading}
                {...buttonStyles.primary}
              >
                {isUploading ? 'Uploading...' : 'Upload File'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Bulk Upload Success Dialog */}
        <Dialog open={bulkSuccessDialogOpen} onClose={() => setBulkSuccessDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24, color: '#2e7d32' }}>
            Bulk Upload Results
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Summary */}
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e0e7ff' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#374151', mb: 1 }}>
                Summary
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#374151', fontFamily: 'Montserrat, sans-serif' }}>
                • Total rows processed: {bulkResults.totalProcessed}
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#2e7d32', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                • Successfully added: {bulkResults.successful} staff members
              </Typography>
              {bulkResults.duplicates.length > 0 && (
                <Typography sx={{ fontSize: 14, color: '#f57c00', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                  • Duplicates skipped: {bulkResults.duplicates.length} staff members
                </Typography>
              )}
              {bulkResults.formatErrors.length > 0 && (
                <Typography sx={{ fontSize: 14, color: '#d32f2f', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                  • Format errors: {bulkResults.formatErrors.length} rows
                </Typography>
              )}
            </Box>

            {/* Duplicates Section */}
            {bulkResults.duplicates.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#f57c00', mb: 1 }}>
                  Duplicate Staff Members (Skipped)
                </Typography>
                <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 2, border: '1px solid #ffb74d', maxHeight: 150, overflowY: 'auto' }}>
                  {bulkResults.duplicates.map((duplicate, index) => (
                    <Typography key={index} sx={{ fontSize: 13, color: '#e65100', fontFamily: 'Montserrat, sans-serif', mb: 0.5 }}>
                      • {duplicate}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {/* Format Errors Section */}
            {bulkResults.formatErrors.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#d32f2f', mb: 1 }}>
                  Format Errors
                </Typography>
                <Box sx={{ bgcolor: '#ffebee', p: 2, borderRadius: 2, border: '1px solid #ef5350', maxHeight: 150, overflowY: 'auto' }}>
                  {bulkResults.formatErrors.map((error, index) => (
                    <Typography key={index} sx={{ fontSize: 13, color: '#c62828', fontFamily: 'Montserrat, sans-serif', mb: 0.5 }}>
                      • {error}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button
              onClick={() => setBulkSuccessDialogOpen(false)}
              {...buttonStyles.primary}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
} 