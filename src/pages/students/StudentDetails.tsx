import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Link, Paper, LinearProgress, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Checkbox } from '@mui/material';
import { Layout } from '../../components/layout/Layout';
import { Student } from '../../types/Student';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import VerifiedIcon from '@mui/icons-material/Verified';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { useThemedStyles } from '../../hooks/useThemedStyles';

interface StudentDetailsProps {
  students: Student[];
  classes: any[];
  staff: any[];
}

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

const yearLevels = ['7', '8', '9', '10', '11', '12'];
const API_BASE = 'http://localhost:3001';

export function StudentDetails({ students, classes, staff }: StudentDetailsProps) {
  const { colors, buttonStyles } = useThemedStyles();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [progressTab, setProgressTab] = useState(0);
  const [lessons, setLessons] = useState<any[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedClassesForDownload, setSelectedClassesForDownload] = useState<string[]>([]);
  const [editStudent, setEditStudent] = useState<{
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
  const [editFieldError, setEditFieldError] = useState('');
  const [ignoreScrollSpy, setIgnoreScrollSpy] = useState(false);
  
  // Find student by ID
  const student = students.find(s => s.id.toString() === id);
  
  // Create refs for each section
  const studentInfoRef = React.useRef<HTMLDivElement>(null);
  const enrolledClassesRef = React.useRef<HTMLDivElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Get lessons from localStorage or window if available
  useEffect(() => {
    fetch('http://localhost:3001/lessons')
      .then(res => res.json())
      .then(data => setLessons(data));
  }, []);

  // Set initial scroll position
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // Handle scroll events
  const handleScroll = React.useCallback(() => {
    if (!contentRef.current || ignoreScrollSpy) return;
    const container = contentRef.current;
    const headerOffset = 150; // height of sticky header in px
    const sections = [studentInfoRef, enrolledClassesRef, progressRef];
    const scrollTop = container ? container.scrollTop : 0;
    let activeIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].current;
      if (section && section.offsetTop <= scrollTop + headerOffset + 2) {
        activeIdx = i;
      }
    }
    if (activeIdx !== tab) setTab(activeIdx);
  }, [tab, ignoreScrollSpy]);

  // Debounced scroll handler
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const debouncedHandleScroll = React.useCallback(() => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    const newTimeout = setTimeout(() => {
      handleScroll();
    }, 100); // 100ms delay
    setScrollTimeout(newTimeout);
  }, [handleScroll, scrollTimeout]);

  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
    setIgnoreScrollSpy(true);
    
    const refs = [studentInfoRef, enrolledClassesRef, progressRef];
    const targetRef = refs[newValue];
    if (targetRef.current && contentRef.current) {
      const headerOffset = 137; // Height of main header (64) + tab header (73)
      const targetPosition = targetRef.current.offsetTop - headerOffset;
      
      contentRef.current.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
    
    // Re-enable scroll spy after 2 seconds
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
    // Update the student in the backend
    fetch(`${API_BASE}/students/${userID.trim()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, yearLevel: yearLevel.trim(), userID: userID.trim() }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          // Refresh the page to get updated data
          window.location.reload();
        } else {
          setEditFieldError('Failed to update student.');
        }
      });
    setEditDialogOpen(false);
  };

  const handleArchiveClick = (student: Student) => {
    setArchiveDialogOpen(true);
  };

  const handleArchiveStudent = () => {
    if (student) {
      fetch(`${API_BASE}/students/${student.userID}`, {
        method: 'DELETE',
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            // Navigate back to students page
            navigate('/students');
          } else {
            setEditFieldError('Failed to archive student.');
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
    if (!student || selectedClassesForDownload.length === 0) return;

    // Filter selected classes
    const selectedClassData = enrolledClasses.filter(c => selectedClassesForDownload.includes(c.id));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create a sheet for each class
    selectedClassData.forEach(classItem => {
      // Add class details at the top
      const classDetails = [
        [`${student.name} - ${classItem.className}`],
        [`Class Code: ${classItem.classCode}`],
        [`Year Levels: ${classItem.yearLevels.filter(Boolean).map((y: number) => `Year ${y}`).join(', ')}`],
        [`Room: ${classItem.room || '—'}`],
        [''], // Empty row for spacing
        ['Lesson', 'Status', 'Completion Date', 'Competency Date'] // Header row
      ];
      
      // Add lesson data
      if (classItem.selectedLessons && classItem.selectedLessons.length > 0) {
        classItem.selectedLessons.forEach((lessonName: string) => {
          const progress = student.progress?.[lessonName];
          const progressValue = typeof progress === 'object' ? progress.progress : (progress || 0);
          const isCompetent = typeof progress === 'object' ? progress.competent : false;
          const completionDate = typeof progress === 'object' ? progress.completionDate : undefined;
          const competencyDate = typeof progress === 'object' ? progress.competencyDate : undefined;
          
          let status = 'Not Started';
          if (isCompetent) status = 'Competent';
          else if (progressValue === 100) status = 'Completed';
          else if (progressValue > 0) status = 'In Progress';
          
          const formattedCompletionDate = completionDate ? new Date(completionDate).toLocaleDateString('en-AU') : '';
          const formattedCompetencyDate = competencyDate ? new Date(competencyDate).toLocaleDateString('en-AU') : '';
          
          // Tooltip content for status
          let tooltipContent = status;
          if (status === 'Completed' && formattedCompletionDate) {
            tooltipContent = `Completed: ${formattedCompletionDate}`;
          }
          if (status === 'Competent' && formattedCompetencyDate) {
            tooltipContent = `Competent: ${formattedCompetencyDate}`;
            if (formattedCompletionDate) {
              tooltipContent += `\nCompleted: ${formattedCompletionDate}`;
            }
          }
          
          classDetails.push([lessonName, status, formattedCompletionDate, formattedCompetencyDate]);
        });
      } else {
        // If no lessons assigned, still show the class
        classDetails.push(['No lessons assigned', 'N/A', '', '']);
      }

      // Convert to worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(classDetails);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 30 }, // Lesson
        { wch: 15 }, // Status
        { wch: 15 }, // Completion Date
        { wch: 15 }  // Competency Date
      ];

      // Add worksheet to workbook with sanitized sheet name
      const sheetName = classItem.className.replace(/[\[\]*?/\\]/g, '').substring(0, 31);
      XLSX.utils.book_append_sheet(wb, worksheet, sheetName);
    });

    // Save file
    XLSX.writeFile(wb, `${student.name}_Progress_Report.xlsx`);
    
    setDownloadDialogOpen(false);
  };

  if (!student) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
          <Typography variant="h6" color="text.secondary">Student not found</Typography>
        </Box>
      </Layout>
    );
  }

  // Find classes where this student is enrolled
  const enrolledClasses = classes.filter(c => 
    c.studentIds && Array.isArray(c.studentIds) && c.studentIds.includes(student.userID)
  );

  return (
    <Layout
      breadcrumbs={[
        <Link component={RouterLink} underline="hover" color="inherit" to="/students" key="students" sx={{ fontWeight: 600, fontSize: 18 }}>Students</Link>,
        <Typography color="text.primary" key="current" sx={{ fontWeight: 600, fontSize: 18 }}>{student.name}</Typography>
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
        {/* Fixed header section */}
        <Box sx={{ 
          position: 'fixed', 
          top: 64, // Account for the main app header
          left: 240, // Account for the left menu bar
          right: 0,
          bgcolor: '#fff', 
          zIndex: 1000,
          borderBottom: `1px solid ${colors.border}`,
          pt: 1,
          pb: 0.5,
          transition: 'left 0.2s ease-in-out' // Smooth transition when menu collapses
        }}>
          <Box sx={{ 
            maxWidth: 1000, 
            mx: 'auto', 
            px: 8,
            width: '100%'
          }}>
            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 0 }} textColor="primary" indicatorColor="primary">
              <Tab label="Student Info" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              <Tab label="Enrolled Classes" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              <Tab label="Progress" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
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
            {/* Student Info Section */}
            <Box ref={studentInfoRef} sx={{ display: 'flex', gap: 2, minHeight: 70 }}>
              <Paper elevation={1} sx={{ flex: 1, px: 3, py: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, minHeight: 70, position: 'relative' }}>
                <Typography sx={{ color: '#888', fontWeight: 700, fontSize: 13, mb: 0.5 }}>
                  Year {student.yearLevel}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 22, color: '#374151', lineHeight: 1.1 }}>{student.name}</Typography>
                                    <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 14, mt: 0.5 }}>
                  User ID: {student.userID}
                </Typography>
                <Box sx={{ position: 'absolute', bottom: 8, right: 12, display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit student details" arrow>
                    <IconButton size="small" sx={{ color: colors.iconPrimary }} onClick={() => handleEditClick(student)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset student's password" arrow>
                    <IconButton size="small" sx={{ color: colors.iconPrimary }}>
                      <LockResetIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove / archive student" arrow>
                    <IconButton size="small" sx={{ color: '#e57373' }} onClick={() => handleArchiveClick(student)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Box>
            <div style={{ height: 12 }} />
            
            {/* Enrolled Classes Section */}
            <div ref={enrolledClassesRef}>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'left' }}>Enrolled Classes</Typography>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: colors.containerPaper, borderRadius: 2, p: 2, border: `1px solid ${colors.border}` }}>
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
                            border: `1px solid ${colors.border}`,
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
                              borderColor: colors.primary
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ 
                              color: colors.iconPrimary,
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
                    <Typography sx={{ color: '#bbb', fontSize: 14, textAlign: 'center', py: 2 }}>
                      No classes enrolled
                    </Typography>
                  )}
                </Box>
              </Paper>
            </div>
            <div style={{ height: 12 }} />
            
            {/* Progress Section */}
            <div ref={progressRef}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'left' }}>Lesson Progress</Typography>
                  {enrolledClasses.length > 0 && (
                    <Button
                      onClick={handleDownloadProgress}
                      startIcon={<DownloadIcon />}
                      {...buttonStyles.secondary}
                    >
                      Download {student.name.split(' ')[0]}'s Progress Report
                    </Button>
                  )}
                </Box>
                
                {/* Progress Tabs */}
                {enrolledClasses.length > 0 && (
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
                )}

                <Box sx={{ mt: 2 }}>
                  {enrolledClasses.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Progress Content */}
                      {progressTab === 0 && enrolledClasses.length > 1 ? (
                        // Show all classes - each as separate paper
                        enrolledClasses.map((classItem, index) => (
                          <Paper
                            key={classItem.id}
                            elevation={1}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: `1px solid ${colors.border}`,
                              bgcolor: colors.containerPaper,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                              <Box sx={{ 
                                color: colors.iconPrimary,
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
                                  const progress = student.progress?.[lessonName];
                                  const progressValue = typeof progress === 'object' ? progress.progress : (progress || 0);
                                  const isCompetent = typeof progress === 'object' ? progress.competent : false;
                                  const completionDate = typeof progress === 'object' ? progress.completionDate : undefined;
                                  const competencyDate = typeof progress === 'object' ? progress.competencyDate : undefined;
                                  
                                  let status = 'Not Started';
                                  if (isCompetent) status = 'Competent';
                                  else if (progressValue === 100) status = 'Completed';
                                  else if (progressValue > 0) status = 'In Progress';
                                  
                                  const formattedCompletionDate = completionDate ? new Date(completionDate).toLocaleDateString('en-AU') : '';
                                  const formattedCompetencyDate = competencyDate ? new Date(competencyDate).toLocaleDateString('en-AU') : '';
                                  
                                  // Tooltip content for status
                                  let tooltipContent = status;
                                  if (status === 'Completed' && formattedCompletionDate) {
                                    tooltipContent = `Completed: ${formattedCompletionDate}`;
                                  }
                                  if (status === 'Competent' && formattedCompetencyDate) {
                                    tooltipContent = `Competent: ${formattedCompetencyDate}`;
                                    if (formattedCompletionDate) {
                                      tooltipContent += `\nCompleted: ${formattedCompletionDate}`;
                                    }
                                  }
                                  
                                  return (
                                                                          <Box
                                        sx={{
                                          p: 1.5,
                                          borderRadius: 2,
                                          border: `1px solid ${colors.border}`,
                                          bgcolor: '#fff',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: 2
                                        }}
                                        key={lessonName}
                                      >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                        <Box sx={{ 
                                          color: colors.iconPrimary,
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
                                      {(status === 'Completed' || status === 'Competent') ? (
                                        <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{tooltipContent}</span>} arrow>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'help' }}>
                                            {status === 'Competent' ? (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4caf50' }}>
                                                <VerifiedIcon sx={{ fontSize: 20 }} />
                                                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Competent</Typography>
                                              </Box>
                                            ) : (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4ecdc4' }}>
                                                <CheckCircleIcon sx={{ fontSize: 20 }} />
                                                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Completed</Typography>
                                              </Box>
                                            )}
                                          </Box>
                                        </Tooltip>
                                      ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          {status === 'In Progress' ? (
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
                                      )}
                                    </Box>
                                  );
                                })}
                              </Box>
                            ) : (
                              <Typography sx={{ color: '#bbb', fontFamily: 'Montserrat, sans-serif', fontSize: 14, textAlign: 'center', py: 2 }}>
                                No lessons assigned to this class
                              </Typography>
                            )}
                          </Paper>
                        ))
                      ) : (
                        // Show specific class - as single paper
                        (() => {
                          const classIndex = enrolledClasses.length > 1 ? progressTab - 1 : progressTab;
                          const selectedClass = enrolledClasses[classIndex];
                          if (!selectedClass) return null;
                          
                          return (
                            <Paper
                              elevation={1}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                border: `1px solid ${colors.border}`,
                                bgcolor: colors.containerPaper,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Box sx={{ 
                                  color: colors.iconPrimary,
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
                                    const progress = student.progress?.[lessonName];
                                    const progressValue = typeof progress === 'object' ? progress.progress : (progress || 0);
                                    const isCompetent = typeof progress === 'object' ? progress.competent : false;
                                    const completionDate = typeof progress === 'object' ? progress.completionDate : undefined;
                                    const competencyDate = typeof progress === 'object' ? progress.competencyDate : undefined;
                                    
                                    let status = 'Not Started';
                                    if (isCompetent) status = 'Competent';
                                    else if (progressValue === 100) status = 'Completed';
                                    else if (progressValue > 0) status = 'In Progress';
                                    
                                    const formattedCompletionDate = completionDate ? new Date(completionDate).toLocaleDateString('en-AU') : '';
                                    const formattedCompetencyDate = competencyDate ? new Date(competencyDate).toLocaleDateString('en-AU') : '';
                                    
                                    // Tooltip content for status
                                    let tooltipContent = status;
                                    if (status === 'Completed' && formattedCompletionDate) {
                                      tooltipContent = `Completed: ${formattedCompletionDate}`;
                                    }
                                    if (status === 'Competent' && formattedCompetencyDate) {
                                      tooltipContent = `Competent: ${formattedCompetencyDate}`;
                                      if (formattedCompletionDate) {
                                        tooltipContent += `\nCompleted: ${formattedCompletionDate}`;
                                      }
                                    }
                                    
                                    return (
                                      <Box
                                        sx={{
                                          p: 1.5,
                                          borderRadius: 2,
                                          border: `1px solid ${colors.border}`,
                                          bgcolor: '#fff',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: 2
                                        }}
                                        key={lessonName}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                          <Box sx={{ 
                                            color: colors.iconPrimary,
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
                                        {(status === 'Completed' || status === 'Competent') ? (
                                          <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{tooltipContent}</span>} arrow>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'help' }}>
                                              {status === 'Competent' ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4caf50' }}>
                                                  <VerifiedIcon sx={{ fontSize: 20 }} />
                                                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Competent</Typography>
                                                </Box>
                                              ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4ecdc4' }}>
                                                  <CheckCircleIcon sx={{ fontSize: 20 }} />
                                                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Completed</Typography>
                                                </Box>
                                              )}
                                            </Box>
                                          </Tooltip>
                                        ) : (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {status === 'In Progress' ? (
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
                                        )}
                                      </Box>
                                    );
                                  })}
                                </Box>
                              ) : (
                                <Typography sx={{ color: '#bbb', fontFamily: 'Montserrat, sans-serif', fontSize: 14, textAlign: 'center', py: 2 }}>
                                  No lessons assigned to this class
                                </Typography>
                              )}
                            </Paper>
                          );
                        })()
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ minHeight: 80, bgcolor: colors.containerPaper, borderRadius: 2, p: 2, border: `1px solid ${colors.border}` }}>
                      <Typography sx={{ color: '#bbb', fontSize: 14, textAlign: 'center', py: 2 }}>
                        No classes enrolled
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </div>
          </Box>
        </Box>
      </Box>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20, color: '#374151' }}>Edit Student</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="First Name"
              value={editStudent.firstName}
              onChange={(e) => setEditStudent(prev => ({ ...prev, firstName: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Surname"
              value={editStudent.surname}
              onChange={(e) => setEditStudent(prev => ({ ...prev, surname: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              select
              label="Year Level"
              value={editStudent.yearLevel}
              onChange={(e) => setEditStudent(prev => ({ ...prev, yearLevel: e.target.value }))}
              fullWidth
              size="small"
            >
              {yearLevels.map((year) => (
                <MenuItem key={year} value={year}>
                  Year {year}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="User ID"
              value={editStudent.userID}
              onChange={(e) => setEditStudent(prev => ({ ...prev, userID: e.target.value }))}
              fullWidth
              size="small"
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
            onClick={handleEditStudent}
            sx={{ 
              bgcolor: colors.primary, 
              color: 'white', 
              '&:hover': { bgcolor: colors.primaryHover },
              px: 3
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Archive Student Dialog */}
      <Dialog open={archiveDialogOpen} onClose={() => setArchiveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20, color: '#374151' }}>Archive Student</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#374151', fontSize: 16, mt: 1 }}>
            Are you sure you want to archive {student?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setArchiveDialogOpen(false)} sx={{ color: '#888' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleArchiveStudent}
            sx={{ 
              bgcolor: '#e57373', 
              color: 'white', 
              '&:hover': { bgcolor: '#ef5350' },
              px: 3
            }}
          >
            Archive Student
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
              <Typography sx={{ fontWeight: 600, color: '#374151' }}>
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
                  <Box sx={{ color: colors.iconPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    <SchoolIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 500, color: '#374151' }}>
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