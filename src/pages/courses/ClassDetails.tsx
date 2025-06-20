import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Link, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Paper, IconButton, Checkbox, LinearProgress, Tooltip } from '@mui/material';
import { Layout } from '../../components/layout/Layout';
import DeleteIcon from '@mui/icons-material/Delete';
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Student } from '../../types/Student';
import * as XLSX from 'xlsx';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import TableRowsIcon from '@mui/icons-material/TableRows';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import WavesIcon from '@mui/icons-material/Waves';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ExtensionIcon from '@mui/icons-material/Extension';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DonutSmallIcon from '@mui/icons-material/DonutSmall';
import TableViewIcon from '@mui/icons-material/TableView';
import LayersIcon from '@mui/icons-material/Layers';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import StraightenIcon from '@mui/icons-material/Straighten';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockResetIcon from '@mui/icons-material/LockReset';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RestorePageIcon from '@mui/icons-material/RestorePage';
import VerifiedIcon from '@mui/icons-material/Verified';
import { buttonStyles } from '../../styles/buttonStyles';

interface ClassDetailsProps {
  classes: any[];
  setClasses: React.Dispatch<React.SetStateAction<any[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

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

export function ClassDetails({ classes, setClasses, students, setStudents }: ClassDetailsProps) {
  const { id } = useParams();
  const [tab, setTab] = useState(0);
  const [dialogTab, setDialogTab] = useState(0);
  const [selectLessonsOpen, setSelectLessonsOpen] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  
  // Find class by ID instead of index
  const classItem = classes.find(c => c.id === id);
  const [selectedLessons, setSelectedLessons] = useState<string[]>(classItem?.selectedLessons || []);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Create refs for each section
  const classInfoRef = React.useRef<HTMLDivElement>(null);
  const lessonsRef = React.useRef<HTMLDivElement>(null);
  const studentsRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Get staff from localStorage or window if available (since staff is not passed as prop)
  const [staff, setStaff] = useState<any[]>([]);
  React.useEffect(() => {
    fetch('http://localhost:3001/staff')
      .then(res => res.json())
      .then(data => setStaff(data));
  }, []);

  // Set initial scroll position
  React.useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // Handle scroll events
  const handleScroll = React.useCallback(() => {
    if (ignoreScrollRef.current) return;
    if (!contentRef.current) return;
    const container = contentRef.current;
    const headerOffset = 150; // height of sticky header in px
    const sections = [classInfoRef, lessonsRef, studentsRef];
    const scrollTop = container ? container.scrollTop : 0;
    let activeIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].current;
      if (section && section.offsetTop <= scrollTop + headerOffset + 2) {
        activeIdx = i;
      }
    }
    if (activeIdx !== tab) setTab(activeIdx);
  }, [tab]);

  // Add state for tab click in progress
  const [tabClickInProgress, setTabClickInProgress] = React.useState(false);

  const ignoreScrollRef = React.useRef(false);

  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
    ignoreScrollRef.current = true;
    const refs = [classInfoRef, lessonsRef, studentsRef];
    const targetRef = refs[newValue];
    if (targetRef.current && contentRef.current) {
      const headerOffset = 137; // Height of main header (64) + tab header (73)
      const targetPosition = targetRef.current.offsetTop - headerOffset;
      
      contentRef.current.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
    setTimeout(() => {
      ignoreScrollRef.current = false;
    }, 4000);
  };

  // Attach scroll listener
  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // State for 3-dot menu and dialog
  const [codeMenuAnchorEl, setCodeMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showCodeDialog, setShowCodeDialog] = React.useState(false);
  // State for remove student dialog
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [studentToRemove, setStudentToRemove] = React.useState<Student | null>(null);
  // State for reset password dialog
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [studentToReset, setStudentToReset] = React.useState<Student | null>(null);
  // Synchronized horizontal scroll refs
  const headerScrollRef = React.useRef<HTMLDivElement>(null);
  const rowScrollRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  // Synchronize scrollLeft for all scrollable containers
  const syncScroll = (source: 'header' | number) => (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    if (source !== 'header' && headerScrollRef.current) headerScrollRef.current.scrollLeft = scrollLeft;
    rowScrollRefs.current.forEach((ref, idx) => {
      if (ref && idx !== source) ref.scrollLeft = scrollLeft;
    });
  };

  // Update selectedLessons when class changes
  React.useEffect(() => {
    if (classItem?.selectedLessons) {
      setSelectedLessons(classItem.selectedLessons);
    }
  }, [classItem]);

  // Persist selectedLessons changes back to class data
  React.useEffect(() => {
    if (classItem) {
      setClasses(prev => prev.map(c => 
        c.id === id ? { ...c, selectedLessons } : c
      ));
    }
  }, [selectedLessons, id, setClasses]);

  const handleLessonToggle = (name: string) => {
    const newSelectedLessons = selectedLessons.includes(name)
      ? selectedLessons.filter((n: string) => n !== name)
      : [...selectedLessons, name];
    
    setSelectedLessons(newSelectedLessons);
    
    // Update the class in the frontend
    setClasses(prev => prev.map(c => 
      c.id === id ? { ...c, selectedLessons: newSelectedLessons } : c
    ));
    
    // Save to backend
    fetch(`http://localhost:3001/classes/${id}/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedLessons: newSelectedLessons }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Update the class with the response data
      setClasses(prev => prev.map(c => {
        if (c.id !== id) return c;
        return {
          ...c,
          ...data.class
        };
      }));
    })
    .catch(error => {
      console.error('Error saving lessons to class:', error);
      // Revert the frontend state if the save failed
      setSelectedLessons(selectedLessons);
      setClasses(prev => prev.map(c => 
        c.id === id ? { ...c, selectedLessons } : c
      ));
    });
  };

  const horizontalScrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [isHorizontallyScrollable, setIsHorizontallyScrollable] = React.useState(false);

  const updateScrollButtons = React.useCallback(() => {
    const el = horizontalScrollRef.current;
    if (!el) return;
    setIsHorizontallyScrollable(el.scrollWidth > el.clientWidth);
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  React.useLayoutEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [selectedLessons.length, students.length, updateScrollButtons]);

  // Add Student dialog state
  const [addStudentDialogOpen, setAddStudentDialogOpen] = React.useState(false);
  const [studentSearch, setStudentSearch] = React.useState('');
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);

  // Filter students by year level and search
  const classYearNumbers = (classItem?.yearLevels || []).filter((y: any) => typeof y === 'number');
  const isStaffParticipantClass = classItem?.yearLevels?.includes('SP');
  const eligibleParticipants = isStaffParticipantClass
    ? staff
    : students.filter(s => {
        const inYear = classYearNumbers.includes(Number((s as any).yearLevel));
        const matchesSearch =
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          (s as any).userID?.toLowerCase().includes(studentSearch.toLowerCase());
        return inYear && matchesSearch;
      }).sort((a, b) => {
        const aSurname = a.name.split(' ').slice(-1)[0].toLowerCase();
        const bSurname = b.name.split(' ').slice(-1)[0].toLowerCase();
        return aSurname.localeCompare(bSurname);
      });

  // Handler for opening Add Student dialog
  const handleOpenAddStudentDialog = () => {
    setAddStudentDialogOpen(true);
    setStudentSearch('');
    setSelectedStudentIds([]);
  };

  // Handler for adding students to class
  const handleAddStudentsToClass = () => {
    if (!classItem || !classItem.id) {
      console.error('No class or class id found');
      return;
    }

    console.log('Current class:', classItem);
    console.log('Adding student IDs:', selectedStudentIds, 'to class', classItem.id);
    
    // Get the latest class data from the classes array
    const currentClass = classes.find(c => c.id === classItem.id);
    if (!currentClass) {
      console.error('Class not found in classes array');
      return;
    }
    
    // Ensure we're working with strings for student IDs
    const existingIds = Array.isArray(currentClass.studentIds) ? currentClass.studentIds.map(String) : [];
    const newIds = selectedStudentIds.map(String);
    
    // Combine existing and new IDs, removing duplicates
    const updatedStudentIds = Array.from(new Set([...existingIds, ...newIds]));

    console.log('Updated student IDs:', updatedStudentIds);

    // Update frontend state
    setClasses(prevClasses => prevClasses.map(c => {
      if (c.id !== classItem.id) return c;
      return {
        ...c,
        studentIds: updatedStudentIds,
      };
    }));

    // Save to backend
    fetch(`http://localhost:3001/classes/${classItem.id}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentIds: updatedStudentIds }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Successfully saved students to class:', data);
      // Update the class with the response data
      setClasses(prevClasses => prevClasses.map(c => {
        if (c.id !== classItem.id) return c;
        return {
          ...c,
          ...data.class
        };
      }));
    })
    .catch(error => {
      console.error('Error saving students to class:', error);
      // Revert the frontend state if the save failed
      setClasses(prevClasses => prevClasses.map(c => {
        if (c.id !== classItem.id) return c;
        return {
          ...c,
          studentIds: existingIds,
        };
      }));
    });

    setAddStudentDialogOpen(false);
  };

  // Add Lessons dialog state
  const [newLessonName, setNewLessonName] = React.useState('');

  // Add new state variables after other state declarations
  const [resetAchievementDialogOpen, setResetAchievementDialogOpen] = React.useState(false);
  const [studentToResetAchievement, setStudentToResetAchievement] = React.useState<Student | null>(null);
  const [selectedLessonsToReset, setSelectedLessonsToReset] = React.useState<string[]>([]);
  const [resetConfirmationOpen, setResetConfirmationOpen] = React.useState(false);
  const [bulkResetDialogOpen, setBulkResetDialogOpen] = React.useState(false);
  const [bulkResetLessonDialogOpen, setBulkResetLessonDialogOpen] = React.useState(false);
  const [selectedStudentsForReset, setSelectedStudentsForReset] = React.useState<string[]>([]);

  // Add state for lesson search in dialog
  const [lessonSearch, setLessonSearch] = React.useState('');

  // Fetch lessons from backend
  React.useEffect(() => {
    fetch('http://localhost:3001/lessons')
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(error => console.error('Error fetching lessons:', error));
  }, []);

  // Add state for competency dialog
  const [competencyDialogOpen, setCompetencyDialogOpen] = React.useState(false);
  const [competencyStep, setCompetencyStep] = React.useState(0); // 0: select students, 1: select lessons
  const [selectedCompetencyStudents, setSelectedCompetencyStudents] = React.useState<string[]>([]);
  const [selectedCompetencyLessons, setSelectedCompetencyLessons] = React.useState<string[]>([]);

  // Helper: get enrolled students/participants
  const enrolledPeople = isStaffParticipantClass
    ? staff.filter((person: any) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(person.userID))
    : students.filter((student: Student) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(student.userID));

  // Helper: get lessons in this class
  const classLessons = selectedLessons;

  // Handler: open dialog
  const handleOpenCompetencyDialog = () => {
    setCompetencyDialogOpen(true);
    setCompetencyStep(0);
    setSelectedCompetencyStudents([]);
    setSelectedCompetencyLessons([]);
  };

  // Handler: mark competency
  const handleRecordCompetency = () => {
    // For each selected student and lesson, set progress=100 and competent=true
    const updatePromises = selectedCompetencyStudents.map(studentId => {
      const student = students.find(s => s.userID === studentId);
      if (!student) return Promise.resolve();

      const newProgress = { ...student.progress };
      selectedCompetencyLessons.forEach(lesson => {
        newProgress[lesson] = { progress: 100, competent: true };
      });

      // Update backend
      return fetch(`http://localhost:3001/students/${studentId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: newProgress }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Update frontend state
        setStudents(prevStudents => prevStudents.map(student => 
          student.userID === studentId ? { ...student, progress: newProgress } : student
        ));
      });
    });

    // Wait for all updates to complete
    Promise.all(updatePromises)
      .then(() => {
        setCompetencyDialogOpen(false);
      })
      .catch(error => {
        console.error('Error updating student progress:', error);
        // You might want to show an error message to the user here
      });
  };

  if (!classItem) return <Box sx={{ p: 4 }}><Typography>Class not found.</Typography></Box>;

  // Calculate grid minWidth
  const gridMinWidth = 180 + 8 + selectedLessons.length * 44 + 80;

  const exportToExcel = () => {
    // Get the student data
    const studentData = classItem.studentIds
      .map(id => {
        const student = isStaffParticipantClass
          ? staff.find(s => s.userID === id)
          : students.find(s => s.userID === id);
        if (!student) return null;
        
        // Create row data with student name and progress for each lesson
        const rowData = {
          Name: student.name,
        };
        
        // Add progress for each selected lesson
        selectedLessons.forEach(lesson => {
          const progress = student.progress?.[lesson] || 0;
          let status;
          if (progress === 100) {
            status = 'Completed';
          } else if (progress > 0) {
            status = 'Started';
          } else {
            status = 'Not started';
          }
          rowData[lesson] = status;
        });
        
        return rowData;
      })
      .filter(Boolean);

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(studentData);

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Name column
      ...selectedLessons.map(() => ({ wch: 15 })) // Lesson columns
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Progress');

    // Generate filename using class details
    const yearLevel = classItem.yearLevels
      .filter((y: any) => typeof y === 'number')
      .map((y: number) => `Year${y}`)
      .join('_');
    
    // Clean the class name and replace spaces with underscores
    const cleanClassName = classItem.className
      .replace(/[^a-zA-Z0-9\s]/g, '')  // Remove special characters
      .replace(/\s+/g, '_');           // Replace spaces with underscores
    
    // Get the year from the class creation date or current year if not available
    const classYear = new Date().getFullYear();
    
    const filename = `${yearLevel}_${cleanClassName}_Training_Record_${classYear}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  // Add this function to handle resetting achievements
  const handleResetAchievement = () => {
    if (selectedStudentsForReset.length > 0 && selectedLessonsToReset.length > 0) {
      // For each selected student and lesson, reset progress
      const updatePromises = selectedStudentsForReset.map(studentId => {
        const student = students.find(s => s.userID === studentId);
        if (!student) return Promise.resolve();

        const newProgress = { ...student.progress };
        selectedLessonsToReset.forEach(lesson => {
          newProgress[lesson] = { progress: 0, competent: false };
        });

        // Update backend
        return fetch(`http://localhost:3001/students/${studentId}/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ progress: newProgress }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Update frontend state
          setStudents(prevStudents => prevStudents.map(student => 
            student.userID === studentId ? { ...student, progress: newProgress } : student
          ));
        });
      });

      // Wait for all updates to complete
      Promise.all(updatePromises)
        .then(() => {
          setResetConfirmationOpen(false);
          setBulkResetLessonDialogOpen(false);
          setBulkResetDialogOpen(false);
          setSelectedLessonsToReset([]);
          setSelectedStudentsForReset([]);
        })
        .catch(error => {
          console.error('Error resetting student progress:', error);
          // You might want to show an error message to the user here
        });
    }
  };

  // Update the reset confirmation dialog to use the new handler
  const handleResetConfirmation = () => {
    if (studentToResetAchievement) {
      // Single student reset
      const newProgress = { ...studentToResetAchievement.progress };
      selectedLessonsToReset.forEach(lesson => {
        newProgress[lesson] = { progress: 0, competent: false };
      });

      // Update backend
      fetch(`http://localhost:3001/students/${studentToResetAchievement.userID}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: newProgress }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Update frontend state
        setStudents(prevStudents => prevStudents.map(student => 
          student.userID === studentToResetAchievement.userID ? { ...student, progress: newProgress } : student
        ));
        setResetConfirmationOpen(false);
        setResetAchievementDialogOpen(false);
        setSelectedLessonsToReset([]);
        setStudentToResetAchievement(null);
      })
      .catch(error => {
        console.error('Error resetting student progress:', error);
        // You might want to show an error message to the user here
      });
    } else {
      // Bulk reset
      handleResetAchievement();
    }
  };

  return (
    <Layout
      breadcrumbs={[
        <Link component={RouterLink} underline="hover" color="inherit" to="/" key="classes" sx={{ fontWeight: 600, fontSize: 18 }}>Classes</Link>,
        <Typography color="text.primary" key="current" sx={{ fontWeight: 600, fontSize: 18 }}>{classItem.className}</Typography>
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
          borderBottom: '1px solid #e0e7ff',
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
              <Tab label="Class Info" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              <Tab label="Lessons" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              <Tab label={isStaffParticipantClass ? 'Participants' : 'Students'} sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
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
            <Box ref={classInfoRef} sx={{ display: 'flex', gap: 2, minHeight: 70 }}>
              <Paper elevation={1} sx={{ flex: 2, px: 3, py: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, minHeight: 70 }}>
                <Typography sx={{ color: '#888', fontWeight: 700, fontSize: 13, mb: 0.5 }}>
                  {!isStaffParticipantClass && classItem.yearLevels.filter(Boolean).map((y: number) => `Year ${y}`).join(', ')}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 22, color: '#374151', lineHeight: 1.1 }}>{classItem.className}</Typography>
                {/* Teacher(s) line below course name */}
                {classItem.teachers && Array.isArray(classItem.teachers) && classItem.teachers.length > 0 && (
                  <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 14, fontFamily: 'Montserrat, sans-serif', mt: 0.5 }}>
                    Teacher{classItem.teachers.length > 1 ? 's' : ''}: {classItem.teachers
                      .map((userID: string) => {
                        const staffMember = staff.find((s: any) => s.userID === userID);
                        return staffMember ? staffMember.name : userID;
                      })
                      .filter(Boolean)
                      .join(', ')}
                  </Typography>
                )}
              </Paper>
              <Paper elevation={1} sx={{ flex: 1, px: 3, py: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 70, position: 'relative' }}>
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 6, right: 6, color: '#b0b0b0' }}
                  onClick={e => setCodeMenuAnchorEl(e.currentTarget)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={codeMenuAnchorEl}
                  open={Boolean(codeMenuAnchorEl)}
                  onClose={() => setCodeMenuAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={() => { setShowCodeDialog(true); setCodeMenuAnchorEl(null); }}>
                    Show Class Code
                  </MenuItem>
                </Menu>
                <Dialog open={showCodeDialog} onClose={() => setShowCodeDialog(false)} maxWidth="xs" fullWidth>
                  <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: 28 }}>Class Code</DialogTitle>
                  <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                      <Typography sx={{ fontSize: 48, fontWeight: 800, letterSpacing: 2, color: '#374151', fontFamily: 'Montserrat, sans-serif' }}>
                        {classItem.classCode}
                      </Typography>
                    </Box>
                  </DialogContent>
                  <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button onClick={() => setShowCodeDialog(false)} {...buttonStyles.primary}>
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
                <Typography sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#374151', fontSize: 18 }}>Code: <span style={{ fontWeight: 700 }}>{classItem.classCode}</span></Typography>
              </Paper>
              <Paper elevation={1} sx={{ flex: 1, px: 3, py: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 70 }}>
                <Typography sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#374151', fontSize: 18 }}>Room: <span style={{ fontWeight: 700 }}>{classItem.room || '—'}</span></Typography>
              </Paper>
            </Box>
            <div style={{ height: 12 }} />
            
            {/* Lessons Section */}
            <div ref={lessonsRef}>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'left' }}>Lessons</Typography>
                  <Button 
                    onClick={() => setSelectLessonsOpen(true)}
                    {...buttonStyles.primary}
                  >
                    Select Lessons
                  </Button>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: '1px solid #e0e7ff' }}>
                  {selectedLessons.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {selectedLessons.map((lessonName) => {
                        const lessonInfo = lessons.find(l => l.name === lessonName);
                        const classStudentIds = Array.isArray(classItem.studentIds) ? classItem.studentIds.map(String) : [];
                        const classPeople = isStaffParticipantClass
                          ? staff.filter((person: any) => classStudentIds.includes(person.userID))
                          : students.filter((student: Student) => classStudentIds.includes(student.userID));
                        const total = classPeople.length;
                        let complete = 0, inProgress = 0, incomplete = 0;
                        const completeNames: string[] = [];
                        const inProgressNames: string[] = [];
                        const incompleteNames: string[] = [];
                        classPeople.forEach(person => {
                          const val = person.progress?.[lessonName] || 0;
                          if (val === 100) {
                            complete++;
                            completeNames.push(person.name);
                          } else if (val > 0) {
                            inProgress++;
                            inProgressNames.push(person.name);
                          } else {
                            incomplete++;
                            incompleteNames.push(person.name);
                          }
                        });
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
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
                                transform: 'translateY(-1px)'
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
                                {lessonInfo && lessonIcons[lessonInfo.icon]}
                              </Box>
                              <Typography 
                                sx={{ 
                                  fontWeight: 600,
                                  color: '#374151',
                                  fontSize: 15
                                }}
                              >
                                {lessonName}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200, flex: 1 }}>
                              {/* Custom 3-segment progress bar */}
                              <Box sx={{ display: 'flex', width: 200, height: 14, borderRadius: 4, overflow: 'hidden', boxShadow: 0, border: '1px solid #e0e7ff', bgcolor: '#e0e7ff', ml: 'auto' }}>
                                {/* Complete */}
                                <Tooltip title={
                                  <Box sx={{ fontSize: '1rem' }}>
                                    <strong>Completed</strong><br />
                                    {complete > 0 ? completeNames.map((name, i) => <div key={i}>{name}</div>) : <div>No participants</div>}
                                  </Box>
                                } arrow>
                                  <Box sx={{
                                    width: `${(complete / total) * 100}%`,
                                    transition: 'width 0.3s',
                                    bgcolor: '#4ecdc4',
                                    '&:hover': { bgcolor: '#26b86b' },
                                    height: '100%',
                                    cursor: complete > 0 ? 'pointer' : 'default',
                                  }} />
                                </Tooltip>
                                {/* In Progress */}
                                <Tooltip title={
                                  <Box sx={{ fontSize: '1rem' }}>
                                    <strong>In Progress</strong><br />
                                    {inProgress > 0 ? inProgressNames.map((name, i) => <div key={i}>{name}</div>) : <div>No participants</div>}
                                  </Box>
                                } arrow>
                                  <Box sx={{
                                    width: `${(inProgress / total) * 100}%`,
                                    transition: 'width 0.3s',
                                    bgcolor: '#38b2ac',
                                    '&:hover': { bgcolor: '#1e7e7e' },
                                    height: '100%',
                                    cursor: inProgress > 0 ? 'pointer' : 'default',
                                  }} />
                                </Tooltip>
                                {/* Incomplete */}
                                <Tooltip title={
                                  <Box sx={{ fontSize: '1rem' }}>
                                    <strong>Not Started</strong><br />
                                    {incomplete > 0 ? incompleteNames.map((name, i) => <div key={i}>{name}</div>) : <div>No participants</div>}
                                  </Box>
                                } arrow>
                                  <Box sx={{
                                    width: `${(incomplete / total) * 100}%`,
                                    transition: 'width 0.3s',
                                    bgcolor: '#e0e7ff',
                                    '&:hover': { bgcolor: '#b0b0b0' },
                                    height: '100%',
                                    cursor: incomplete > 0 ? 'pointer' : 'default',
                                  }} />
                                </Tooltip>
                              </Box>
                              <Typography 
                                sx={{ 
                                  fontWeight: 600,
                                  color: '#374151',
                                  fontSize: 13,
                                  minWidth: 45
                                }}
                              >
                                {complete === total ? '100%' : `${Math.round((complete / total) * 100)}%`}
                              </Typography>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography sx={{ color: '#888' }}>
                      No lessons selected. Click "Select Lessons" to add lessons to this class.
                    </Typography>
                  )}
                </Box>
                {/* Select Lessons Dialog */}
                <Dialog open={selectLessonsOpen} onClose={() => setSelectLessonsOpen(false)} maxWidth="sm" fullWidth
                  PaperProps={{
                    sx: { maxWidth: 600, width: 600, height: 800 }
                  }}
                >
                  <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Select Lessons</DialogTitle>
                  <DialogContent sx={{ p: 0, height: '100%' }}>
                    <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fff', p: 3, pb: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="Search lessons by name"
                        value={lessonSearch}
                        onChange={e => setLessonSearch(e.target.value)}
                        size="small"
                      />
                      <Tabs
                        value={dialogTab}
                        onChange={(_, newValue) => setDialogTab(newValue)}
                        sx={{
                          borderBottom: 1,
                          borderColor: 'divider',
                          '& .MuiTab-root': {
                            fontFamily: 'Montserrat, sans-serif',
                            textTransform: 'none',
                            fontSize: 14,
                            minWidth: 100
                          },
                          mt: 2
                        }}
                      >
                        <Tab label="Industrial" />
                        <Tab label="Kitchen" />
                        <Tab label="Textiles" />
                        <Tab label="Maintenance" />
                      </Tabs>
                    </Box>
                    <Box sx={{ overflowY: 'auto', maxHeight: 670, p: 3, pt: 2 }}>
                      {/* Helper to group lessons by subArea */}
                      {(() => {
                        // Filter lessons by area and search
                        let area = '';
                        if (dialogTab === 0) area = 'Industrial';
                        if (dialogTab === 1) area = 'Kitchen';
                        if (dialogTab === 2) area = 'Textiles';
                        if (dialogTab === 3) area = 'Maintenance';
                        const filteredLessons = lessons
                          .filter(lesson => lesson.area === area && lesson.name.toLowerCase().includes(lessonSearch.toLowerCase()));
                        // Group by subArea
                        const grouped = filteredLessons.reduce((acc, lesson) => {
                          const sub = lesson.subArea || 'Other';
                          if (!acc[sub]) acc[sub] = [];
                          acc[sub].push(lesson);
                          return acc;
                        }, {} as Record<string, typeof lessons>);
                        // Render
                        if (filteredLessons.length === 0) {
                          return (
                            <Typography sx={{ color: '#888', fontFamily: 'Montserrat, sans-serif', mt: 2 }}>
                              No lessons available. Add some in the lessons page.
                            </Typography>
                          );
                        }
                        return (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {Object.entries(grouped).map(([sub, group]) => (
                              <Box key={sub}>
                                <Typography sx={{ fontWeight: 600, color: '#374151', fontFamily: 'Montserrat, sans-serif', mb: 1, fontSize: 16 }}>{sub}</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {(group as typeof lessons).map((lesson) => (
                                    <Box key={lesson.id} sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }, cursor: 'pointer' }}
                                      onClick={() => handleLessonToggle(lesson.name)}
                                    >
                                      <Checkbox
                                        checked={selectedLessons.includes(lesson.name)}
                                        onChange={() => handleLessonToggle(lesson.name)}
                                        color="primary"
                                        onClick={e => e.stopPropagation()}
                                      />
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ color: '#4ecdc4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                          {lessonIcons[lesson.icon]}
                                        </Box>
                                        <Box>
                                          <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                                            {lesson.name}
                                          </Typography>
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
                    <Button
                      onClick={() => setSelectLessonsOpen(false)}
                      {...buttonStyles.primary}
                    >
                      Done
                    </Button>
                  </DialogActions>
                </Dialog>
              </Paper>
            </div>

            {/* Students Section */}
            <div ref={studentsRef}>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'left' }}>{isStaffParticipantClass ? 'Participants' : 'Students'}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      onClick={handleOpenAddStudentDialog}
                      {...buttonStyles.primary}
                    >
                      {isStaffParticipantClass ? 'Add Participant/s' : 'Add Student/s'}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedStudentsForReset([]);
                        setBulkResetDialogOpen(true);
                      }}
                      {...buttonStyles.secondary}
                    >
                      Reset Lesson Achievement
                    </Button>
                    <Button
                      onClick={exportToExcel}
                      {...buttonStyles.secondary}
                    >
                      Download Progress
                    </Button>
                    <Button
                      onClick={handleOpenCompetencyDialog}
                      {...buttonStyles.secondary}
                    >
                      Record Student Competency
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: '1px solid #e0e7ff' }}>
                  {(() => {
                    const filtered = isStaffParticipantClass
                      ? staff.filter((person: any) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(person.userID))
                      : students.filter((student: Student) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(student.userID));
                    if (filtered.length === 0) {
                      return (
                        <Typography sx={{ color: '#888', fontFamily: 'Montserrat, sans-serif' }}>
                          {isStaffParticipantClass
                            ? 'No participants selected. Click "Add participant/s" to add participants to this class.'
                            : 'No students selected. Click "Add student/s" to add students to this class.'
                          }
                        </Typography>
                      );
                    }
                    return (
                      <Box
                        ref={horizontalScrollRef}
                        sx={{ 
                          overflowX: 'auto', 
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isHorizontallyScrollable ? 'flex-start' : 'center'
                        }}
                        onScroll={updateScrollButtons}
                      >
                        {/* Header grid row */}
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: `180px${selectedLessons.length > 0 ? ` repeat(${selectedLessons.length}, 44px)` : ''} 120px`,
                            minWidth: selectedLessons.length > 0 ? gridMinWidth : 180 + 8 + 120,
                            alignItems: 'center',
                            position: 'relative',
                            height: 44,
                            bgcolor: 'transparent',
                            zIndex: 1,
                            mb: 1.5,
                          }}
                        >
                          {/* Name column (sticky left, empty but styled) */}
                          <Box
                            sx={{
                              width: 180, minWidth: 180, maxWidth: 180,
                              boxSizing: 'border-box',
                              position: 'sticky', left: 0, zIndex: 2,
                              bgcolor: '#fff', height: 46, minHeight: 46,
                              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                              border: '1px solid #e0e7ff',
                              borderTopLeftRadius: 8,
                              borderBottomLeftRadius: 8,
                            }}
                          >
                            {selectedLessons.length > 0 && (
                              <IconButton
                                size="small"
                                disabled={!canScrollLeft}
                                sx={{
                                  width: 32, height: 32,
                                  background: canScrollLeft ? '#fff' : '#f0f0f0',
                                  color: canScrollLeft ? '#374151' : '#b0b0b0',
                                  border: '1px solid #e0e7ff',
                                  boxShadow: canScrollLeft ? 1 : 0,
                                  mr: 2,
                                  '&:hover': {
                                    background: canScrollLeft ? '#e0e7ff' : '#f0f0f0',
                                  },
                                  transition: 'background 0.2s, color 0.2s',
                                }}
                                onClick={() => {
                                  horizontalScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
                                }}
                              >
                                <ChevronLeftIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            )}
                          </Box>
                          {selectedLessons.length > 0 && selectedLessons.map((lesson, idx) => {
                            const lessonInfo = lessons.find(l => l.name === lesson);
                            return (
                              <Box
                                key={lesson}
                                sx={{
                                  width: 44, minWidth: 44, maxWidth: 44,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: '1px solid #e0e7ff',
                                  position: 'relative', zIndex: 1, background: '#fff',
                                  height: 44, minHeight: 44
                                }}
                              >
                                <Tooltip title={lesson} arrow>
                                  <Box sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 44, height: 44, color: '#4ecdc4', fontSize: 28
                                  }}>
                                    {lessonIcons[lessonInfo?.icon]}
                                  </Box>
                                </Tooltip>
                              </Box>
                            );
                          })}
                          {/* Actions column (sticky right) */}
                          <Box
                            sx={{
                              width: 120, minWidth: 120, maxWidth: 120,
                              position: 'sticky', right: 0, zIndex: 2,
                              bgcolor: '#fff', height: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                              pl: 2,
                              border: '1px solid #e0e7ff',
                              borderTopRightRadius: 8,
                              borderBottomRightRadius: 8,
                            }}
                          >
                            {selectedLessons.length > 0 && (
                              <IconButton
                                size="small"
                                disabled={!canScrollRight}
                                sx={{
                                  width: 32, height: 32,
                                  background: canScrollRight ? '#fff' : '#f0f0f0',
                                  color: canScrollRight ? '#374151' : '#b0b0b0',
                                  border: '1px solid #e0e7ff',
                                  boxShadow: canScrollRight ? 1 : 0,
                                  ml: 0,
                                  '&:hover': {
                                    background: canScrollRight ? '#e0e7ff' : '#f0f0f0',
                                  },
                                  transition: 'background 0.2s, color 0.2s',
                                }}
                                onClick={() => {
                                  horizontalScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
                                }}
                              >
                                <ChevronRightIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                        {/* Student grid rows */}
                        {filtered.map((person: any, idx: number) => (
                          <Box
                            key={person.userID}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: `180px${selectedLessons.length > 0 ? ` repeat(${selectedLessons.length}, 44px)` : ''} 120px`,
                              minWidth: selectedLessons.length > 0 ? gridMinWidth : 180 + 8 + 120,
                              alignItems: 'center',
                              position: 'relative',
                              height: 44,
                              bgcolor: 'transparent',
                              zIndex: 1,
                              mb: 1.5,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            {/* Name column (sticky left) */}
                            <Box
                              sx={{
                                width: 180, minWidth: 180, maxWidth: 180,
                                boxSizing: 'border-box',
                                position: 'sticky', left: 0, zIndex: 2,
                                bgcolor: '#fff', height: 46, minHeight: 46,
                                display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                                pl: 2,
                                border: '1px solid #e0e7ff',
                                borderTopLeftRadius: 8,
                                borderBottomLeftRadius: 8,
                                transition: 'all 0.2s ease-in-out',
                                boxShadow: '2px 2px 4px rgba(0,0,0,0.08)',
                                '&:hover': {
                                  boxShadow: '3px 3px 6px rgba(0,0,0,0.12)'
                                }
                              }}
                            >
                              <Typography 
                                sx={{ 
                                  fontFamily: 'Montserrat, sans-serif',
                                  fontWeight: 600,
                                  color: '#374151',
                                  fontSize: 14,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {person.name}
                              </Typography>
                            </Box>
                            {/* Progress icons (only if lessons) */}
                            {selectedLessons.length > 0 && selectedLessons.map((lesson: string, idx: number) => {
                              const progressObj = person.progress?.[lesson];
                              const val = typeof progressObj === 'object' ? progressObj.progress : progressObj || 0;
                              const competent = typeof progressObj === 'object' ? progressObj.competent : false;
                              let icon = (
                                <Tooltip title={`${lesson}: Not started`} arrow>
                                  <RadioButtonUncheckedIcon sx={{ color: '#b0b0b0', fontSize: 28, display: 'block', margin: 'auto', transition: 'color 0.2s', '&:hover': { color: '#7ed6df' } }} />
                                </Tooltip>
                              );
                              if (val === 100 && competent) {
                                icon = (
                                  <Tooltip title={`${lesson}: Competent`} arrow>
                                    <VerifiedIcon sx={{ color: '#43a047', fontSize: 28, display: 'block', margin: 'auto', transition: 'color 0.2s', '&:hover': { color: '#2e7031' } }} />
                                  </Tooltip>
                                );
                              } else if (val === 100) {
                                icon = (
                                  <Tooltip title={`${lesson}: Completed`} arrow>
                                    <CheckCircleIcon sx={{ color: '#4ecdc4', fontSize: 28, display: 'block', margin: 'auto', transition: 'color 0.2s', '&:hover': { color: '#26b86b' } }} />
                                  </Tooltip>
                                );
                              } else if (val > 0) {
                                icon = (
                                  <Tooltip title={`${lesson}: In progress`} arrow>
                                    <RadioButtonCheckedIcon sx={{ color: '#4ecdc4', fontSize: 28, display: 'block', margin: 'auto', transition: 'color 0.2s', '&:hover': { color: '#38b2ac' } }} />
                                  </Tooltip>
                                );
                              }
                              return (
                                <Box
                                  key={lesson}
                                  sx={{
                                    width: 44, minWidth: 44, maxWidth: 44,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid #e0e7ff',
                                    position: 'relative',
                                    zIndex: 1,
                                    background: '#fff',
                                    height: 44,
                                    minHeight: 44,
                                    boxShadow: '2px 2px 4px rgba(0,0,0,0.08)',
                                    '&:hover': {
                                      boxShadow: '3px 3px 6px rgba(0,0,0,0.12)'
                                    }
                                  }}
                                >
                                  {icon}
                                </Box>
                              );
                            })}
                            {/* Actions column (sticky right) */}
                            <Box
                              sx={{
                                width: 120, minWidth: 120, maxWidth: 120,
                                position: 'sticky', right: 0, zIndex: 2,
                                bgcolor: '#fff', height: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                                pl: 2,
                                border: '1px solid #e0e7ff',
                                borderTopRightRadius: 8,
                                borderBottomRightRadius: 8,
                                boxShadow: '2px 2px 4px rgba(0,0,0,0.08)',
                                '&:hover': {
                                  boxShadow: '3px 3px 6px rgba(0,0,0,0.12)'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title={`Reset ${person.name}'s lesson achievement`} arrow>
                                  <IconButton
                                    size="small"
                                    sx={{ color: '#4ecdc4' }}
                                    onClick={() => {
                                      setStudentToResetAchievement(person);
                                      setSelectedLessonsToReset([]);
                                      setResetAchievementDialogOpen(true);
                                    }}
                                    aria-label="Reset achievement"
                                  >
                                    <RestorePageIcon />
                                  </IconButton>
                                </Tooltip>
                                {!isStaffParticipantClass && (
                                  <Tooltip title="Reset password" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setStudentToReset(person);
                                        setResetDialogOpen(true);
                                      }}
                                      sx={{ color: '#4ecdc4' }}
                                    >
                                      <LockResetIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title={isStaffParticipantClass ? `Remove participant from class` : `Remove student from class`} arrow>
                                  <IconButton
                                    size="small"
                                    sx={{
                                      color: '#e57373',
                                      transition: 'color 0.2s, background 0.2s',
                                      '&:hover': {
                                        color: '#c62828',
                                        background: 'rgba(230,115,115,0.08)'
                                      }
                                    }}
                                    onClick={() => {
                                      setStudentToRemove(person);
                                      setRemoveDialogOpen(true);
                                    }}
                                    aria-label={isStaffParticipantClass ? 'Remove participant from class' : 'Remove student from class'}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    );
                  })()}
                </Box>
              </Paper>
            </div>
          </Box>
        </Box>
      </Box>

      {/* Remove student confirmation dialog */}
      <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)}>
        <DialogTitle>{isStaffParticipantClass ? 'Remove Participant' : 'Remove Student'}</DialogTitle>
        <DialogContent>
          <Typography>
            {`Are you sure you want to remove `}
            <b>{studentToRemove?.name}</b>
            {isStaffParticipantClass ? ' from this class as a participant?' : ' from this class?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)} sx={{ color: '#374151' }}>Cancel</Button>
          <Button
            onClick={() => {
              if (studentToRemove) {
                setClasses(prevClasses => prevClasses.map(c => {
                  if (c.id !== id) return c;
                  // Remove the student from the class in the frontend
                  const updatedStudentIds = c.studentIds?.filter(sid => sid !== studentToRemove.userID) || [];
                  // Update backend
                  fetch(`http://localhost:3001/classes/${c.id}/students`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studentIds: updatedStudentIds })
                  })
                  .then(res => res.json())
                  .then(data => {
                    setClasses(prev => prev.map(cc => cc.id === c.id ? { ...cc, ...data.class } : cc));
                  });
                  return {
                    ...c,
                    studentIds: updatedStudentIds,
                  };
                }));
              }
              setRemoveDialogOpen(false);
              setStudentToRemove(null);
            }}
            color="error"
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset password confirmation dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset the password for <b>{studentToReset?.name}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} {...buttonStyles.cancel}>Cancel</Button>
          <Button
            onClick={() => setResetDialogOpen(false)}
            {...buttonStyles.primary}
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addStudentDialogOpen} onClose={() => setAddStudentDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{
          sx: { maxWidth: 400, width: 400 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>{isStaffParticipantClass ? 'Add Participant(s) to Class' : 'Add Student(s) to Class'}</DialogTitle>
        <DialogContent sx={{ maxHeight: 500, minHeight: 300, overflowY: 'auto' }}>
          <TextField
            fullWidth
            placeholder={isStaffParticipantClass ? 'Search staff by name or user ID' : 'Search students by name or user ID'}
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
          />
          {eligibleParticipants.length === 0 ? (
            <Typography sx={{ color: '#888', fontFamily: 'Montserrat, sans-serif' }}>
              {isStaffParticipantClass ? 'No staff found.' : 'No students found for the selected year level(s).'}
            </Typography>
          ) : (
            eligibleParticipants.map(participant => (
              <Box
                key={participant.userID}
                sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }, borderRadius: 1, p: 0.5 }}
                onClick={() => {
                  setSelectedStudentIds(prev =>
                    prev.includes(participant.userID)
                      ? prev.filter(id => id !== participant.userID)
                      : [...prev, participant.userID]
                  );
                }}
              >
                <Checkbox
                  checked={selectedStudentIds.includes(participant.userID)}
                  onChange={() => {
                    setSelectedStudentIds(prev =>
                      prev.includes(participant.userID)
                        ? prev.filter(id => id !== participant.userID)
                        : [...prev, participant.userID]
                    );
                  }}
                  color="primary"
                  onClick={e => e.stopPropagation()}
                />
                <Box>
                  <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{participant.name}</Typography>
                  {participant.userID && (
                    <Typography sx={{ fontSize: 12, color: '#888', fontFamily: 'Montserrat, sans-serif' }}>
                      User ID: {participant.userID}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStudentDialogOpen(false)} {...buttonStyles.cancel}>
            Cancel
          </Button>
          <Button onClick={handleAddStudentsToClass} {...buttonStyles.primary} disabled={selectedStudentIds.length === 0}>
            {isStaffParticipantClass ? 'Add Selected' : 'Add Selected'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Achievement Dialog */}
      <Dialog 
        open={resetAchievementDialogOpen} 
        onClose={() => setResetAchievementDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
          Reset Achievements for {studentToResetAchievement?.name}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
            Select the lessons you want to reset achievements for:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {selectedLessons.map((lesson) => (
              <Box 
                key={lesson}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedLessonsToReset(prev =>
                    prev.includes(lesson)
                      ? prev.filter(l => l !== lesson)
                      : [...prev, lesson]
                  );
                }}
              >
                <Checkbox
                  checked={selectedLessonsToReset.includes(lesson)}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedLessonsToReset(prev =>
                      prev.includes(lesson)
                        ? prev.filter(l => l !== lesson)
                        : [...prev, lesson]
                    );
                  }}
                  color="primary"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    color: '#4ecdc4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20
                  }}>
                    {lessonIcons[lesson]}
                  </Box>
                  <Typography sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {lesson}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setResetAchievementDialogOpen(false)}
            {...buttonStyles.cancel}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedLessonsToReset.length > 0) {
                setResetConfirmationOpen(true);
              }
            }}
            {...buttonStyles.primary}
            disabled={selectedLessonsToReset.length === 0}
          >
            Reset Selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetConfirmationOpen}
        onClose={() => setResetConfirmationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
          Confirm Reset
        </DialogTitle>
        <DialogContent>
          <Typography>
            {studentToResetAchievement 
              ? `Are you sure you want to reset ${studentToResetAchievement.name}'s achievements for the following lessons?`
              : `Are you sure you want to reset achievements for ${selectedStudentsForReset.length} selected student${selectedStudentsForReset.length > 1 ? 's' : ''} for the following lessons?`
            }
          </Typography>
          <Box sx={{ mt: 2, pl: 2 }}>
            {selectedLessonsToReset.map((lesson) => (
              <Typography 
                key={lesson}
                sx={{ 
                  color: '#666',
                  fontSize: '0.9rem',
                  mb: 0.5
                }}
              >
                • {lesson}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setResetConfirmationOpen(false)}
            {...buttonStyles.cancel}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (studentToResetAchievement) {
                // Single student reset
                const newProgress = { ...studentToResetAchievement.progress };
                selectedLessonsToReset.forEach(lesson => {
                  newProgress[lesson] = { progress: 0, competent: false };
                });

                // Update backend
                fetch(`http://localhost:3001/students/${studentToResetAchievement.userID}/progress`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ progress: newProgress }),
                })
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  return response.json();
                })
                .then(data => {
                  // Update frontend state
                  setStudents(prevStudents => prevStudents.map(student => 
                    student.userID === studentToResetAchievement.userID ? { ...student, progress: newProgress } : student
                  ));
                  setResetConfirmationOpen(false);
                  setResetAchievementDialogOpen(false);
                  setSelectedLessonsToReset([]);
                  setStudentToResetAchievement(null);
                })
                .catch(error => {
                  console.error('Error resetting student progress:', error);
                  // You might want to show an error message to the user here
                });
              } else if (selectedStudentsForReset.length > 0 && selectedLessonsToReset.length > 0) {
                // Bulk reset
                const updatePromises = selectedStudentsForReset.map(studentId => {
                  const student = students.find(s => s.userID === studentId);
                  if (!student) return Promise.resolve();

                  const newProgress = { ...student.progress };
                  selectedLessonsToReset.forEach(lesson => {
                    newProgress[lesson] = { progress: 0, competent: false };
                  });

                  // Update backend
                  return fetch(`http://localhost:3001/students/${studentId}/progress`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ progress: newProgress }),
                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                  })
                  .then(data => {
                    // Update frontend state
                    setStudents(prevStudents => prevStudents.map(student => 
                      student.userID === studentId ? { ...student, progress: newProgress } : student
                    ));
                  });
                });

                // Wait for all updates to complete
                Promise.all(updatePromises)
                  .then(() => {
                    setResetConfirmationOpen(false);
                    setBulkResetLessonDialogOpen(false);
                    setBulkResetDialogOpen(false);
                    setSelectedLessonsToReset([]);
                    setSelectedStudentsForReset([]);
                  })
                  .catch(error => {
                    console.error('Error resetting student progress:', error);
                    // You might want to show an error message to the user here
                  });
              }
            }}
            {...buttonStyles.primary}
            color="error"
          >
            Confirm Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Reset Student Selection Dialog */}
      <Dialog
        open={bulkResetDialogOpen}
        onClose={() => setBulkResetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
          Select students to reset lesson achievement
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              onClick={() => {
                const filtered = isStaffParticipantClass
                  ? staff.filter((person: any) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(person.userID))
                  : students.filter((student: Student) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(student.userID));
                setSelectedStudentsForReset(filtered.map(s => s.userID));
              }}
              {...buttonStyles.primary}
            >
              Select All
            </Button>
            <Button
              variant="contained"
              onClick={() => setSelectedStudentsForReset([])}
              sx={{ 
                bgcolor: '#d3d7df',
                color: '#222',
                textTransform: 'none',
                fontWeight: 400,
                boxShadow: 0,
                '&:hover': { bgcolor: '#bfc3cb' }
              }}
            >
              Clear Selection
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(() => {
              const filtered = isStaffParticipantClass
                ? staff.filter((person: any) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(person.userID))
                : students.filter((student: Student) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(student.userID));
              return filtered.map((person) => (
                <Box
                  key={person.userID}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedStudentsForReset(prev =>
                      prev.includes(person.userID)
                        ? prev.filter(id => id !== person.userID)
                        : [...prev, person.userID]
                    );
                  }}
                >
                  <Checkbox
                    checked={selectedStudentsForReset.includes(person.userID)}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSelectedStudentsForReset(prev =>
                        prev.includes(person.userID)
                          ? prev.filter(id => id !== person.userID)
                          : [...prev, person.userID]
                      );
                    }}
                    color="primary"
                  />
                  <Typography sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {person.name}
                  </Typography>
                </Box>
              ));
            })()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBulkResetDialogOpen(false)}
            {...buttonStyles.cancel}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedStudentsForReset.length > 0) {
                setBulkResetDialogOpen(false);
                setBulkResetLessonDialogOpen(true);
              }
            }}
            {...buttonStyles.primary}
            disabled={selectedStudentsForReset.length === 0}
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Reset Lesson Selection Dialog */}
      <Dialog
        open={bulkResetLessonDialogOpen}
        onClose={() => setBulkResetLessonDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
          Select lessons to reset achievement
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
            Select the lessons you want to reset achievements for:
          </Typography>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              onClick={() => setSelectedLessonsToReset(selectedLessons)}
              {...buttonStyles.primary}
            >
              Select All
            </Button>
            <Button
              variant="contained"
              onClick={() => setSelectedLessonsToReset([])}
              sx={{ 
                bgcolor: '#d3d7df',
                color: '#222',
                textTransform: 'none',
                fontWeight: 400,
                boxShadow: 0,
                '&:hover': { bgcolor: '#bfc3cb' }
              }}
            >
              Clear Selection
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {selectedLessons.map((lesson) => (
              <Box
                key={lesson}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedLessonsToReset(prev =>
                    prev.includes(lesson)
                      ? prev.filter(l => l !== lesson)
                      : [...prev, lesson]
                  );
                }}
              >
                <Checkbox
                  checked={selectedLessonsToReset.includes(lesson)}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedLessonsToReset(prev =>
                      prev.includes(lesson)
                        ? prev.filter(l => l !== lesson)
                        : [...prev, lesson]
                    );
                  }}
                  color="primary"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    color: '#4ecdc4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20
                  }}>
                    {lessonIcons[lesson]}
                  </Box>
                  <Typography sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {lesson}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setBulkResetLessonDialogOpen(false);
              setBulkResetDialogOpen(true);
            }}
            {...buttonStyles.cancel}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              if (selectedLessonsToReset.length > 0) {
                setResetConfirmationOpen(true);
                setBulkResetLessonDialogOpen(false);
              }
            }}
            {...buttonStyles.primary}
            disabled={selectedLessonsToReset.length === 0}
          >
            Reset Selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* Competency Dialog */}
      <Dialog open={competencyDialogOpen} onClose={() => setCompetencyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
          {competencyStep === 0 ? (isStaffParticipantClass ? 'Select Participants' : 'Select Students') : 'Select Lessons/Equipment'}
        </DialogTitle>
        <DialogContent sx={{ minHeight: 300, maxHeight: 500, overflowY: 'auto' }}>
          {competencyStep === 0 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                  onClick={() => setSelectedCompetencyStudents(enrolledPeople.map(p => p.userID))}
                  {...buttonStyles.primary}
                >
                  Select All
                </Button>
                <Button
                  onClick={() => setSelectedCompetencyStudents([])}
                  {...buttonStyles.cancel}
                >
                  Clear Selection
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {enrolledPeople.map(person => (
                  <Box
                    key={person.userID}
                    sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }, cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedCompetencyStudents(prev =>
                        prev.includes(person.userID)
                          ? prev.filter(id => id !== person.userID)
                          : [...prev, person.userID]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedCompetencyStudents.includes(person.userID)}
                      onChange={e => {
                        e.stopPropagation();
                        setSelectedCompetencyStudents(prev =>
                          prev.includes(person.userID)
                            ? prev.filter(id => id !== person.userID)
                            : [...prev, person.userID]
                        );
                      }}
                      color="primary"
                    />
                    <Typography sx={{ fontFamily: 'Montserrat, sans-serif' }}>{person.name}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
          {competencyStep === 1 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                  onClick={() => setSelectedCompetencyLessons(classLessons)}
                  {...buttonStyles.primary}
                >
                  Select All
                </Button>
                <Button
                  onClick={() => setSelectedCompetencyLessons([])}
                  {...buttonStyles.cancel}
                >
                  Clear Selection
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {classLessons.map(lesson => (
                  <Box
                    key={lesson}
                    sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }, cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedCompetencyLessons(prev =>
                        prev.includes(lesson)
                          ? prev.filter(l => l !== lesson)
                          : [...prev, lesson]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedCompetencyLessons.includes(lesson)}
                      onChange={e => {
                        e.stopPropagation();
                        setSelectedCompetencyLessons(prev =>
                          prev.includes(lesson)
                            ? prev.filter(l => l !== lesson)
                            : [...prev, lesson]
                        );
                      }}
                      color="primary"
                    />
                    <Typography sx={{ fontFamily: 'Montserrat, sans-serif' }}>{lesson}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {competencyStep === 1 && (
            <Button
              onClick={() => setCompetencyStep(0)}
              {...buttonStyles.cancel}
            >
              Back
            </Button>
          )}
          {competencyStep === 0 && (
            <Button
              onClick={() => setCompetencyDialogOpen(false)}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
          )}
          {competencyStep === 0 && (
            <Button
              onClick={() => setCompetencyStep(1)}
              {...buttonStyles.primary}
              disabled={selectedCompetencyStudents.length === 0}
            >
              Next
            </Button>
          )}
          {competencyStep === 1 && (
            <Button
              onClick={handleRecordCompetency}
              variant="contained"
              sx={{ bgcolor: '#4ecdc4', color: '#fff', boxShadow: 0, '&:hover': { bgcolor: '#38b2ac' } }}
              disabled={selectedCompetencyLessons.length === 0}
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Layout>
  );
} 