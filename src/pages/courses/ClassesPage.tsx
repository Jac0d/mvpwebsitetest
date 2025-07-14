import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Paper, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, OutlinedInput, Select, Checkbox, ListItemText } from '@mui/material';
import { Layout } from '../../components/layout/Layout';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { buttonStyles } from '../../styles/buttonStyles';

const yearLevels = [7, 8, 9, 10, 11, 12];

const pastelColors = [
  '#ffe4ec', // light pink
  '#e0f7fa', // light cyan
  '#eaf7e0', // light green
  '#fff9e0', // light yellow
  '#e0e7ff', // light blue
  '#f3e0ff', // light purple
  '#ffeede', // light orange
  '#e0fff4', // light teal
];

// Utility to darken a hex color
function darken(hex: string, amount = 0.12) {
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

interface ClassesPageProps {
  classes: any[];
  setClasses: React.Dispatch<React.SetStateAction<any[]>>;
  staff: any[];
}

export function ClassesPage({ classes, setClasses, staff }: ClassesPageProps) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuClassId, setMenuClassId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedYears, setSelectedYears] = React.useState<(number | string)[]>([]);
  const [className, setClassName] = React.useState('');
  const [classCode, setClassCode] = React.useState(''); // will be auto-generated
  const [room, setRoom] = React.useState('');
  const [selectedTeachers, setSelectedTeachers] = React.useState<string[]>([]);
  const [error, setError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<{ yearLevels?: string; className?: string; classCode?: string; teacher?: string }>({});
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [yearLevelSelectOpen, setYearLevelSelectOpen] = React.useState(false);
  const [teacherSelectOpen, setTeacherSelectOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [classToDelete, setClassToDelete] = React.useState<number | null>(null);

  // Helper to get initials from a name
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(word => word[0]?.toLowerCase() || '')
      .join('');
  }

  // Determine if 'SP' is selected
  const staffParticipantsSelected = selectedYears.includes('SP');

  // Handle year level selection with mutual exclusivity
  const handleYearLevelChange = (values: (number | string)[]) => {
    const hasSP = values.includes('SP');
    const hasOtherYears = values.some(v => v !== 'SP');
    
    if (hasSP && hasOtherYears) {
      // If SP is selected, only keep SP
      setSelectedYears(['SP']);
    } else if (hasOtherYears && !hasSP) {
      // If other years are selected, keep them but remove SP
      setSelectedYears(values.filter(v => v !== 'SP'));
    } else {
      // Normal case - just set the values
      setSelectedYears(values);
    }
  };

  // Generate class code
  React.useEffect(() => {
    if (!selectedYears.length || !className.trim()) {
      setClassCode('');
      return;
    }
    const yearLevel = selectedYears[0];
    const nameInitials = getInitials(className);
    const currentYear = new Date().getFullYear();
    let teacherInitials = '';
    if (staffParticipantsSelected) {
      teacherInitials = 'sp'; // Use 'sp' as the suffix
    } else {
      const teacher = staff.find(s => s.userID === selectedTeachers[0]);
      teacherInitials = teacher ? getInitials(teacher.name) : '';
    }
    // Class code: yearLevel + className initials + year + 'sp' (if staff participants)
    let baseCode = `${yearLevel}${nameInitials}${currentYear}${teacherInitials}`;
    baseCode = baseCode.replace(/\s+/g, '').toLowerCase();
    // Ensure uniqueness
    let uniqueCode = baseCode;
    let suffix = 1;
    while (classes.some((c, idx) => c.classCode?.toLowerCase() === uniqueCode && idx !== editIndex)) {
      uniqueCode = baseCode + suffix;
      suffix++;
    }
    setClassCode(uniqueCode);
  }, [selectedYears, className, selectedTeachers, staff, editIndex, staffParticipantsSelected]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, classId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuClassId(classId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuClassId(null);
  };

  const handleEditClass = () => {
    if (!menuClassId) return;
    const idx = classes.findIndex(c => c.id === menuClassId);
    if (idx === -1) return;
    const cls = classes[idx];
    setEditIndex(idx);
    setSelectedYears(cls.yearLevels);
    setClassName(cls.className);
    setClassCode(cls.classCode); // will be overwritten by useEffect
    setRoom(cls.room);
    setSelectedTeachers(cls.teachers);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClass = () => {
    if (!menuClassId) return;
    const idx = classes.findIndex(c => c.id === menuClassId);
    if (idx === -1) return;
    setClassToDelete(idx);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (classToDelete !== null) {
      const updatedClasses = classes.filter((_, index) => index !== classToDelete);
      setClasses(updatedClasses);
      // Save to server
      fetch('http://localhost:3001/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classes: updatedClasses })
      });
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    }
  };

  const handleCreateClass = () => {
    // Validate required fields
    const newFieldErrors: { yearLevels?: string; className?: string; classCode?: string; teacher?: string } = {};
    if (!selectedYears.length) newFieldErrors.yearLevels = 'Year level is required.';
    if (!className.trim()) newFieldErrors.className = 'Class name is required.';
    // Only require teachers for non-staff participant classes
    if (!staffParticipantsSelected && !selectedTeachers.length) newFieldErrors.teacher = 'At least one teacher is required.';
    setFieldErrors(newFieldErrors);
    if (Object.keys(newFieldErrors).length > 0) return;

    // Check if there are any teaching staff (only for non-staff participant classes)
    if (!staffParticipantsSelected) {
      const teachingStaff = staff.filter(s => s.role === 'Teaching Staff');
      if (teachingStaff.length === 0) {
        setError('Please add teaching staff before creating a class.');
        return;
      }
    }

    if (editIndex !== null) {
      const updatedClasses = [...classes];
      updatedClasses[editIndex] = {
        ...classes[editIndex], // Preserve existing class data including ID
        yearLevels: selectedYears,
        className,
        classCode,
        room,
        teachers: selectedTeachers,
        selectedLessons: classes[editIndex].selectedLessons || [],
        studentIds: classes[editIndex].studentIds || [],
      };
      setClasses(updatedClasses);
      // Save to server
      fetch('http://localhost:3001/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classes: updatedClasses })
      });
    } else {
      // Create mode: add new class
      const newClass = {
        id: classCode.trim().toLowerCase(), // Use class code as ID
        yearLevels: selectedYears,
        className,
        classCode,
        room,
        teachers: selectedTeachers,
        selectedLessons: [],
        studentIds: [],
      };
      const updatedClasses = [...classes, newClass];
      setClasses(updatedClasses);
      // Save to server
      fetch('http://localhost:3001/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classes: updatedClasses })
      });
    }
    setDialogOpen(false);
    setSelectedYears([]);
    setClassName('');
    setClassCode('');
    setRoom('');
    setSelectedTeachers([]);
    setEditIndex(null);
    setError('');
    setFieldErrors({});
  };

  // Reset dialog state
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedYears([]);
    setClassName('');
    setClassCode('');
    setRoom('');
    setSelectedTeachers([]);
    setEditIndex(null);
    setError('');
    setFieldErrors({});
  };

  // Sort classes by year level (ascending), staff participant classes last
  const sortedClasses = [...classes].sort((a, b) => {
    const aIsStaff = a.yearLevels.includes('SP');
    const bIsStaff = b.yearLevels.includes('SP');
    if (aIsStaff && !bIsStaff) return 1;
    if (!aIsStaff && bIsStaff) return -1;
    // Both are staff or both are not staff
    const aYears = a.yearLevels.filter((y: any) => typeof y === 'number');
    const bYears = b.yearLevels.filter((y: any) => typeof y === 'number');
    const aMin = aYears.length > 0 ? Math.min(...aYears) : 999;
    const bMin = bYears.length > 0 ? Math.min(...bYears) : 999;
    return aMin - bMin;
  });

  return (
    <Layout
      breadcrumbs={[
        <Typography key="classes" color="text.primary" sx={{ fontWeight: 600, fontSize: 18 }}>Classes</Typography>
      ]}
    >
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {sortedClasses.map((cls, idx) => {
            const fill = pastelColors[idx % pastelColors.length];
            const outline = darken(fill, 0.18);
            const teacherNames = cls.teachers
              .map((userID: string) => {
                const staffMember = staff.find(s => s.userID === userID);
                return staffMember ? staffMember.name : userID;
              })
              .filter(Boolean);

            return (
              <Paper
                key={cls.id}
                component={Link}
                to={`/classes/${cls.id}`}
                sx={{
                  width: 264,
                  height: 216,
                  display: 'flex',
                  flexDirection: 'column',
                  border: `1px solid ${outline}`,
                  background: fill,
                  color: '#374151',
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 6 },
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                {/* Top section */}
                <Box sx={{
                  background: darken(fill, 0.18),
                  flex: '0 0 10%',
                  p: 2,
                  position: 'relative',
                  minWidth: 0
                }}>
                  <Typography sx={{ color: '#fff', opacity: 0.8, fontWeight: 700, fontSize: 15, mb: 0.5 }}>
                    {cls.yearLevels.includes('SP') ? 'Staff Participants' : cls.yearLevels.filter(Boolean).map((y: number) => `Year ${y}`).join(', ')}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: 'rgba(255,255,255,0.8)',
                      zIndex: 2
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick(e, cls.id);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Typography sx={{ color: '#374151', fontWeight: 700, fontSize: 18, mt: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', display: 'block' }}>
                    {cls.className}
                  </Typography>
                </Box>
                {/* Bottom section */}
                <Box sx={{
                  flex: 1,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {teacherNames.length > 0 && (
                    <Typography sx={{ fontSize: 13, color: '#374151', opacity: 0.8, mb: 1, textAlign: 'center' }}>
                      {teacherNames.join(', ')}
                    </Typography>
                  )}
                  <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#374151' }}>
                    Code: {cls.classCode}
                  </Typography>
                  {cls.room && (
                    <Typography sx={{ fontSize: 14, color: '#555', mt: 0.5 }}>
                      Room: {cls.room}
                    </Typography>
                  )}
                </Box>
              </Paper>
            );
          })}
          {/* Add New Class tile */}
          <Paper
            sx={{
              width: 264,
              height: 216,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed #26b6b6',
              background: '#f8fffd',
              color: '#26b6b6',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 6 },
            }}
            onClick={() => setDialogOpen(true)}
          >
            <AddIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6">New Class</Typography>
          </Paper>
        </Box>

        {/* Menu for class actions */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditClass}>
            Edit Class
          </MenuItem>
          <MenuItem 
            onClick={handleDeleteClass}
            sx={{ color: '#d32f2f' }}
          >
            Delete Class
          </MenuItem>
        </Menu>

        {/* Dialog for New/Edit Class */}
        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
            {editIndex !== null ? 'Edit Class' : 'Create New Class'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Intended participant group/s*"
                select
                SelectProps={{
                  multiple: true,
                  value: selectedYears,
                  onChange: (e) => {
                    const values = typeof e.target.value === 'string'
                      ? e.target.value.split(',').map(v => v === 'SP' ? v : Number(v))
                      : e.target.value;
                    handleYearLevelChange(values as (number | string)[]);
                  },
                  open: yearLevelSelectOpen,
                  onOpen: () => setYearLevelSelectOpen(true),
                  onClose: () => setYearLevelSelectOpen(false),
                  renderValue: (selected) => (selected as (number | string)[]).map(y => y === 'SP' ? 'Staff Participants' : `Year ${y}`).join(', '),
                  MenuProps: {
                    PaperProps: {
                      sx: { minWidth: 220 },
                    },
                    MenuListProps: {
                      sx: { p: 0 },
                    },
                  },
                }}
                size="small"
                error={!!fieldErrors.yearLevels}
                helperText={fieldErrors.yearLevels}
                value={selectedYears}
                sx={{ mt: 0 }}
              >
                {yearLevels.map((year) => (
                  <MenuItem key={year} value={year} disabled={staffParticipantsSelected}>
                    <Checkbox checked={selectedYears.includes(year)} />
                    <ListItemText primary={`Year ${year}`} />
                  </MenuItem>
                ))}
                <MenuItem key="sp" value="SP" disabled={selectedYears.some(y => y !== 'SP')}>
                  <Checkbox checked={selectedYears.includes('SP')} />
                  <ListItemText primary="Staff Participants" />
                </MenuItem>
                <Box
                  sx={{
                    position: 'sticky',
                    bottom: 0,
                    background: '#fff',
                    borderTop: '1px solid #eee',
                    p: 1,
                    textAlign: 'right'
                  }}
                >
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setYearLevelSelectOpen(false);
                    }}
                    {...buttonStyles.secondary}
                  >
                    Done
                  </Button>
                </Box>
              </TextField>

              <TextField
                label="Class Name*"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                error={!!fieldErrors.className}
                helperText={fieldErrors.className}
                size="small"
                placeholder="e.g. Materials Technology"
              />

              <TextField
                label="Teacher/s"
                select
                SelectProps={{
                  multiple: true,
                  value: selectedTeachers,
                  onChange: (e) => {
                    const values = typeof e.target.value === 'string'
                      ? e.target.value.split(',')
                      : e.target.value;
                    setSelectedTeachers(values as string[]);
                  },
                  open: teacherSelectOpen,
                  onOpen: () => setTeacherSelectOpen(true),
                  onClose: () => setTeacherSelectOpen(false),
                  renderValue: (selected) => {
                    const teacherNames = staff
                      .filter(s => (selected as string[]).includes(s.userID))
                      .map(s => s.name);
                    return teacherNames.join(', ');
                  },
                  MenuProps: {
                    PaperProps: {
                      sx: { minWidth: 220 },
                    },
                    MenuListProps: {
                      sx: { p: 0 },
                    },
                  },
                }}
                size="small"
                error={!staffParticipantsSelected && !!fieldErrors.teacher}
                helperText={!staffParticipantsSelected ? fieldErrors.teacher : 'Optional for staff participant classes'}
                value={selectedTeachers}
                sx={{ mt: 0 }}
                required={!staffParticipantsSelected}
              >
                <MenuItem disabled value="">
                  <em>Select teacher/s for the class</em>
                </MenuItem>
                {staff
                  .filter(s => s.role === 'Teaching Staff')
                  .map((teacher) => (
                    <MenuItem key={teacher.userID} value={teacher.userID}>
                      <Checkbox checked={selectedTeachers.includes(teacher.userID)} />
                      <ListItemText primary={teacher.name} />
                    </MenuItem>
                  ))}
                <Box
                  sx={{
                    position: 'sticky',
                    bottom: 0,
                    background: '#fff',
                    borderTop: '1px solid #eee',
                    p: 1,
                    textAlign: 'right'
                  }}
                >
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTeacherSelectOpen(false);
                    }}
                    {...buttonStyles.secondary}
                  >
                    Done
                  </Button>
                </Box>
              </TextField>

              <TextField
                label="Room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                size="small"
                placeholder="e.g. Workshop"
              />

              {/* Remove editable Class Code field, show generated code at bottom */}
              <Box sx={{ mt: 2, mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography sx={{ fontSize: 13, color: '#888', fontWeight: 500 }}>Class Code:</Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#374151', letterSpacing: 1 }}>{classCode || '—'}</Typography>
              </Box>
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
              onClick={handleCreateClass}
              {...buttonStyles.primary}
            >
              {editIndex !== null ? 'Save Changes' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
            Delete Class
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete{' '}
              <strong>
                {classToDelete !== null ? classes[classToDelete]?.className : ''}
              </strong>
              ? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              {...buttonStyles.danger}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
} 