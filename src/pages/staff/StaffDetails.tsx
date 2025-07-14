import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Link, Paper, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Checkbox } from '@mui/material';
import { Layout } from '../../components/layout/Layout';
import { Staff } from './StaffPage';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import VerifiedIcon from '@mui/icons-material/Verified';
import * as XLSX from 'xlsx';
import { buttonStyles } from '../../styles/buttonStyles';

const staffRoles = ['Teaching Staff', 'Support Staff', 'Maintenance Staff'];
const API_BASE = 'http://localhost:3001';

const lessonIcons: { [key: string]: JSX.Element } = {
  'Warning': <SchoolIcon color="inherit" fontSize="inherit" />,
  'Build': <SchoolIcon color="inherit" fontSize="inherit" />,
  'Handyman': <SchoolIcon color="inherit" fontSize="inherit" />,
  'ElectricBolt': <SchoolIcon color="inherit" fontSize="inherit" />,
  'Science': <SchoolIcon color="inherit" fontSize="inherit" />,
  'Power': <SchoolIcon color="inherit" fontSize="inherit" />,
  'Construction': <SchoolIcon color="inherit" fontSize="inherit" />,
  'Factory': <SchoolIcon color="inherit" fontSize="inherit" />,
  'Kitchen': <SchoolIcon color="inherit" fontSize="inherit" />,
  'Iron': <SchoolIcon color="inherit" fontSize="inherit" />,
  'HomeRepair': <SchoolIcon color="inherit" fontSize="inherit" />
};

export default function StaffDetails() {
  const { userID } = useParams<{ userID: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [progressTab, setProgressTab] = useState(0);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedClassesForDownload, setSelectedClassesForDownload] = useState<string[]>([]);
  const [editStaff, setEditStaff] = useState<{
    id: number | null;
    firstName: string;
    surname: string;
    role: string;
    userID: string;
    email: string;
  }>({
    id: null,
    firstName: '',
    surname: '',
    role: '',
    userID: '',
    email: '',
  });
  const [editFieldError, setEditFieldError] = useState('');
  const [ignoreScrollSpy, setIgnoreScrollSpy] = useState(false);
  
  // Create refs for each section
  const staffInfoRef = React.useRef<HTMLDivElement>(null);
  const assignedClassesRef = React.useRef<HTMLDivElement>(null);
  const enrolledClassesRef = React.useRef<HTMLDivElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Fetch staff member data
  useEffect(() => {
    if (userID) {
      fetch(`${API_BASE}/staff/${userID}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setStaff(data);
          } else {
            setStaff(null);
          }
        })
        .catch(error => {
          console.error('Error fetching staff details:', error);
          setStaff(null);
        });
    }
  }, [userID]);

  // Fetch classes data
  useEffect(() => {
    fetch(`${API_BASE}/classes`)
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(error => console.error('Error fetching classes:', error));
  }, []);

  // Get lessons from API
  useEffect(() => {
    fetch(`${API_BASE}/lessons`)
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(error => console.error('Error fetching lessons:', error));
  }, []);

  // Set initial scroll position
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // Find classes where this staff member is assigned as a teacher
  const assignedClasses = classes.filter(c => 
    c.teachers && Array.isArray(c.teachers) && c.teachers.includes(staff?.userID || '')
  );

  // Find classes where this staff member is enrolled as a participant
  const enrolledClasses = classes.filter(c => 
    c.studentIds && Array.isArray(c.studentIds) && c.studentIds.includes(staff?.userID || '')
  );

  // Determine if staff member is a teacher
  const isTeacher = staff?.role === 'Teaching Staff';

  // Create tabs based on role and whether they have enrolled classes
  const tabs = React.useMemo(() => {
    const baseTabs = [
      { label: 'Staff Info', ref: staffInfoRef }
    ];
    
    if (isTeacher) {
      baseTabs.push({ label: 'Assigned Classes', ref: assignedClassesRef });
    }
    
    if (enrolledClasses.length > 0) {
      baseTabs.push({ label: 'Enrolled Classes', ref: enrolledClassesRef });
      baseTabs.push({ label: 'Progress', ref: progressRef });
    } else {
      baseTabs.push({ label: 'Enrolled Classes', ref: enrolledClassesRef });
    }
    
    return baseTabs;
  }, [isTeacher, enrolledClasses.length]);

  // Handle scroll events
  const handleScroll = React.useCallback(() => {
    if (!contentRef.current || ignoreScrollSpy) return;
    const container = contentRef.current;
    const headerOffset = 150;
    const sections = tabs.map(tab => tab.ref);
    const scrollTop = container ? container.scrollTop : 0;
    let activeIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].current;
      if (section && section.offsetTop <= scrollTop + headerOffset + 2) {
        activeIdx = i;
      }
    }
    if (activeIdx !== tab) setTab(activeIdx);
  }, [tab, ignoreScrollSpy, tabs]);

  // Debounced scroll handler
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const debouncedHandleScroll = React.useCallback(() => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    const newTimeout = setTimeout(() => {
      handleScroll();
    }, 100);
    setScrollTimeout(newTimeout);
  }, [handleScroll, scrollTimeout]);

  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
    setIgnoreScrollSpy(true);
    
    const targetRef = tabs[newValue].ref;
    if (targetRef.current && contentRef.current) {
      const headerOffset = 137;
      const targetPosition = targetRef.current.offsetTop - headerOffset;
      
      contentRef.current.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
    
    setTimeout(() => {
      setIgnoreScrollSpy(false);
    }, 2000);
  };

  // Attach scroll listener
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', debouncedHandleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [debouncedHandleScroll, scrollTimeout]);

  const handleEditClick = (staffMember: Staff) => {
    const [firstName, ...surnameParts] = staffMember.name.split(' ');
    setEditStaff({
      id: staffMember.id,
      firstName,
      surname: surnameParts.join(' '),
      role: staffMember.role,
      userID: staffMember.userID,
      email: staffMember.email || '',
    });
    setEditFieldError('');
    setEditDialogOpen(true);
  };

  const handleEditStaff = () => {
    setEditFieldError('');
    const { id, firstName, surname, role, userID, email } = editStaff;
    if (!firstName.trim() || !surname.trim() || !role || !userID.trim()) {
      setEditFieldError('All fields are required.');
      return;
    }
    if (!/^[a-z]+\.[a-z]+$/.test(userID.trim())) {
      setEditFieldError('User ID must be in the format firstname.lastname (all lowercase, no spaces).');
      return;
    }
    const name = `${firstName.trim()} ${surname.trim()}`;
    // Update the staff member in the backend
    fetch(`${API_BASE}/staff/${userID.trim()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role: role.trim(), userID: userID.trim(), email: email.trim() }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          window.location.reload();
        } else {
          setEditFieldError('Failed to update staff member.');
        }
      });
    setEditDialogOpen(false);
  };

  const handleArchiveClick = (staffMember: Staff) => {
    setArchiveDialogOpen(true);
  };

  const handleArchiveStaff = () => {
    if (staff) {
      fetch(`${API_BASE}/staff/${staff.userID}`, {
        method: 'DELETE',
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            navigate('/staff');
          } else {
            setEditFieldError('Failed to archive staff member.');
          }
        });
      setArchiveDialogOpen(false);
    }
  };

  const handleDownloadProgress = () => {
    // Initialize with all enrolled classes selected
    setSelectedClassesForDownload(enrolledClasses.map(c => c.id));
    setDownloadDialogOpen(true);
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClassesForDownload(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSelectAllClasses = () => {
    if (selectedClassesForDownload.length === enrolledClasses.length) {
      setSelectedClassesForDownload([]);
    } else {
      setSelectedClassesForDownload(enrolledClasses.map(c => c.id));
    }
  };

  const exportProgressToExcel = () => {
    if (!staff || selectedClassesForDownload.length === 0) return;

    // Filter selected classes
    const selectedClassData = enrolledClasses.filter(c => selectedClassesForDownload.includes(c.id));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create a sheet for each class
    selectedClassData.forEach(classItem => {
      // Add class details at the top
      const classDetails = [
        [`${staff.name} - ${classItem.className}`],
        [`Class Code: ${classItem.classCode}`],
        [`Year Levels: ${classItem.yearLevels.filter(Boolean).map((y: number) => `Year ${y}`).join(', ')}`],
        [`Room: ${classItem.room || '—'}`],
        [''], // Empty row for spacing
        ['Lesson', 'Progress'] // Header row
      ];
      
      // Add lesson data
      if (classItem.selectedLessons && classItem.selectedLessons.length > 0) {
        classItem.selectedLessons.forEach((lessonName: string) => {
          const progress = staff.progress?.[lessonName];
          const progressValue = typeof progress === 'object' ? progress.progress : (progress || 0);
          const isCompetent = typeof progress === 'object' ? progress.competent : false;
          
          let status = 'Not Started';
          if (isCompetent) status = 'Competent';
          else if (progressValue > 0) status = 'In Progress';
          
          classDetails.push([lessonName, status]);
        });
      } else {
        // If no lessons assigned, still show the class
        classDetails.push(['No lessons assigned', 'N/A']);
      }

      // Convert to worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(classDetails);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 30 }, // Lesson
        { wch: 15 }  // Progress
      ];

      // Add worksheet to workbook with sanitized sheet name
      const sheetName = classItem.className.replace(/[\[\]*?/\\]/g, '').substring(0, 31);
      XLSX.utils.book_append_sheet(wb, worksheet, sheetName);
    });

    // Save file
    XLSX.writeFile(wb, `${staff.name}_Progress_Report.xlsx`);
    
    setDownloadDialogOpen(false);
  };

  if (!staff) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
          <Typography variant="h6" color="text.secondary">Staff member not found</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout
      breadcrumbs={[
        <Link component={RouterLink} underline="hover" color="inherit" to="/staff" key="staff" sx={{ fontWeight: 600, fontSize: 18 }}>Staff</Link>,
        <Typography color="text.primary" key="current" sx={{ fontWeight: 600, fontSize: 18 }}>{staff.name}</Typography>
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
        {/* Fixed header section */}
        <Box sx={{ 
          position: 'fixed', 
          top: 64,
          left: 240,
          right: 0,
          bgcolor: '#fff', 
          zIndex: 1000,
          borderBottom: '1px solid #e0e7ff',
          pt: 1,
          pb: 0.5,
          transition: 'left 0.2s ease-in-out'
        }}>
          <Box sx={{ 
            maxWidth: 1000, 
            mx: 'auto', 
            px: 8,
            width: '100%'
          }}>
            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 0 }} textColor="primary" indicatorColor="primary">
              {tabs.map((tabItem, index) => (
                <Tab key={tabItem.label} label={tabItem.label} sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              ))}
            </Tabs>
          </Box>
        </Box>
        
        {/* Add spacer to account for fixed header */}
        <Box sx={{ height: 60 }} />
        
        {/* Scrollable content section */}
        <Box 
          ref={contentRef}
          onScroll={handleScroll}
          sx={{ 
            flex: 1, 
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a8a8a8',
            },
          }}
        >
          <Box sx={{ px: 8, py: 4, maxWidth: 1000, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Staff Info Section */}
            <Box ref={staffInfoRef} sx={{ display: 'flex', gap: 2, minHeight: 70 }}>
              <Paper elevation={1} sx={{ flex: 1, px: 3, py: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, minHeight: 70, position: 'relative' }}>
                <Typography sx={{ color: '#888', fontWeight: 700, fontSize: 13, mb: 0.5 }}>
                  {staff.role}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 22, color: '#374151', lineHeight: 1.1 }}>{staff.name}</Typography>
                <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 14, fontFamily: 'Montserrat, sans-serif', mt: 0.5 }}>
                  User ID: {staff.userID}
                </Typography>
                {staff.email && (
                  <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 14, fontFamily: 'Montserrat, sans-serif', mt: 0.5 }}>
                    Email: {staff.email}
                  </Typography>
                )}
                <Box sx={{ position: 'absolute', bottom: 8, right: 12, display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit staff details" arrow>
                    <IconButton size="small" sx={{ color: '#4ecdc4' }} onClick={() => handleEditClick(staff)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset staff's password" arrow>
                    <IconButton size="small" sx={{ color: '#4ecdc4' }}>
                      <LockResetIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove / archive staff" arrow>
                    <IconButton size="small" sx={{ color: '#e57373' }} onClick={() => handleArchiveClick(staff)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Box>
            <div style={{ height: 12 }} />
            
            {/* Assigned Classes Section (Teachers only) */}
            {isTeacher && (
              <div ref={assignedClassesRef}>
                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'left' }}>Assigned Classes</Typography>
                  </Box>
                  <Box sx={{ minHeight: 80, bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: '1px solid #e0e7ff' }}>
                    {assignedClasses.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {assignedClasses.map((classItem) => (
                          <Paper
                            key={classItem.id}
                            elevation={0}
                            onClick={() => navigate(`/classes/${classItem.id}`)}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              border: '1px solid #e0e7ff',
                              bgcolor: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 2,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
                                transform: 'translateY(-1px)',
                                borderColor: '#4ecdc4'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ 
                                color: '#4ecdc4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20
                              }}>
                                <SchoolIcon />
                              </Box>
                              <Box>
                                <Typography 
                                  sx={{ 
                                    fontWeight: 600,
                                    color: '#374151',
                                    fontSize: 15
                                  }}
                                >
                                  {classItem.className}
                                </Typography>
                                <Typography 
                                  sx={{ 
                                    color: '#888',
                                    fontSize: 13
                                  }}
                                >
                                  {classItem.yearLevels.filter(Boolean).map((y: number) => `Year ${y}`).join(', ')} • Room {classItem.room || '—'}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontSize: 13, color: '#888' }}>
                                Code: {classItem.classCode}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Typography sx={{ color: '#bbb', fontFamily: 'Montserrat, sans-serif', fontSize: 14, textAlign: 'center', py: 2 }}>
                        No classes assigned
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </div>
            )}
            
            {/* Enrolled Classes Section */}
            <div ref={enrolledClassesRef}>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'left' }}>Enrolled Classes</Typography>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: '1px solid #e0e7ff' }}>
                  {enrolledClasses.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {enrolledClasses.map((classItem) => (
                        <Paper
                          key={classItem.id}
                          elevation={0}
                          onClick={() => navigate(`/classes/${classItem.id}`)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: '1px solid #e0e7ff',
                            bgcolor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
                              transform: 'translateY(-1px)',
                              borderColor: '#4ecdc4'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ 
                              color: '#4ecdc4',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 20
                            }}>
                              <SchoolIcon />
                            </Box>
                            <Box>
                              <Typography 
                                sx={{ 
                                  fontWeight: 600,
                                  color: '#374151',
                                  fontSize: 15
                                }}
                              >
                                {classItem.className}
                              </Typography>
                              <Typography 
                                sx={{ 
                                  color: '#888',
                                  fontSize: 13
                                }}
                              >
                                {classItem.yearLevels.filter(Boolean).map((y: number) => `Year ${y}`).join(', ')} • Room {classItem.room || '—'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: 13, color: '#888' }}>
                              Code: {classItem.classCode}
                            </Typography>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ color: '#bbb', fontFamily: 'Montserrat, sans-serif', fontSize: 14, textAlign: 'center', py: 2 }}>
                      No classes enrolled
                    </Typography>
                  )}
                </Box>
              </Paper>
            </div>

            {/* Progress Section (only show if enrolled in classes) */}
            {enrolledClasses.length > 0 && (
              <div ref={progressRef}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'left' }}>Lesson Progress</Typography>
                    <Button
                      onClick={handleDownloadProgress}
                      startIcon={<DownloadIcon />}
                      {...buttonStyles.secondary}
                    >
                      Download {staff.name.split(' ')[0]}'s Progress Report
                    </Button>
                  </Box>
                  
                  {/* Progress Tabs */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                      value={progressTab} 
                      onChange={(_, newValue) => setProgressTab(newValue)}
                      variant="scrollable"
                      scrollButtons="auto"
                      textColor="primary"
                      indicatorColor="primary"
                    >
                      {enrolledClasses.length > 1 && (
                        <Tab label="All Classes" sx={{ fontWeight: 600, fontSize: 15, textTransform: 'none' }} />
                      )}
                      {enrolledClasses.map((classItem) => (
                        <Tab key={classItem.id} label={classItem.className} sx={{ fontWeight: 600, fontSize: 15, textTransform: 'none' }} />
                      ))}
                    </Tabs>
                  </Box>

                  <Box sx={{ mt: 2, minHeight: 80, bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: '1px solid #e0e7ff' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Progress Content */}
                      {progressTab === 0 && enrolledClasses.length > 1 ? (
                        // Show all classes
                        enrolledClasses.map((classItem) => (
                          <Box key={classItem.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                              <Box sx={{ 
                                color: '#4ecdc4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20
                              }}>
                                <SchoolIcon />
                              </Box>
                              <Typography 
                                sx={{ 
                                  fontWeight: 600,
                                  color: '#374151',
                                  fontSize: 16
                                }}
                              >
                                {classItem.className}
                              </Typography>
                            </Box>
                            
                            {classItem.selectedLessons && classItem.selectedLessons.length > 0 ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {classItem.selectedLessons.map((lessonName: string) => {
                                  const lessonInfo = lessons.find(l => l.name === lessonName);
                                  const progress = staff.progress?.[lessonName];
                                  const progressValue = typeof progress === 'object' ? progress.progress : (progress || 0);
                                  const isCompetent = typeof progress === 'object' ? progress.competent : false;
                                  
                                  return (
                                    <Paper
                                      key={lessonName}
                                      elevation={0}
                                      sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        border: '1px solid #e0e7ff',
                                        bgcolor: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 2,
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                        <Box sx={{ 
                                          color: '#4ecdc4',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: 18
                                        }}>
                                          {lessonIcons[lessonInfo?.icon || 'School'] || <SchoolIcon />}
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: 14 }}>
                                            {lessonName}
                                          </Typography>
                                          {lessonInfo && (
                                            <Typography sx={{ color: '#888', fontSize: 12 }}>
                                              {lessonInfo.description}
                                            </Typography>
                                          )}
                                        </Box>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {isCompetent ? (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4caf50' }}>
                                            <VerifiedIcon sx={{ fontSize: 20 }} />
                                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Competent</Typography>
                                          </Box>
                                        ) : progressValue > 0 ? (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ff9800' }}>
                                            <RadioButtonCheckedIcon sx={{ fontSize: 20 }} />
                                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>In progress</Typography>
                                          </Box>
                                        ) : (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#bbb' }}>
                                            <RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />
                                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Not started</Typography>
                                          </Box>
                                        )}
                                      </Box>
                                    </Paper>
                                  );
                                })}
                              </Box>
                            ) : (
                              <Typography sx={{ color: '#bbb', fontFamily: 'Montserrat, sans-serif', fontSize: 14, textAlign: 'center', py: 2 }}>
                                No lessons assigned to this class
                              </Typography>
                            )}
                          </Box>
                        ))
                      ) : (
                        // Show specific class
                        (() => {
                          const classIndex = enrolledClasses.length > 1 ? progressTab - 1 : progressTab;
                          const selectedClass = enrolledClasses[classIndex];
                          if (!selectedClass) return null;
                          
                          return (
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Box sx={{ 
                                  color: '#4ecdc4',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 20
                                }}>
                                  <SchoolIcon />
                                </Box>
                                <Typography 
                                  sx={{ 
                                    fontWeight: 600,
                                    color: '#374151',
                                    fontSize: 16
                                  }}
                                >
                                  {selectedClass.className}
                                </Typography>
                              </Box>
                              
                              {selectedClass.selectedLessons && selectedClass.selectedLessons.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  {selectedClass.selectedLessons.map((lessonName: string) => {
                                    const lessonInfo = lessons.find(l => l.name === lessonName);
                                    const progress = staff.progress?.[lessonName];
                                    const progressValue = typeof progress === 'object' ? progress.progress : (progress || 0);
                                    const isCompetent = typeof progress === 'object' ? progress.competent : false;
                                    
                                    return (
                                      <Paper
                                        key={lessonName}
                                        elevation={0}
                                        sx={{
                                          p: 1.5,
                                          borderRadius: 2,
                                          border: '1px solid #e0e7ff',
                                          bgcolor: '#fff',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: 2,
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                          <Box sx={{ 
                                            color: '#4ecdc4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 18
                                          }}>
                                            {lessonIcons[lessonInfo?.icon || 'School'] || <SchoolIcon />}
                                          </Box>
                                          <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: 14 }}>
                                              {lessonName}
                                            </Typography>
                                            {lessonInfo && (
                                              <Typography sx={{ color: '#888', fontSize: 12 }}>
                                                {lessonInfo.description}
                                              </Typography>
                                            )}
                                          </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          {isCompetent ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4caf50' }}>
                                              <VerifiedIcon sx={{ fontSize: 20 }} />
                                              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Competent</Typography>
                                            </Box>
                                          ) : progressValue > 0 ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ff9800' }}>
                                              <RadioButtonCheckedIcon sx={{ fontSize: 20 }} />
                                              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>In progress</Typography>
                                            </Box>
                                          ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#bbb' }}>
                                              <RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />
                                              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Not started</Typography>
                                            </Box>
                                          )}
                                        </Box>
                                      </Paper>
                                    );
                                  })}
                                </Box>
                              ) : (
                                <Typography sx={{ color: '#bbb', fontFamily: 'Montserrat, sans-serif', fontSize: 14, textAlign: 'center', py: 2 }}>
                                  No lessons assigned to this class
                                </Typography>
                              )}
                            </Box>
                          );
                        })()
                      )}
                    </Box>
                  </Box>
                </Paper>
              </div>
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Staff Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20, color: '#374151' }}>Edit Staff</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="First Name"
              value={editStaff.firstName}
              onChange={(e) => setEditStaff(prev => ({ ...prev, firstName: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Surname"
              value={editStaff.surname}
              onChange={(e) => setEditStaff(prev => ({ ...prev, surname: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              select
              label="Role"
              value={editStaff.role}
              onChange={(e) => setEditStaff(prev => ({ ...prev, role: e.target.value }))}
              fullWidth
              size="small"
            >
              {staffRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="User ID"
              value={editStaff.userID}
              onChange={(e) => setEditStaff(prev => ({ ...prev, userID: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              value={editStaff.email}
              onChange={(e) => setEditStaff(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              size="small"
              type="email"
            />
            {editFieldError && (
              <Typography sx={{ color: '#e57373', fontSize: 14, mt: 1 }}>
                {editFieldError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: '#888' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleEditStaff}
            sx={{ 
              bgcolor: '#4ecdc4', 
              color: 'white', 
              '&:hover': { bgcolor: '#45b7aa' },
              px: 3
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Archive Staff Dialog */}
      <Dialog open={archiveDialogOpen} onClose={() => setArchiveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20, color: '#374151' }}>Archive Staff</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#374151', fontSize: 16, mt: 1 }}>
            Are you sure you want to archive {staff?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setArchiveDialogOpen(false)} sx={{ color: '#888' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleArchiveStaff}
            sx={{ 
              bgcolor: '#e57373', 
              color: 'white', 
              '&:hover': { bgcolor: '#ef5350' },
              px: 3
            }}
          >
            Archive Staff
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Progress Dialog */}
      <Dialog open={downloadDialogOpen} onClose={() => setDownloadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20, color: '#374151' }}>Download Progress Report</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#374151', fontSize: 16, mb: 2 }}>
            Select which classes to include in the progress report:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Select All Option */}
            <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }, cursor: 'pointer' }}
              onClick={handleSelectAllClasses}
            >
              <Checkbox
                checked={selectedClassesForDownload.length === enrolledClasses.length}
                indeterminate={selectedClassesForDownload.length > 0 && selectedClassesForDownload.length < enrolledClasses.length}
                onChange={handleSelectAllClasses}
                color="primary"
                onClick={e => e.stopPropagation()}
              />
              <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: '#374151' }}>
                Select All Classes
              </Typography>
            </Box>
            
            {/* Individual Class Options */}
            {enrolledClasses.map((classItem) => (
              <Box key={classItem.id} sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }, cursor: 'pointer' }}
                onClick={() => handleClassToggle(classItem.id)}
              >
                <Checkbox
                  checked={selectedClassesForDownload.includes(classItem.id)}
                  onChange={() => handleClassToggle(classItem.id)}
                  color="primary"
                  onClick={e => e.stopPropagation()}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ color: '#4ecdc4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    <SchoolIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#374151' }}>
                      {classItem.className}
                    </Typography>
                    <Typography sx={{ color: '#888', fontSize: 12 }}>
                      {classItem.yearLevels.filter(Boolean).map((y: number) => `Year ${y}`).join(', ')} • {classItem.classCode}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDownloadDialogOpen(false)} {...buttonStyles.cancel}>
            Cancel
          </Button>
          <Button 
            onClick={exportProgressToExcel}
            disabled={selectedClassesForDownload.length === 0}
            startIcon={<DownloadIcon />}
            {...buttonStyles.primary}
          >
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
} 