import React, { useRef, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Tooltip, IconButton, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { Student } from '../../types/Student';
import { buttonStyles } from '../../styles/buttonStyles';

const yearLevels = ['7', '8', '9', '10', '11', '12'];

const API_BASE = 'http://localhost:3001';

export default function StudentsPage() {
  const [tab, setTab] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [students, setStudents] = React.useState<Student[]>([]);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = React.useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [newStudent, setNewStudent] = React.useState({
    firstName: '',
    surname: '',
    yearLevel: '',
    userID: '',
  });
  const [editStudent, setEditStudent] = React.useState<{
    id: number | null;
    firstName: string;
    surname: string;
    yearLevel: string;
    userID: string;
  }>({
    id: null,
    firstName: '',
    surname: '',
    yearLevel: '',
    userID: '',
  });
  const [bulkError, setBulkError] = React.useState('');
  const [fieldError, setFieldError] = React.useState('');
  const [editFieldError, setEditFieldError] = React.useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [bulkSuccessDialogOpen, setBulkSuccessDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
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
  const navigate = useNavigate();

  // Group students by year level, sorted by surname
  const studentsByYear = yearLevels.map(year => ({
    year,
    students: students
      .filter(s => s.yearLevel === year && (
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.userID.includes(search)
      ))
      .sort((a, b) => {
        const aSurname = a.name.split(' ').slice(-1)[0].toLowerCase();
        const bSurname = b.name.split(' ').slice(-1)[0].toLowerCase();
        return aSurname.localeCompare(bSurname);
      })
  }));

  // Compute which year levels have students
  const yearLevelsWithStudents = studentsByYear.filter(group => group.students.length > 0).map(group => group.year);

  // When clicking a tab, scroll to the section and filter
  const handleTabChange = (_: any, value: number) => {
    // First update the tab for filtering
    setTab(value);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fetch students on mount
  useEffect(() => {
    fetch(`${API_BASE}/students`)
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  const handleAddStudent = () => {
    setFieldError('');
    const { firstName, surname, yearLevel, userID } = newStudent;
    if (!firstName.trim() || !surname.trim() || !yearLevel.trim() || !userID.trim()) {
      setFieldError('All fields are required.');
      return;
    }
    if (!/^[7-9]|1[0-2]$/.test(yearLevel.trim()) || isNaN(Number(yearLevel.trim())) || Number(yearLevel.trim()) < 7 || Number(yearLevel.trim()) > 12) {
      setFieldError('Year Level must be a number between 7 and 12.');
      return;
    }
    if (students.some(s => s.userID === userID.trim())) {
      setFieldError('A student with this User ID already exists.');
      return;
    }
    const name = `${firstName.trim()} ${surname.trim()}`;
    const newStudentObj = {
      id: userID.trim(),
      name,
      yearLevel: yearLevel.trim(),
      userID: userID.trim(),
    };
    // POST to backend
    fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: [newStudentObj] }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          fetch(`${API_BASE}/students`)
            .then(res => res.json())
            .then(data => setStudents(data));
          setAddDialogOpen(false);
          setNewStudent({ firstName: '', surname: '', yearLevel: '', userID: '' });
          setFieldError('');
        } else {
          setFieldError('Failed to add student.');
        }
      });
  };

  const handleEditClick = (student: Student) => {
    const [firstName, ...surnameParts] = student.name.split(' ');
    setEditStudent({
      id: student.id,
      firstName,
      surname: surnameParts.join(' '),
      yearLevel: student.yearLevel,
      userID: student.userID,
    });
    setEditFieldError('');
    setEditDialogOpen(true);
  };

  const handleEditStudent = () => {
    setEditFieldError('');
    const { id, firstName, surname, yearLevel, userID } = editStudent;
    if (!firstName.trim() || !surname.trim() || !yearLevel.trim() || !userID.trim()) {
      setEditFieldError('All fields are required.');
      return;
    }
    if (!/^[7-9]|1[0-2]$/.test(yearLevel.trim()) || isNaN(Number(yearLevel.trim())) || Number(yearLevel.trim()) < 7 || Number(yearLevel.trim()) > 12) {
      setEditFieldError('Year Level must be a number between 7 and 12.');
      return;
    }
    if (students.some(s => s.userID === userID.trim() && s.id !== id)) {
      setEditFieldError('A student with this User ID already exists.');
      return;
    }
    const name = `${firstName.trim()} ${surname.trim()}`;
    
    fetch(`${API_BASE}/students/${userID.trim()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, yearLevel: yearLevel.trim(), userID: userID.trim() }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          fetch(`${API_BASE}/students`)
            .then(res => res.json())
            .then(data => setStudents(data));
          setEditDialogOpen(false);
        } else {
          setEditFieldError(result.message || 'Failed to update student.');
        }
      })
      .catch(() => {
        setEditFieldError('Failed to update student.');
      });
  };

  const handleArchiveClick = (student: Student) => {
    setSelectedStudent(student);
    setArchiveDialogOpen(true);
  };

  const handleArchiveStudent = () => {
    if (selectedStudent) {
      fetch(`${API_BASE}/students/${selectedStudent.userID}`, {
        method: 'DELETE',
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            fetch(`${API_BASE}/students`)
              .then(res => res.json())
              .then(data => setStudents(data));
            setArchiveDialogOpen(false);
            setSelectedStudent(null);
          } else {
            setEditFieldError('Failed to archive student.');
          }
        })
        .catch(() => {
          setEditFieldError('Failed to archive student.');
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
        const newStudentList: Student[] = [];
        
        rows.forEach((row, i) => {
          const firstName = row['First Name']?.toString().trim();
          const surname = row['Surname']?.toString().trim();
          const userID = row['User ID']?.toString().trim();
          const yearLevel = row['Year Level']?.toString().trim();
          
          if (!firstName || !surname || !userID || !yearLevel) {
            const errorMsg = `Row ${i + 2}: Missing required field(s).`;
            formatErrors.push(errorMsg);
            skipped++;
            return;
          }
          
          if (!/^[7-9]|1[0-2]$/.test(yearLevel) || isNaN(Number(yearLevel)) || Number(yearLevel) < 7 || Number(yearLevel) > 12) {
            const errorMsg = `Row ${i + 2}: Year Level must be a number between 7 and 12.`;
            formatErrors.push(errorMsg);
            skipped++;
            return;
          }
          
          // Check for duplicates but still allow upload
          if (students.some(s => s.userID === userID) || newStudentList.some(s => s.userID === userID)) {
            duplicates.push(`${firstName} ${surname} (${userID})`);
            skipped++;
            return;
          }
          
          newStudentList.push({
            id: Date.now() + added + i, // unique id
            name: `${firstName} ${surname}`,
            yearLevel,
            userID,
            progress: {},
          });
          added++;
        });
        
        // Only proceed with upload if there are valid students to add
        if (newStudentList.length === 0) {
          setIsUploading(false);
          setBulkError('No valid students found to upload. Please check your file format.');
          return;
        }
        
        // POST to backend
        fetch(`${API_BASE}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: newStudentList }),
        })
          .then(res => res.json())
          .then(result => {
            setIsUploading(false);
            if (result.success) {
              fetch(`${API_BASE}/students`)
                .then(res => res.json())
                .then(data => setStudents(data));
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
      ['First Name', 'Surname', 'User ID', 'Year Level'],
      ['', '', '', ''],
      ['', '', '', ''],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'students_bulk_upload_template.xlsx');
  };

  return (
    <Layout
      title="Students"
      breadcrumbs={[
        <Typography key="students" color="text.primary" sx={{ fontWeight: 600, fontSize: 18 }}>Students</Typography>
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 240, right: 0, zIndex: 1099 }}>
        {/* Search and Add Student */}
        <Box sx={{ bgcolor: '#fff', pt: 3, pb: 1 }}>
          <Box sx={{ maxWidth: 1000, minWidth: 360, mx: 'auto', px: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students..."
              size="small"
              sx={{ flex: 1, minWidth: 175, bgcolor: '#fff', borderRadius: 2 }}
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
              Add Student
            </Button>
            <Button
              startIcon={<AddIcon />}
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
            <Tabs 
              value={tab} 
              onChange={handleTabChange} 
              textColor="primary" 
              indicatorColor="primary" 
              variant="scrollable" 
              scrollButtons="auto"
            >
              <Tab label="All Students" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', fontSize: 16, textTransform: 'none' }} />
              {yearLevelsWithStudents.map((y, i) => (
                <Tab key={y} label={`Year ${y}`} sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', fontSize: 16, textTransform: 'none' }} />
              ))}
            </Tabs>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: 'auto' }} ref={scrollContainerRef}>
          <Box sx={{ px: 4, py: 4, maxWidth: 1000, minWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {tab === 0 && (
              <>
                {studentsByYear.filter(group => group.students.length > 0).map(group => (
                  <Paper key={group.year} elevation={1} sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: '#f8fafc', border: '1px solid #e0e7ff' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', mb: 1, color: '#374151' }}>{`Year ${group.year}`}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {group.students.map(student => (
                        <Box
                          key={student.id}
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
                            cursor: 'pointer',
                            '&:hover': {
                              boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
                              transform: 'translateY(-1px)',
                              borderColor: '#4ecdc4'
                            }
                          }}
                          onClick={() => navigate(`/students/${student.id}`)}
                        >
                          <Box>
                            <Typography 
                              sx={{ 
                                fontWeight: 600, 
                                fontFamily: 'Montserrat, sans-serif', 
                                color: '#374151', 
                                fontSize: 15
                              }}
                            >
                              {student.name}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: '#888', fontFamily: 'Montserrat, sans-serif' }}>
                              User ID: {student.userID}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Reset student's password" arrow>
                              <IconButton 
                                size="small" 
                                sx={{ color: '#4ecdc4' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle reset password
                                }}
                              >
                                <LockResetIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit student details" arrow>
                              <IconButton 
                                size="small" 
                                sx={{ color: '#4ecdc4' }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(student);
                                }}
                              >
                                <EditIcon color="inherit" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove / archive student" arrow>
                              <IconButton 
                                size="small" 
                                sx={{ color: '#e57373' }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveClick(student);
                                }}
                              >
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
                {(() => {
                  const year = yearLevelsWithStudents[tab - 1];
                  const group = studentsByYear.find(g => g.year === year);
                  if (group && group.students.length > 0) {
                    return (
                      <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: '#f8fafc', border: '1px solid #e0e7ff' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', mb: 1, color: '#374151' }}>{`Year ${group.year}`}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {group.students.map(student => (
                            <Box
                              key={student.id}
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
                                cursor: 'pointer',
                                '&:hover': {
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
                                  transform: 'translateY(-1px)',
                                  borderColor: '#4ecdc4'
                                }
                              }}
                              onClick={() => navigate(`/students/${student.id}`)}
                            >
                              <Box>
                                <Typography 
                                  sx={{ 
                                    fontWeight: 600, 
                                    fontFamily: 'Montserrat, sans-serif', 
                                    color: '#374151', 
                                    fontSize: 15
                                  }}
                                >
                                  {student.name}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: '#888', fontFamily: 'Montserrat, sans-serif' }}>
                                  User ID: {student.userID}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Reset student's password" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#4ecdc4' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle reset password
                                    }}
                                  >
                                    <LockResetIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit student details" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#4ecdc4' }} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(student);
                                    }}
                                  >
                                    <EditIcon color="inherit" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove / archive student" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#e57373' }} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleArchiveClick(student);
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    );
                  } else {
                    return (
                      <Typography sx={{ color: '#bbb', fontFamily: 'Montserrat, sans-serif', fontSize: 14 }}>No students in this year level.</Typography>
                    );
                  }
                })()}
              </>
            )}
          </Box>
        </Box>

        {/* Add Student Dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Add Student</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="First Name"
              value={newStudent.firstName}
              onChange={e => setNewStudent(s => ({ ...s, firstName: e.target.value }))}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
            />
            <TextField
              label="Surname"
              value={newStudent.surname}
              onChange={e => setNewStudent(s => ({ ...s, surname: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="User ID"
              value={newStudent.userID}
              onChange={e => setNewStudent(s => ({ ...s, userID: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Year Level"
              value={newStudent.yearLevel}
              onChange={e => setNewStudent(s => ({ ...s, yearLevel: e.target.value }))}
              select
              fullWidth
              size="small"
            >
              {[7,8,9,10,11,12].map(y => (
                <MenuItem key={y} value={y.toString()}>{`Year ${y}`}</MenuItem>
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
              onClick={handleAddStudent}
              {...buttonStyles.primary}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Edit Student</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="First Name"
              value={editStudent.firstName}
              onChange={e => setEditStudent(s => ({ ...s, firstName: e.target.value }))}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
            />
            <TextField
              label="Surname"
              value={editStudent.surname}
              onChange={e => setEditStudent(s => ({ ...s, surname: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="User ID"
              value={editStudent.userID}
              onChange={e => setEditStudent(s => ({ ...s, userID: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Year Level"
              value={editStudent.yearLevel}
              onChange={e => setEditStudent(s => ({ ...s, yearLevel: e.target.value }))}
              select
              fullWidth
              size="small"
            >
              {[7,8,9,10,11,12].map(y => (
                <MenuItem key={y} value={y.toString()}>{`Year ${y}`}</MenuItem>
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
              onClick={handleEditStudent}
              {...buttonStyles.primary}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Archive Student Dialog */}
        <Dialog open={archiveDialogOpen} onClose={() => setArchiveDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Archive Student</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
              Are you sure you want to archive this student?
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#888' }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button
              onClick={() => setArchiveDialogOpen(false)}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleArchiveStudent}
              {...buttonStyles.danger}
            >
              Archive
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Bulk Upload Students</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#374151' }}>
              Upload a CSV or Excel file to add multiple students at once.
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#888', fontFamily: 'Montserrat, sans-serif' }}>
              Ensure the file contains columns for First Name, Surname, User ID, and Year Level.
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
                • Successfully added: {bulkResults.successful} students
              </Typography>
              {bulkResults.duplicates.length > 0 && (
                <Typography sx={{ fontSize: 14, color: '#f57c00', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                  • Duplicates skipped: {bulkResults.duplicates.length} students
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
                  Duplicate Students (Skipped)
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