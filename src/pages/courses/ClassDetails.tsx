import React, { useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Link, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Paper, IconButton, Checkbox, LinearProgress, Tooltip, FormControlLabel } from '@mui/material';
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
import GroupIcon from '@mui/icons-material/Group';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import EventIcon from '@mui/icons-material/Event';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

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

// Helper function to sort lessons according to lessons page structure
const sortLessonsByPageOrder = (lessonNames: string[], allLessons: any[]) => {
  const lessonAreas = ['Industrial', 'Textiles', 'Kitchen', 'Maintenance'];
  const industrialSubAreas = [
    'Workshop Safety',
    'Multiuse Workshop Equipment',
    'Metalworking',
    'Woodworking',
    'Painting & Finishing',
    'Heating & Forming'
  ];

  // Create a map of lesson names to their full lesson objects
  const lessonMap = new Map();
  allLessons.forEach(lesson => {
    lessonMap.set(lesson.name, lesson);
  });

  // Sort lessons according to the lessons page structure
  return lessonNames.sort((a, b) => {
    const lessonA = lessonMap.get(a);
    const lessonB = lessonMap.get(b);
    
    if (!lessonA || !lessonB) return 0;
    
    // First sort by area
    const areaA = lessonAreas.indexOf(lessonA.area);
    const areaB = lessonAreas.indexOf(lessonB.area);
    
    if (areaA !== areaB) {
      return areaA - areaB;
    }
    
    // For Industrial area, sort by sub-area
    if (lessonA.area === 'Industrial' && lessonB.area === 'Industrial') {
      const subAreaA = industrialSubAreas.indexOf(lessonA.subArea || '');
      const subAreaB = industrialSubAreas.indexOf(lessonB.subArea || '');
      
      if (subAreaA !== subAreaB) {
        return subAreaA - subAreaB;
      }
    }
    
    // Within the same area/sub-area, maintain original order from lessons array
    const originalIndexA = allLessons.findIndex(l => l.name === a);
    const originalIndexB = allLessons.findIndex(l => l.name === b);
    
    return originalIndexA - originalIndexB;
  });
};

export function ClassDetails({ classes, setClasses, students, setStudents }: ClassDetailsProps) {
  const { colors, buttonStyles } = useThemedStyles();
  const { id } = useParams();
  const navigate = useNavigate();
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
    // Pre-select students who are already in the class
    setSelectedStudentIds(classItem?.studentIds || []);
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
  const [downloadConfirmationOpen, setDownloadConfirmationOpen] = React.useState(false);

  // Add state for lesson search in dialog
  const [lessonSearch, setLessonSearch] = React.useState('');

  // Add search state variables for dialogs
  const [competencyStudentSearch, setCompetencyStudentSearch] = React.useState('');
  const [competencyLessonSearch, setCompetencyLessonSearch] = React.useState('');
  const [bulkResetStudentSearch, setBulkResetStudentSearch] = React.useState('');
  const [bulkResetLessonSearch, setBulkResetLessonSearch] = React.useState('');
  const [individualCompetencyLessonSearch, setIndividualCompetencyLessonSearch] = React.useState('');
  const [resetAchievementLessonSearch, setResetAchievementLessonSearch] = React.useState('');

  // State for competency confirmation dialog
  const [competencyConfirmationOpen, setCompetencyConfirmationOpen] = React.useState(false);
  const [competencyConfirmationDetails, setCompetencyConfirmationDetails] = React.useState<{
    studentIds: string[];
    lessonNames: string[];
    studentNames: string[];
  } | null>(null);

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

  // Add state for individual competency dialog
  const [individualCompetencyDialogOpen, setIndividualCompetencyDialogOpen] = React.useState(false);
  const [selectedIndividualStudent, setSelectedIndividualStudent] = React.useState<Student | null>(null);
  const [selectedIndividualLessons, setSelectedIndividualLessons] = React.useState<string[]>([]);

  // Helper: get enrolled students/participants
  const enrolledPeople = isStaffParticipantClass
    ? staff.filter((person: any) => Array.isArray(classItem?.studentIds) && classItem?.studentIds.includes(person.userID))
    : students.filter((student: Student) => Array.isArray(classItem?.studentIds) && classItem?.studentIds.includes(student.userID));

  // Sort enrolled people by last name
  const sortedEnrolledPeople = enrolledPeople.sort((a, b) => {
    const lastNameA = a.name.split(' ').pop()?.toLowerCase() || '';
    const lastNameB = b.name.split(' ').pop()?.toLowerCase() || '';
    return lastNameA.localeCompare(lastNameB);
  });

  // Helper: get lessons in this class
  const classLessons = selectedLessons;

  // Handler: open individual competency dialog
  const handleOpenIndividualCompetencyDialog = (student: Student) => {
    setSelectedIndividualStudent(student);
    setSelectedIndividualLessons([]);
    setIndividualCompetencyDialogOpen(true);
    setIndividualCompetencyLessonSearch('');
  };

  // Handler: mark individual competency
  const handleRecordIndividualCompetency = () => {
    if (!selectedIndividualStudent || selectedIndividualLessons.length === 0) return;

    setCompetencyConfirmationDetails({
      studentIds: [selectedIndividualStudent.userID],
      lessonNames: selectedIndividualLessons,
      studentNames: [selectedIndividualStudent.name],
    });
    setCompetencyConfirmationOpen(true);
  };

  // Handler: mark competency
  const handleRecordCompetency = () => {
    if (selectedCompetencyStudents.length === 0 || selectedCompetencyLessons.length === 0) return;

    const studentNames = selectedCompetencyStudents.map(id => {
      const person = isStaffParticipantClass 
        ? staff.find(s => s.userID === id) 
        : students.find(s => s.userID === id);
      return person ? person.name : 'Unknown';
    });

    setCompetencyConfirmationDetails({
      studentIds: selectedCompetencyStudents,
      lessonNames: selectedCompetencyLessons,
      studentNames: studentNames,
    });
    setCompetencyConfirmationOpen(true);
  };

  // Handler: open dialog
  const handleOpenCompetencyDialog = () => {
    setCompetencyDialogOpen(true);
    setCompetencyStep(0);
    setSelectedCompetencyStudents([]);
    setSelectedCompetencyLessons([]);
    setCompetencyStudentSearch('');
    setCompetencyLessonSearch('');
  };

  const handleConfirmCompetencyUpdate = () => {
    if (!competencyConfirmationDetails) return;

    const { studentIds, lessonNames } = competencyConfirmationDetails;

    const updatePromises = studentIds.map(studentId => {
      const person = isStaffParticipantClass
        ? staff.find(s => s.userID === studentId)
        : students.find(s => s.userID === studentId);
      if (!person) return Promise.resolve();

      const newProgress = { ...person.progress };
      lessonNames.forEach(lesson => {
        const progressObj = person.progress?.[lesson];
        const progress = typeof progressObj === 'object' ? progressObj.progress : (progressObj || 0);
        const isCompetent = typeof progressObj === 'object' && progressObj?.competent === true;
        // For staff, mark as competent if not already competent
        if (isStaffParticipantClass) {
          if (!isCompetent) {
            newProgress[lesson] = { progress: progress, competent: true };
          }
        } else {
          // For students, only mark as competent if completed and not already competent
          if (progress === 100 && !isCompetent) {
            newProgress[lesson] = { progress: 100, competent: true };
          }
        }
      });

      // Update backend
      const endpoint = isStaffParticipantClass
        ? `http://localhost:3001/staff/${studentId}/progress`
        : `http://localhost:3001/students/${studentId}/progress`;
      const updateState = isStaffParticipantClass ? setStaff : setStudents;

      return fetch(endpoint, {
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
        updateState(prev => prev.map(p =>
          p.userID === studentId ? { ...p, progress: newProgress } : p
        ));
      });
    });

    Promise.all(updatePromises)
      .then(() => {
        setCompetencyConfirmationOpen(false);
        setCompetencyConfirmationDetails(null);
        // Also close the original dialogs if they are open
        setIndividualCompetencyDialogOpen(false);
        setCompetencyDialogOpen(false);
        setForceRerender(n => n + 1); // Force re-render
      })
      .catch(error => {
        console.error('Error updating progress:', error);
      });
  };

  // Add state for lesson due date dialog
  const [lessonDueDateDialogOpen, setLessonDueDateDialogOpen] = React.useState(false);
  const [lessonDueDateStep, setLessonDueDateStep] = React.useState<number>(0); // 0: select lessons, 1: set date
  const [selectedLessonsForDueDate, setSelectedLessonsForDueDate] = React.useState<string[]>([]);
  const [lessonDueDateSearch, setLessonDueDateSearch] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');

  // Handler: open lesson due date dialog
  const handleOpenLessonDueDateDialog = () => {
    setLessonDueDateDialogOpen(true);
    setLessonDueDateStep(0);
    setSelectedLessonsForDueDate([]);
    setLessonDueDateSearch('');
    setDueDate('');
  };

  // Handler: set lesson due date
  const handleSetLessonDueDate = () => {
    if (selectedLessonsForDueDate.length > 0 && dueDate) {
      console.log('Setting due date for lessons:', selectedLessonsForDueDate, 'to:', dueDate);
      
      // Update the class with due dates
      const updatedClass = {
        ...classItem,
        lessonDueDates: {
          ...classItem.lessonDueDates,
          ...selectedLessonsForDueDate.reduce((acc, lesson) => {
            acc[lesson] = dueDate;
            return acc;
          }, {} as Record<string, string>)
        }
      };

      // Update frontend state
      setClasses(prev => prev.map(c => 
        c.id === id ? updatedClass : c
      ));

      // Save to backend
      fetch(`http://localhost:3001/classes/${id}/due-dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          lessonDueDates: updatedClass.lessonDueDates 
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Successfully saved due dates:', data);
        // Update the class with the response data
        setClasses(prev => prev.map(c => 
          c.id === id ? { ...c, ...data.class } : c
        ));
      })
      .catch(error => {
        console.error('Error saving due dates:', error);
        // Revert the frontend state if the save failed
        setClasses(prev => prev.map(c => 
          c.id === id ? classItem : c
        ));
      });

      setLessonDueDateDialogOpen(false);
      setSelectedLessonsForDueDate([]);
      setDueDate('');
    }
  };

  // Handler: clear lesson due dates
  const handleClearLessonDueDates = () => {
    if (selectedLessonsForDueDate.length > 0) {
      console.log('Clearing due dates for lessons:', selectedLessonsForDueDate);
      console.log('Current classItem lessonDueDates:', classItem?.lessonDueDates);
      
      // Create a completely new object to ensure React detects the change
      const updatedClass = {
        ...classItem,
        lessonDueDates: { ...classItem.lessonDueDates }
      };

      // Remove due dates for selected lessons
      selectedLessonsForDueDate.forEach(lesson => {
        delete updatedClass.lessonDueDates[lesson];
      });

      console.log('Updated class lessonDueDates:', updatedClass.lessonDueDates);

      // Update frontend state immediately with a new array reference
      setClasses(prev => {
        const newClasses = prev.map(c => 
          c.id === id ? updatedClass : c
        );
        console.log('New classes state:', newClasses.find(c => c.id === id)?.lessonDueDates);
        return newClasses;
      });

      // Save to backend
      fetch(`http://localhost:3001/classes/${id}/due-dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          lessonDueDates: updatedClass.lessonDueDates 
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Successfully cleared due dates:', data);
        console.log('Backend response class lessonDueDates:', data.class?.lessonDueDates);
        // Don't update the state again from backend response to avoid conflicts
        // The frontend state is already correct
      })
      .catch(error => {
        console.error('Error clearing due dates:', error);
        // Revert the frontend state if the save failed
        setClasses(prev => prev.map(c => 
          c.id === id ? classItem : c
        ));
      });

      setLessonDueDateDialogOpen(false);
      setSelectedLessonsForDueDate([]);
      setDueDate('');
    }
  };

  // Handler: close lesson due date dialog
  const handleCloseLessonDueDateDialog = () => {
    setLessonDueDateDialogOpen(false);
    setLessonDueDateStep(0);
    setSelectedLessonsForDueDate([]);
    setLessonDueDateSearch('');
    setDueDate('');
  };

  // Force re-render when classes state changes
  React.useEffect(() => {
    // This will force the component to re-render when classes state changes
  }, [classes]);

  // Add a dummy state to force re-render
  const [forceRerender, setForceRerender] = React.useState(0);

  // Add state for scroll tracking
  const [scrolledToBottom, setScrolledToBottom] = React.useState(false);
  const competencyDialogContentRef = React.useRef<HTMLDivElement>(null);

  // Handler for scroll event
  const handleCompetencyDialogScroll = () => {
    const el = competencyDialogContentRef.current;
    if (!el) return;
    // Allow a small threshold for 'at bottom'
    const threshold = 16;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      setScrolledToBottom(true);
    } else {
      setScrolledToBottom(false);
    }
  };

  // Reset scroll state when dialog opens and check if scrolling is needed
  React.useEffect(() => {
    if (competencyConfirmationOpen) {
      setScrolledToBottom(false);
      setTimeout(() => {
        if (competencyDialogContentRef.current) {
          const el = competencyDialogContentRef.current;
          el.scrollTop = 0;
          
          // Check if content is short enough that no scrolling is needed
          if (el.scrollHeight <= el.clientHeight) {
            setScrolledToBottom(true);
          }
        }
      }, 0);
    }
  }, [competencyConfirmationOpen]);

  if (!classItem) {
    // If classes array is empty, show loading state (data is still being fetched)
    if (classes.length === 0) {
      return (
        <Layout
          breadcrumbs={[
            <Link component={RouterLink} underline="hover" color="inherit" to="/" key="classes" sx={{ fontWeight: 600, fontSize: 18 }}>Classes</Link>,
            <Typography color="text.primary" key="current" sx={{ fontWeight: 600, fontSize: 18 }}>Loading...</Typography>
          ]}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
            <Typography sx={{ fontSize: 18, color: '#666' }}>Loading class details...</Typography>
          </Box>
        </Layout>
      );
    }
    // If classes array has data but class not found, show "Class not found"
    return <Box sx={{ p: 4 }}><Typography>Class not found.</Typography></Box>;
  }

  // Calculate grid minWidth
  const gridMinWidth = 180 + 8 + selectedLessons.length * 44 + 150;

  const exportToExcel = () => {
    // Get the student data
    let peopleInClass = isStaffParticipantClass
      ? staff.filter((person: any) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(person.userID))
      : students.filter((student: Student) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(student.userID));

    // Sort by last name
    peopleInClass.sort((a, b) => {
      const lastNameA = a.name.split(' ').pop()?.toLowerCase() || '';
      const lastNameB = b.name.split(' ').pop()?.toLowerCase() || '';
      return lastNameA.localeCompare(lastNameB);
    });

    const studentData = peopleInClass
      .map(student => {
        if (!student) return null;
        
        // Create row data with student name and progress for each lesson
        const rowData = {
          Name: student.name,
        };
        
        // Add progress for each selected lesson
        selectedLessons.forEach(lesson => {
          const progressObj = student.progress?.[lesson];
          const progress = typeof progressObj === 'object' && progressObj !== null ? progressObj.progress : (progressObj || 0);
          const competent = typeof progressObj === 'object' && progressObj !== null && !!progressObj.competent;
          const completionDate = typeof progressObj === 'object' && progressObj !== null ? progressObj.completionDate : undefined;
          const competencyDate = typeof progressObj === 'object' && progressObj !== null ? progressObj.competencyDate : undefined;

          let status;
          if (competent) {
            status = 'Competent';
          } else if (progress === 100) {
            status = 'Completed';
          } else if (progress > 0) {
            status = 'Started';
          } else {
            status = 'Not started';
          }
          
          // Add status column
          rowData[lesson] = status;
          
          // Add completion date column if there's a completion date
          rowData[`${lesson} - Completion Date`] = completionDate ? new Date(completionDate).toLocaleDateString('en-AU') : '';
          
          // Add competency date column if there's a competency date
          rowData[`${lesson} - Competency Date`] = competencyDate ? new Date(competencyDate).toLocaleDateString('en-AU') : '';
        });
        
        return rowData;
      })
      .filter(Boolean as any);

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(studentData as any[]);

    // Set column widths - make date columns narrower
    const colWidths = [
      { wch: 30 }, // Name column
    ];
    
    selectedLessons.forEach(lesson => {
      colWidths.push({ wch: 15 }); // Status column
      // Check if any student has completion or competency dates for this lesson
      const hasCompletionDate = studentData.some((row: any) => row[`${lesson} - Completion Date`]);
      const hasCompetencyDate = studentData.some((row: any) => row[`${lesson} - Competency Date`]);
      
      if (hasCompletionDate) {
        colWidths.push({ wch: 12 }); // Completion date column
      }
      if (hasCompetencyDate) {
        colWidths.push({ wch: 12 }); // Competency date column
      }
    });
    
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
      // For each selected student/staff and lesson, reset progress
      const updatePromises = selectedStudentsForReset.map(studentId => {
        const person = isStaffParticipantClass
          ? staff.find(s => s.userID === studentId)
          : students.find(s => s.userID === studentId);
        if (!person) return Promise.resolve();

        const newProgress = { ...person.progress };
        selectedLessonsToReset.forEach(lesson => {
          newProgress[lesson] = { progress: 0, competent: false };
        });

        // Update backend
        const endpoint = isStaffParticipantClass
          ? `http://localhost:3001/staff/${studentId}/progress`
          : `http://localhost:3001/students/${studentId}/progress`;
        const updateState = isStaffParticipantClass ? setStaff : setStudents;

        return fetch(endpoint, {
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
            updateState(prev => prev.map(p =>
              p.userID === studentId ? { ...p, progress: newProgress } : p
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
          console.error('Error resetting progress:', error);
          // You might want to show an error message to the user here
        });
    }
  };

  // Update the reset confirmation dialog to use the new handler
  const handleResetConfirmation = () => {
    if (studentToResetAchievement) {
      const newProgress = { ...studentToResetAchievement.progress };
      selectedLessonsToReset.forEach(lesson => {
        newProgress[lesson] = { progress: 0, competent: false };
      });

      const isStaff = isStaffParticipantClass;
      const endpoint = isStaff
        ? `http://localhost:3001/staff/${studentToResetAchievement.userID}/progress`
        : `http://localhost:3001/students/${studentToResetAchievement.userID}/progress`;
      const updateState = isStaff ? setStaff : setStudents;

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress }),
      })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          updateState(prev =>
            prev.map(p =>
              p.userID === studentToResetAchievement.userID ? { ...p, progress: newProgress } : p
            )
          );
          setResetConfirmationOpen(false);
          setResetAchievementDialogOpen(false);
          setSelectedLessonsToReset([]);
          setStudentToResetAchievement(null);
        })
        .catch(error => {
          console.error('Error resetting progress:', error);
        });
    } else {
      // Bulk reset
      handleResetAchievement();
    }
  };

  return (
    <Layout
      key={`class-${id}-${JSON.stringify(classItem?.lessonDueDates || {})}`}
      breadcrumbs={[
        <Link component={RouterLink} underline="hover" color="inherit" to="/" key="classes" sx={{ fontWeight: 600, fontSize: 18 }}>Classes</Link>,
        <Typography color="text.primary" key="current" sx={{ fontWeight: 600, fontSize: 18 }}>{classItem?.className || 'Loading...'}</Typography>
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
                  {!isStaffParticipantClass && classItem?.yearLevels?.filter(Boolean).map((y: number) => `Year ${y}`).join(', ')}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 22, color: '#374151', lineHeight: 1.1 }}>{classItem?.className}</Typography>
                {/* Teacher(s) line below course name */}
                {classItem?.teachers && Array.isArray(classItem.teachers) && classItem.teachers.length > 0 && (
                  <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 14, fontFamily: 'Montserrat, sans-serif', mt: 0.5 }}>
                    Teacher{classItem.teachers.length > 1 ? 's' : ''}: {classItem.teachers
                      .map((userID: string) => {
                        const staffMember = staff.find((s: any) => s.userID === userID);
                        return staffMember ? (
                          <Link
                            key={userID}
                            component={RouterLink}
                            to={`/staff/${userID}`}
                            sx={{
                              color: colors.primary,
                              textDecoration: 'none',
                              fontWeight: 600,
                              '&:hover': {
                                textDecoration: 'underline',
                                color: colors.primaryHover
                              }
                            }}
                          >
                            {staffMember.name}
                          </Link>
                        ) : userID;
                      })
                      .filter(Boolean)
                      .reduce((prev: any, curr: any, index: number) => [
                        ...prev,
                        index > 0 && ', ',
                        curr
                      ], [])}
                  </Typography>
                )}
              </Paper>
              <Paper elevation={1} sx={{ flex: 1, px: 3, py: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 70, position: 'relative' }}>
                                              <IconButton
                                size="small"
                                sx={{ position: 'absolute', top: 6, right: 6, color: colors.iconPrimary }}
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
                        {classItem?.classCode}
                      </Typography>
                    </Box>
                  </DialogContent>
                  <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button onClick={() => setShowCodeDialog(false)} {...buttonStyles.primary}>
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
                <Typography sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#374151', fontSize: 18 }}>Code: <span style={{ fontWeight: 700 }}>{classItem?.classCode}</span></Typography>
              </Paper>
              <Paper elevation={1} sx={{ flex: 1, px: 3, py: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 70 }}>
                <Typography sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#374151', fontSize: 18 }}>Room: <span style={{ fontWeight: 700 }}>{classItem?.room || '—'}</span></Typography>
              </Paper>
            </Box>
            <div style={{ height: 12 }} />
            
            {/* Lessons Section */}
            <div ref={lessonsRef}>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'left' }}>Lessons</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<EventIcon />}
                      onClick={handleOpenLessonDueDateDialog}
                      {...buttonStyles.secondary}
                    >
                      Set Lesson Due Date
                    </Button>
                    <Button
                      startIcon={<LibraryBooksIcon />}
                      onClick={() => setSelectLessonsOpen(true)}
                      {...buttonStyles.primary}
                    >
                      Select Lessons
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: colors.containerPaper, borderRadius: 2, p: 2, border: `1px solid ${colors.border}` }}>
                  {selectedLessons.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {sortLessonsByPageOrder([...selectedLessons], lessons).map((lessonName) => {
                        const lessonInfo = lessons.find(l => l.name === lessonName);
                        const classStudentIds = Array.isArray(classItem?.studentIds) ? classItem?.studentIds.map(String) : [];
                        const classPeople = isStaffParticipantClass
                          ? staff.filter((person: any) => classStudentIds.includes(person.userID))
                          : students.filter((student: Student) => classStudentIds.includes(student.userID));
                        const total = classPeople.length;
                        let complete = 0, inProgress = 0, incomplete = 0, competent = 0;
                        const completeNames: string[] = [];
                        const inProgressNames: string[] = [];
                        const incompleteNames: string[] = [];
                        const competentNames: string[] = [];
                        classPeople.forEach(person => {
                          const progressObj = person.progress?.[lessonName];
                          const val = typeof progressObj === 'object' && progressObj !== null ? progressObj.progress : (progressObj || 0);
                          const isCompetent = typeof progressObj === 'object' && progressObj !== null && !!progressObj.competent;
                          
                          if (isCompetent) {
                            competent++;
                            competentNames.push(person.name);
                          } else if (val === 100) {
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
                            key={`${lessonName}-${JSON.stringify(classItem?.lessonDueDates?.[lessonName] || 'no-date')}`}
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
                                color: colors.iconPrimary,
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
                              {/* Custom 4-segment progress bar */}
                              <Box sx={{ display: 'flex', width: 200, height: 14, borderRadius: 4, overflow: 'hidden', boxShadow: 0, border: '1px solid #e0e7ff', bgcolor: '#e0e7ff', ml: 'auto' }}>
                                {/* Competent */}
                                <Tooltip title={
                                  <Box sx={{ fontSize: '1rem' }}>
                                    <strong>Competent</strong><br />
                                    {competent > 0 ? competentNames.map((name, i) => <div key={i}>{name}</div>) : <div>No participants</div>}
                                  </Box>
                                } arrow enterDelay={1000}>
                                  <Box sx={{
                                    width: `${(competent / total) * 100}%`,
                                    transition: 'width 0.3s',
                                    bgcolor: '#43a047',
                                    '&:hover': { bgcolor: '#2e7031' },
                                    height: '100%',
                                    cursor: competent > 0 ? 'pointer' : 'default',
                                  }} />
                                </Tooltip>
                                {/* Complete */}
                                <Tooltip title={
                                  <Box sx={{ fontSize: '1rem' }}>
                                    <strong>Completed</strong><br />
                                    {complete > 0 ? completeNames.map((name, i) => <div key={i}>{name}</div>) : <div>No participants</div>}
                                  </Box>
                                } arrow enterDelay={1000}>
                                  <Box sx={{
                                    width: `${(complete / total) * 100}%`,
                                    transition: 'width 0.3s',
                                    bgcolor: colors.primary,
                                    '&:hover': { bgcolor: colors.primaryHover },
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
                                } arrow enterDelay={1000}>
                                  <Box sx={{
                                    width: `${(inProgress / total) * 100}%`,
                                    transition: 'width 0.3s',
                                    bgcolor: colors.secondary,
                                    '&:hover': { bgcolor: colors.secondaryHover },
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
                                } arrow enterDelay={1000}>
                                  <Box sx={{
                                    width: `${(incomplete / total) * 100}%`,
                                    transition: 'width 0.3s',
                                    bgcolor: colors.border,
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
                                {competent === total ? '100%' : `${Math.round(((competent + complete) / total) * 100)}%`}
                              </Typography>
                              {/* Due Date Display */}
                              {classItem?.lessonDueDates?.[lessonName] && (
                                <Typography 
                                  sx={{ 
                                    fontWeight: 500,
                                    color: '#666',
                                    fontSize: 12,
                                    minWidth: 80,
                                    textAlign: 'right',
                                    pr: 1
                                  }}
                                >
                                  Due: {new Date(classItem.lessonDueDates[lessonName]).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit'
                                  }).replace(/\//g, '.')}
                                </Typography>
                              )}
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
                  <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Select Lessons</DialogTitle>
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
                        
                        // Sort lessons within each group according to lessons page order
                        Object.keys(grouped).forEach(subArea => {
                          grouped[subArea] = sortLessonsByPageOrder(
                            grouped[subArea].map(l => l.name), 
                            lessons
                          ).map(lessonName => 
                            lessons.find(l => l.name === lessonName)
                          ).filter(Boolean) as typeof lessons;
                        });
                        
                        // Sort sub-areas according to lessons page order
                        const industrialSubAreas = [
                          'Workshop Safety',
                          'Multiuse Workshop Equipment',
                          'Metalworking',
                          'Woodworking',
                          'Painting & Finishing',
                          'Heating & Forming'
                        ];
                        
                        const sortedSubAreas = Object.keys(grouped).sort((a, b) => {
                          // For Industrial area, sort by predefined sub-area order
                          if (area === 'Industrial') {
                            const indexA = industrialSubAreas.indexOf(a);
                            const indexB = industrialSubAreas.indexOf(b);
                            // Put 'Other' at the end
                            if (a === 'Other') return 1;
                            if (b === 'Other') return -1;
                            // Sort by predefined order
                            if (indexA !== -1 && indexB !== -1) {
                              return indexA - indexB;
                            }
                            // If not in predefined list, put at the end
                            if (indexA === -1 && indexB === -1) return 0;
                            if (indexA === -1) return 1;
                            if (indexB === -1) return -1;
                          }
                          // For other areas, just sort alphabetically
                          return a.localeCompare(b);
                        });
                        
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
                            {sortedSubAreas.map((sub) => (
                              <Box key={sub}>
                                <Typography sx={{ fontWeight: 600, color: '#374151', fontFamily: 'Montserrat, sans-serif', mb: 1, fontSize: 16 }}>{sub}</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {grouped[sub].map((lesson) => (
                                    <Box key={lesson.id || lesson.name} sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }, cursor: 'pointer' }}
                                      onClick={() => handleLessonToggle(lesson.name)}
                                    >
                                      <Checkbox
                                        checked={selectedLessons.includes(lesson.name)}
                                        onChange={() => handleLessonToggle(lesson.name)}
                                        onClick={e => e.stopPropagation()}
                                        color="primary"
                                      />
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ color: colors.iconPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
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
                      startIcon={<VerifiedIcon />}
                      onClick={handleOpenCompetencyDialog}
                      {...buttonStyles.secondary}
                    >
                      Record {isStaffParticipantClass ? 'Participant' : 'Student'} Competency
                    </Button>
                    <Button
                      startIcon={<RestorePageIcon />}
                      onClick={() => {
                        setSelectedStudentsForReset([]);
                        setBulkResetDialogOpen(true);
                        setBulkResetStudentSearch('');
                        setBulkResetLessonSearch('');
                      }}
                      {...buttonStyles.secondary}
                    >
                      Reset Lesson Achievement
                    </Button>
                    <Button
                      startIcon={<GroupIcon />}
                      onClick={handleOpenAddStudentDialog}
                      {...buttonStyles.primary}
                    >
                      {isStaffParticipantClass ? 'Select Participants' : 'Select Students'}
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: colors.containerPaper, borderRadius: 2, p: 2, border: `1px solid ${colors.border}` }}>
                  {(() => {
                    let filtered = isStaffParticipantClass
                      ? staff.filter((person: any) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(person.userID))
                      : students.filter((student: Student) => Array.isArray(classItem.studentIds) && classItem.studentIds.includes(student.userID));

                    // Sort by last name
                    filtered.sort((a, b) => {
                      const lastNameA = a.name.split(' ').pop()?.toLowerCase() || '';
                      const lastNameB = b.name.split(' ').pop()?.toLowerCase() || '';
                      return lastNameA.localeCompare(lastNameB);
                    });
                    
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
                            gridTemplateColumns: `180px${selectedLessons.length > 0 ? ` repeat(${selectedLessons.length}, 44px)` : ''} 150px`,
                            minWidth: selectedLessons.length > 0 ? gridMinWidth : 180 + 8 + 150,
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
                          {selectedLessons.length > 0 && sortLessonsByPageOrder([...selectedLessons], lessons).map((lesson, idx) => {
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
                                <Tooltip title={lesson} arrow enterDelay={500}>
                                  <Box sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 44, height: 44, color: colors.iconPrimary, fontSize: 28
                                  }}>
                                    {lessonIcons[lessonInfo?.icon || 'Build']}
                                  </Box>
                                </Tooltip>
                              </Box>
                            );
                          })}
                          {/* Actions column (sticky right) */}
                          <Box
                            sx={{
                              width: 150, minWidth: 150, maxWidth: 150,
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
                        {filtered.map((person: any, idx: number) => {
                          // Debug log to verify up-to-date state
                          console.log('Rendering person in grid:', person);
                          return (
                            <Box
                              key={person.userID}
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: `180px${selectedLessons.length > 0 ? ` repeat(${selectedLessons.length}, 44px)` : ''} 150px`,
                                minWidth: selectedLessons.length > 0 ? gridMinWidth : 180 + 8 + 150,
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
                              <Tooltip title={`See ${person.name.split(' ')[0]}'s profile`} arrow enterDelay={1000}>
                                <Box
                                  component="div"
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
                                    cursor: 'pointer',
                                    '&:hover': {
                                      boxShadow: '3px 3px 6px rgba(0,0,0,0.12)',
                                      borderColor: colors.primary,
                                      bgcolor: '#f0f9ff'
                                    }
                                  }}
                                  onClick={() => navigate(isStaffParticipantClass ? `/staff/${person.userID}` : `/students/${person.id}`)}
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
                                      '&:hover': {
                                        color: colors.primary
                                      }
                                    }}
                                  >
                                    {person.name}
                                  </Typography>
                                </Box>
                              </Tooltip>
                              {/* Progress icons (only if lessons) */}
                              {selectedLessons.length > 0 && sortLessonsByPageOrder([...selectedLessons], lessons).map((lesson: string, idx: number) => {
                                const progressObj = person.progress?.[lesson];
                                const val = typeof progressObj === 'object' ? progressObj.progress : progressObj || 0;
                                const competent = typeof progressObj === 'object' ? progressObj.competent : false;
                                const completionDate = typeof progressObj === 'object' ? progressObj.completionDate : undefined;
                                const competencyDate = typeof progressObj === 'object' ? progressObj.competencyDate : undefined;
                                
                                // Format dates for display
                                const formatDate = (dateString: string) => {
                                  if (!dateString) return '';
                                  const date = new Date(dateString);
                                  return date.toLocaleDateString('en-AU', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  });
                                };
                                
                                // Build tooltip content as a Box for multi-line
                                let tooltipContent = (
                                  <Box>
                                    <div><b>{lesson}:</b> {competent ? 'Competent' : val === 100 ? 'Completed' : val > 0 ? `In progress (${val}%)` : 'Not started'}</div>
                                    {competent && competencyDate && (
                                      <div>Competency achieved: {formatDate(competencyDate)}</div>
                                    )}
                                    {val === 100 && completionDate && (!competent || completionDate !== competencyDate) && (
                                      <div>Completed: {formatDate(completionDate)}</div>
                                    )}
                                  </Box>
                                );
                                
                                let icon;
                                if (competent) {
                                  icon = (
                                    <Tooltip title={tooltipContent} arrow enterDelay={500}>
                                      <VerifiedIcon sx={{ color: '#43a047', fontSize: 28, display: 'block', margin: 'auto', transition: 'color 0.2s', '&:hover': { color: '#2e7031' } }} />
                                    </Tooltip>
                                  );
                                } else if (val === 100) {
                                  icon = (
                                    <Tooltip title={tooltipContent} arrow enterDelay={500}>
                                      <CheckCircleIcon sx={{ color: colors.iconPrimary, fontSize: 28, display: 'block', margin: 'auto', transition: 'color 0.2s', '&:hover': { color: colors.primaryHover } }} />
                                    </Tooltip>
                                  );
                                } else if (val > 0) {
                                  icon = (
                                    <Tooltip title={tooltipContent} arrow enterDelay={500}>
                                      <RadioButtonCheckedIcon sx={{ color: colors.iconPrimary, fontSize: 28, display: 'block', margin: 'auto', transition: 'color 0.2s', '&:hover': { color: colors.primaryHover } }} />
                                    </Tooltip>
                                  );
                                } else {
                                  icon = (
                                    <Tooltip title={tooltipContent} arrow enterDelay={500}>
                                      <RadioButtonUncheckedIcon sx={{ color: '#b0b0b0', fontSize: 28, display: 'block', margin: 'auto', transition: 'color 0.2s', '&:hover': { color: '#7ed6df' } }} />
                                    </Tooltip>
                                  );
                                }
                                return (
                                  <Box
                                    key={lesson}
                                    sx={{
                                      width: 44, minWidth: 44, maxWidth: 44,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      border: `1px solid ${colors.border}`,
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
                                  width: 150, minWidth: 150, maxWidth: 150,
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
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title={`Record competency for ${person.name}`} arrow enterDelay={1000}>
                                    <IconButton
                                      size="small"
                                      sx={{ color: colors.iconPrimary }}
                                      onClick={() => handleOpenIndividualCompetencyDialog(person)}
                                      aria-label="Record competency"
                                    >
                                      <VerifiedIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={`Reset ${person.name}'s lesson achievement`} arrow enterDelay={1000}>
                                    <IconButton
                                      size="small"
                                      sx={{ color: colors.iconPrimary }}
                                      onClick={() => {
                                        setStudentToResetAchievement(person);
                                        setSelectedLessonsToReset([]);
                                        setResetAchievementDialogOpen(true);
                                        setResetAchievementLessonSearch('');
                                      }}
                                      aria-label="Reset achievement"
                                    >
                                      <RestorePageIcon />
                                    </IconButton>
                                  </Tooltip>
                                  {!isStaffParticipantClass && (
                                    <Tooltip title="Reset password" arrow enterDelay={1000}>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setStudentToReset(person);
                                          setResetDialogOpen(true);
                                        }}
                                        sx={{ color: colors.iconPrimary }}
                                      >
                                        <LockResetIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  <Tooltip title={isStaffParticipantClass ? `Remove participant from class` : `Remove student from class`} arrow enterDelay={1000}>
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
                          );
                        })}
                      </Box>
                    );
                  })()}
                </Box>
                {/* Download Progress Button at bottom */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    startIcon={<AssignmentTurnedInIcon />}
                    onClick={() => setDownloadConfirmationOpen(true)}
                    {...buttonStyles.primary}
                    size="large"
                  >
                    Download Progress Report
                  </Button>
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
          sx: { maxWidth: 400, width: 400, height: 500 }
        }}
      >
                    <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>{isStaffParticipantClass ? 'Select Participants' : 'Select Students'}</DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fff', px: 3, pt: 1, pb: 2, borderBottom: '1px solid #e0e7ff' }}>
            <TextField
              fullWidth
              placeholder={isStaffParticipantClass ? 'Search staff by name or user ID' : 'Search students by name or user ID'}
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              size="small"
            />
          </Box>
          <Box sx={{ overflowY: 'auto', maxHeight: 400, p: 3, pt: 2 }}>
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
                    onClick={e => e.stopPropagation()}
                    color="primary"
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStudentDialogOpen(false)} {...buttonStyles.cancel}>
            Cancel
          </Button>
          <Button onClick={handleAddStudentsToClass} {...buttonStyles.primary} disabled={selectedStudentIds.length === 0}>
            {isStaffParticipantClass ? 'Save Changes' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Achievement Dialog */}
      <Dialog 
        open={resetAchievementDialogOpen} 
        onClose={() => setResetAchievementDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { maxWidth: 500, width: 500, height: 600 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', pb: 1 }}>
          Reset Achievements for {studentToResetAchievement?.name}
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {(() => {
            const searchedLessons = sortLessonsByPageOrder([...selectedLessons], lessons).filter(lesson => 
              lesson.toLowerCase().includes(resetAchievementLessonSearch.toLowerCase())
            );
            const allSearchedLessonsSelected = searchedLessons.length > 0 && searchedLessons.every(l => selectedLessonsToReset.includes(l));
            const someSearchedLessonsSelected = searchedLessons.length > 0 && searchedLessons.some(l => selectedLessonsToReset.includes(l)) && !allSearchedLessonsSelected;
            const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
                setSelectedLessonsToReset(Array.from(new Set([...selectedLessonsToReset, ...searchedLessons])));
              } else {
                setSelectedLessonsToReset(selectedLessonsToReset.filter(l => !searchedLessons.includes(l)));
              }
            };
            return (
              <>
                <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fff', px: 3, pt: 1, pb: 2, borderBottom: '1px solid #e0e7ff' }}>
                  <Typography sx={{ mb: 2, color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                    Select the lessons you want to reset achievements for:
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Search lessons"
                    value={resetAchievementLessonSearch}
                    onChange={e => setResetAchievementLessonSearch(e.target.value)}
                    size="small"
                  />
                  <Box sx={{ mt: 2, pl: 2.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allSearchedLessonsSelected}
                          indeterminate={someSearchedLessonsSelected}
                          onChange={handleSelectAll}
                          onClick={e => e.stopPropagation()}
                        />
                      }
                      label="Select All"
                    />
                  </Box>
                </Box>
                <Box sx={{ overflowY: 'auto', maxHeight: 400, p: 3, pt: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {searchedLessons.map((lesson) => (
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
                            setSelectedLessonsToReset(prev =>
                              prev.includes(lesson)
                                ? prev.filter(l => l !== lesson)
                                : [...prev, lesson]
                            );
                          }}
                          onClick={e => e.stopPropagation()}
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
                </Box>
              </>
            );
          })()}
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
        <DialogTitle sx={{ fontWeight: 600 }}>
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
                  mb: '0.5'
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
            onClick={handleResetConfirmation}
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
        PaperProps={{
          sx: { maxWidth: 500, width: 500, height: 600 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', pb: 1 }}>
          {isStaffParticipantClass ? 'Select participants' : 'Select students'}
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {(() => {
            const searchedStudents = sortedEnrolledPeople
              .filter(person => 
                person.name.toLowerCase().includes(bulkResetStudentSearch.toLowerCase())
              );

            const allSearchedStudentIds = searchedStudents.map(p => p.userID);
            const areAllSearchedSelected = searchedStudents.length > 0 && allSearchedStudentIds.every(id => selectedStudentsForReset.includes(id));
            const areSomeSearchedSelected = searchedStudents.length > 0 && allSearchedStudentIds.some(id => selectedStudentsForReset.includes(id)) && !areAllSearchedSelected;
            const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
                setSelectedStudentsForReset(Array.from(new Set([...selectedStudentsForReset, ...allSearchedStudentIds])));
              } else {
                setSelectedStudentsForReset(selectedStudentsForReset.filter(id => !allSearchedStudentIds.includes(id)));
              }
            };
            return (
              <>
                <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fff', px: 3, pt: 1, pb: 2, borderBottom: '1px solid #e0e7ff' }}>
                  <TextField
                    fullWidth
                    placeholder={isStaffParticipantClass ? 'Search participants by name' : 'Search students by name'}
                    value={bulkResetStudentSearch}
                    onChange={e => setBulkResetStudentSearch(e.target.value)}
                    size="small"
                  />
                  <Box sx={{ mt: 2, pl: 2.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={areAllSearchedSelected}
                          indeterminate={areSomeSearchedSelected}
                          onChange={handleSelectAll}
                          onClick={e => e.stopPropagation()}
                        />
                      }
                      label={isStaffParticipantClass ? 'Select All Participants' : 'Select All Students'}
                    />
                  </Box>
                </Box>
                <Box sx={{ overflowY: 'auto', maxHeight: 400, p: 3, pt: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {searchedStudents.map((person) => (
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
                            setSelectedStudentsForReset(prev =>
                              prev.includes(person.userID)
                                ? prev.filter(id => id !== person.userID)
                                : [...prev, person.userID]
                            );
                          }}
                          onClick={e => e.stopPropagation()}
                          color="primary"
                        />
                        <Typography sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {person.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            );
          })()}
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
        PaperProps={{
          sx: { maxWidth: 500, width: 500, height: 600 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', pb: 1 }}>
          Select lessons
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {(() => {
            const searchedLessons = sortLessonsByPageOrder([...selectedLessons], lessons).filter(lesson => 
              lesson.toLowerCase().includes(bulkResetLessonSearch.toLowerCase())
            );

            const allSearchedLessonsSelected = searchedLessons.length > 0 && searchedLessons.every(l => selectedLessonsToReset.includes(l));
            const someSearchedLessonsSelected = searchedLessons.length > 0 && searchedLessons.some(l => selectedLessonsToReset.includes(l)) && !allSearchedLessonsSelected;

            const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
                setSelectedLessonsToReset(Array.from(new Set([...selectedLessonsToReset, ...searchedLessons])));
              } else {
                setSelectedLessonsToReset(selectedLessonsToReset.filter(l => !searchedLessons.includes(l)));
              }
            };

            return <>
              <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fff', px: 3, pt: 1, pb: 2, borderBottom: '1px solid #e0e7ff' }}>
                <Typography sx={{ mb: 2, color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                  Select the lessons you want to reset achievements for {isStaffParticipantClass ? 'participants' : 'students'}:
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Search lessons"
                  value={bulkResetLessonSearch}
                  onChange={e => setBulkResetLessonSearch(e.target.value)}
                  size="small"
                />
                <Box sx={{ mt: 2, pl: 2.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allSearchedLessonsSelected}
                        indeterminate={someSearchedLessonsSelected}
                        onChange={handleSelectAll}
                        onClick={e => e.stopPropagation()}
                      />
                    }
                    label="Select All"
                  />
                </Box>
              </Box>
              <Box sx={{ overflowY: 'auto', maxHeight: 400, p: 3, pt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {searchedLessons.map((lesson) => (
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
                          setSelectedLessonsToReset(prev =>
                            prev.includes(lesson)
                              ? prev.filter(l => l !== lesson)
                              : [...prev, lesson]
                          );
                        }}
                        onClick={e => e.stopPropagation()}
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
              </Box>
            </>
          })()}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setBulkResetLessonDialogOpen(false);
              setBulkResetDialogOpen(true);
              setBulkResetStudentSearch('');
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
      <Dialog open={competencyDialogOpen} onClose={() => setCompetencyDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{
          sx: { maxWidth: 500, width: 500, height: 600 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', pb: 1 }}>
          {competencyStep === 0 ? (isStaffParticipantClass ? 'Select Participants' : 'Select Students') : 'Select Lessons/Equipment'}
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {competencyStep === 0 && (() => {
            const searchedStudents = sortedEnrolledPeople
              .filter(person => 
                person.name.toLowerCase().includes(competencyStudentSearch.toLowerCase())
              );
            
            const allSearchedStudentIds = searchedStudents.map(p => p.userID);
            const areAllSearchedSelected = searchedStudents.length > 0 && allSearchedStudentIds.every(id => selectedCompetencyStudents.includes(id));
            const areSomeSearchedSelected = searchedStudents.length > 0 && allSearchedStudentIds.some(id => selectedCompetencyStudents.includes(id)) && !areAllSearchedSelected;

            const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
                setSelectedCompetencyStudents(Array.from(new Set([...selectedCompetencyStudents, ...allSearchedStudentIds])));
              } else {
                setSelectedCompetencyStudents(selectedCompetencyStudents.filter(id => !allSearchedStudentIds.includes(id)));
              }
            };

            return <>
              <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fff', px: 3, pt: 1, pb: 2, borderBottom: '1px solid #e0e7ff' }}>
                <TextField
                  fullWidth
                  placeholder={isStaffParticipantClass ? 'Search participants by name' : 'Search students'}
                  value={competencyStudentSearch}
                  onChange={e => setCompetencyStudentSearch(e.target.value)}
                  size="small"
                />
                <Box sx={{ mt: 2, pl: 2.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={areAllSearchedSelected}
                        indeterminate={areSomeSearchedSelected}
                        onChange={handleSelectAll}
                        onClick={e => e.stopPropagation()}
                      />
                    }
                    label="Select All"
                  />
                </Box>
              </Box>
              <Box sx={{ overflowY: 'auto', maxHeight: 400, p: 3, pt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {searchedStudents.map(person => (
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
                        onClick={e => e.stopPropagation()}
                        color="primary"
                      />
                      <Typography sx={{ fontFamily: 'Montserrat, sans-serif' }}>{person.name}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          })()}
          {competencyStep === 1 && (() => {
            const searchedLessons = sortLessonsByPageOrder([...classLessons], lessons).filter(lesson => 
              lesson.toLowerCase().includes(competencyLessonSearch.toLowerCase())
            );

            const allSearchedLessonsSelected = searchedLessons.length > 0 && searchedLessons.every(l => selectedCompetencyLessons.includes(l));
            const someSearchedLessonsSelected = searchedLessons.length > 0 && searchedLessons.some(l => selectedCompetencyLessons.includes(l)) && !allSearchedLessonsSelected;

            const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
                // Allow selecting all lessons, regardless of completion status
                setSelectedCompetencyLessons(Array.from(new Set([...selectedCompetencyLessons, ...searchedLessons])));
              } else {
                setSelectedCompetencyLessons(selectedCompetencyLessons.filter(l => !searchedLessons.includes(l)));
              }
            };

            return <>
              <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fff', px: 3, pt: 1, pb: 2, borderBottom: '1px solid #e0e7ff' }}>
                <TextField
                  fullWidth
                  placeholder="Search lessons"
                  value={competencyLessonSearch}
                  onChange={e => setCompetencyLessonSearch(e.target.value)}
                  size="small"
                />
                <Box sx={{ mt: 2, pl: 2.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allSearchedLessonsSelected}
                        indeterminate={someSearchedLessonsSelected}
                        onChange={handleSelectAll}
                        onClick={e => e.stopPropagation()}
                      />
                    }
                    label="Select All"
                  />
                </Box>
              </Box>
              <Box sx={{ overflowY: 'auto', maxHeight: 400, p: 3, pt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {searchedLessons.map(lesson => {
                    // Count how many are already competent, eligible to be marked, or not eligible
                    let alreadyCompetent = 0;
                    let eligibleToMark = 0;
                    let notEligible = 0;
                    selectedCompetencyStudents.forEach(studentId => {
                      const person = isStaffParticipantClass 
                        ? staff.find(s => s.userID === studentId) 
                        : students.find(s => s.userID === studentId);
                      if (!person) return;
                      const progressObj = person.progress?.[lesson];
                      const progress = typeof progressObj === 'object' ? progressObj.progress : (progressObj || 0);
                      const competent = typeof progressObj === 'object' && progressObj?.competent === true;
                      if (competent) alreadyCompetent++;
                      else if (isStaffParticipantClass || progress === 100) eligibleToMark++;
                      else notEligible++;
                    });
                    const total = selectedCompetencyStudents.length;
                    const isSelected = selectedCompetencyLessons.includes(lesson);

                    // Tooltip message
                    let tooltipMsg = '';
                    if (eligibleToMark > 0) {
                      tooltipMsg = `Will mark ${eligibleToMark} of ${total} ${isStaffParticipantClass ? 'staff' : 'students'} as competent. Already competent: ${alreadyCompetent}. ${isStaffParticipantClass ? '' : 'Not completed: ' + notEligible + '.'}`;
                    } else if (alreadyCompetent > 0) {
                      tooltipMsg = `All selected ${isStaffParticipantClass ? 'staff' : 'students'} already marked as competent${isStaffParticipantClass ? '' : ' or have not completed'}. Already competent: ${alreadyCompetent}.${isStaffParticipantClass ? '' : ' Not completed: ' + notEligible + '.'}`;
                    } else {
                      tooltipMsg = `No selected ${isStaffParticipantClass ? 'staff' : 'students'} ${isStaffParticipantClass ? 'are eligible' : 'have completed this lesson yet'}.${isStaffParticipantClass ? '' : ' Not completed: ' + notEligible + '.'}`;
                    }

                    return (
                      <Tooltip 
                        title={tooltipMsg}
                        arrow enterDelay={1000}
                      >
                        <Box
                          key={lesson}
                          sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }, cursor: 'pointer', opacity: 1 }}
                          onClick={() => {
                            setSelectedCompetencyLessons(prev =>
                              prev.includes(lesson)
                                ? prev.filter(l => l !== lesson)
                                : [...prev, lesson]
                            );
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={e => {
                              e.stopPropagation();
                              setSelectedCompetencyLessons(prev =>
                                prev.includes(lesson)
                                  ? prev.filter(l => l !== lesson)
                                  : [...prev, lesson]
                              );
                            }}
                            onClick={e => e.stopPropagation()}
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
                            <Typography sx={{ 
                              fontFamily: 'Montserrat, sans-serif',
                            }}>
                              {lesson}
                            </Typography>
                            {/* Show (eligibleToMark/total) in orange if not all, green if all */}
                            {eligibleToMark > 0 && (
                              <Typography sx={{ 
                                fontSize: 12,
                                color: eligibleToMark === total ? '#43a047' : '#ff9800',
                                fontWeight: 500
                              }}>
                                ({eligibleToMark}/{total})
                              </Typography>
                            )}
                            {/* Show already competent count if any */}
                            {alreadyCompetent > 0 && (
                              <Typography sx={{ 
                                fontSize: 12,
                                color: '#43a047',
                                fontWeight: 500,
                                ml: 1
                              }}>
                                ✓{alreadyCompetent}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            </>
          })()}
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
              {...buttonStyles.primary}
              disabled={selectedCompetencyLessons.length === 0}
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Individual Competency Dialog */}
      <Dialog open={individualCompetencyDialogOpen} onClose={() => setIndividualCompetencyDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{
          sx: { maxWidth: 500, width: 500, height: 600 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', pb: 1 }}>
          Record Competency for {selectedIndividualStudent?.name}
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {(() => {
            const searchedLessons = sortLessonsByPageOrder([...classLessons], lessons).filter(lesson => 
              lesson.toLowerCase().includes(individualCompetencyLessonSearch.toLowerCase())
            );
            
            // Get eligible lessons (those that can be selected)
            const eligibleLessons = searchedLessons.filter(lesson => {
              if (!selectedIndividualStudent) return false;
              const progressObj = selectedIndividualStudent.progress?.[lesson];
              const progress = typeof progressObj === 'object' ? progressObj.progress : (progressObj || 0);
              const isCompetent = typeof progressObj === 'object' && progressObj?.competent === true;
              const isCompleted = progress === 100;
              // For staff, allow marking as competent regardless of completion
              return isStaffParticipantClass
                ? !isCompetent
                : isCompleted && !isCompetent;
            });
            
            const allEligibleLessonsSelected = eligibleLessons.length > 0 && eligibleLessons.every(l => selectedIndividualLessons.includes(l));
            const someEligibleLessonsSelected = eligibleLessons.length > 0 && eligibleLessons.some(l => selectedIndividualLessons.includes(l)) && !allEligibleLessonsSelected;
            
            const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
                // Select all eligible lessons
                setSelectedIndividualLessons(Array.from(new Set([...selectedIndividualLessons, ...eligibleLessons])));
              } else {
                // Deselect all searched lessons
                setSelectedIndividualLessons(selectedIndividualLessons.filter(l => !searchedLessons.includes(l)));
              }
            };
            return (
              <>
                <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fff', px: 3, pt: 1, pb: 2, borderBottom: '1px solid #e0e7ff' }}>
                  <Typography sx={{ mb: 2, color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                    Select the lessons/equipment you want to record competency for:
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Search lessons"
                    value={individualCompetencyLessonSearch}
                    onChange={e => setIndividualCompetencyLessonSearch(e.target.value)}
                    size="small"
                  />
                  <Box sx={{ mt: 2, pl: 2.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allEligibleLessonsSelected}
                          indeterminate={someEligibleLessonsSelected}
                          onChange={handleSelectAll}
                          onClick={e => e.stopPropagation()}
                        />
                      }
                      label="Select All"
                    />
                  </Box>
                </Box>
                <Box sx={{ overflowY: 'auto', maxHeight: 400, p: 3, pt: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {searchedLessons.map(lesson => {
                      const progressObj = selectedIndividualStudent?.progress?.[lesson];
                      const progress = typeof progressObj === 'object' ? progressObj.progress : (progressObj || 0);
                      const isCompetent = typeof progressObj === 'object' && progressObj?.competent === true;
                      const isCompleted = progress === 100;
                      // For staff, allow marking as competent regardless of completion
                      const isDisabled = isStaffParticipantClass
                        ? isCompetent
                        : !isCompleted || isCompetent;
                      const isSelected = selectedIndividualLessons.includes(lesson);

                      return (
                        <Tooltip 
                          title={
                            isStaffParticipantClass
                              ? (isCompetent
                                  ? 'Already marked as competent'
                                  : 'Click to select for competency marking')
                              : (!isCompleted
                                  ? 'Student must first complete the lesson before being marked as competent'
                                  : isCompetent
                                    ? 'Student is already marked as competent for this lesson'
                                    : 'Click to select for competency marking')
                          } 
                          arrow enterDelay={1000}
                          key={lesson}
                        >
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, '&:hover': { bgcolor: isDisabled ? 'transparent' : 'rgba(0,0,0,0.04)' }, cursor: isDisabled ? 'default' : 'pointer', opacity: isDisabled ? 0.6 : 1 }}
                            onClick={() => {
                              if (isDisabled) return;
                              setSelectedIndividualLessons(prev =>
                                prev.includes(lesson)
                                  ? prev.filter(l => l !== lesson)
                                  : [...prev, lesson]
                              );
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={e => {
                                e.stopPropagation();
                                if (isDisabled) return;
                                setSelectedIndividualLessons(prev =>
                                  prev.includes(lesson)
                                    ? prev.filter(l => l !== lesson)
                                    : [...prev, lesson]
                                );
                              }}
                              onClick={e => e.stopPropagation()}
                              color="primary"
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ color: isDisabled ? '#ccc' : '#4ecdc4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                {lessonIcons[lesson]}
                              </Box>
                              <Typography sx={{ fontFamily: 'Montserrat, sans-serif', color: isDisabled ? '#999' : 'inherit' }}>{lesson}</Typography>
                            </Box>
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              </>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIndividualCompetencyDialogOpen(false)}
            {...buttonStyles.cancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRecordIndividualCompetency}
            {...buttonStyles.primary}
            disabled={selectedIndividualLessons.length === 0}
          >
            Record Competency
          </Button>
        </DialogActions>
      </Dialog>

      {/* Competency Confirmation Dialog */}
      {competencyConfirmationDetails && (
        <Dialog open={competencyConfirmationOpen} onClose={() => setCompetencyConfirmationOpen(false)} maxWidth="md">
          <DialogTitle sx={{ fontWeight: 600 }}>
            Competency Declaration
          </DialogTitle>
          <DialogContent
            ref={competencyDialogContentRef}
            onScroll={handleCompetencyDialogScroll}
            sx={{ maxHeight: 500, overflowY: 'auto' }}
          >
            <Typography sx={{ mb: 2 }}>
              Would you like to record competency for the selected students in the following lessons?
            </Typography>
            
            {/* Show which students will be marked as competent for each lesson */}
            <Box sx={{ mb: 2 }}>
              {competencyConfirmationDetails.lessonNames.map(lesson => {
                let eligibleIds: string[] = [];
                if (isStaffParticipantClass) {
                  // For staff, all not already competent
                  eligibleIds = competencyConfirmationDetails.studentIds.filter(studentId => {
                    const person = staff.find(s => s.userID === studentId);
                    if (!person) return false;
                    const progressObj = person.progress?.[lesson];
                    const isCompetent = typeof progressObj === 'object' && progressObj?.competent === true;
                    return !isCompetent;
                  });
                } else {
                  // For students, must have completed and not already competent
                  eligibleIds = competencyConfirmationDetails.studentIds.filter(studentId => {
                    const person = students.find(s => s.userID === studentId);
                    if (!person) return false;
                    const progressObj = person.progress?.[lesson];
                    const progress = typeof progressObj === 'object' ? progressObj.progress : (progressObj || 0);
                    const isCompetent = typeof progressObj === 'object' && progressObj?.competent === true;
                    return progress === 100 && !isCompetent;
                  });
                }
                const eligibleNames = eligibleIds.map(studentId => {
                  const person = isStaffParticipantClass
                    ? staff.find(s => s.userID === studentId)
                    : students.find(s => s.userID === studentId);
                  return person ? person.name : 'Unknown';
                });
                const total = competencyConfirmationDetails.studentIds.length;
                const willBeCompetent = eligibleIds.length;
                return (
                  <Box key={lesson} sx={{ mb: 1, p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: '#374151', mb: 0.5 }}>
                      {lesson}
                    </Typography>
                    {willBeCompetent > 0 ? (
                      <Typography sx={{ fontSize: '0.875rem', color: '#43a047' }}>
                        ✓ {willBeCompetent} of {total} {isStaffParticipantClass ? 'staff' : 'students'} will be marked as competent: {eligibleNames.join(', ')}
                      </Typography>
                    ) : (
                      <Typography sx={{ fontSize: '0.875rem', color: '#ff9800' }}>
                        ⚠️ No {isStaffParticipantClass ? 'staff' : 'students'} eligible to be marked as competent for this lesson.
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
            
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              In marking them competent, you confirm that the {isStaffParticipantClass ? 'participant' : 'student'} has, in your professional opinion, been observed operating the equipment safely and effectively in accordance with relevant safety procedures and expectations. This includes, but is not limited to, the demonstrated ability to:
            </Typography>
            <Box component="ul" sx={{ pl: 2, color: '#666', fontSize: '0.875rem' }}>
              <Tooltip
                title={
                  <Box sx={{ fontSize: '0.875rem', p: 1 }}>
                    <Box sx={{ fontWeight: 600, mb: 1 }}>Prepare the workspace and apply correct PPE:</Box>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      <li>Wears required PPE (e.g. safety glasses, ear protection, enclosed shoes)</li>
                      <li>Secures hair, removes jewellery, and tucks in loose clothing</li>
                      <li>Checks that the workspace is clear of hazards and obstructions</li>
                      <li>Selects the correct material and tools for the task</li>
                      <li>Reviews the SOP or listens carefully to instructions before starting</li>
                    </Box>
                  </Box>
                }
                arrow
                placement="top"
                followCursor
                enterDelay={1000}
              >
                <Box component="li" sx={{ 
                  cursor: 'help', 
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent',
                  '&:hover': {
                    backgroundColor: '#f0f9ff',
                    borderColor: '#4ecdc4',
                    color: '#4ecdc4'
                  }
                }}>
                  Prepare the workspace and apply correct PPE
                </Box>
              </Tooltip>
              <Tooltip
                title={
                  <Box sx={{ fontSize: '0.875rem', p: 1 }}>
                    <Box sx={{ fontWeight: 600, mb: 1 }}>Inspect and set up the machine in accordance with its Safe Operating Procedure:</Box>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      <li>Inspects machine for damage, defects, or missing components</li>
                      <li>Ensures all guards, fences, and safety features are in place and functioning</li>
                      <li>Tests emergency stop and isolation switch</li>
                      <li>Adjusts settings (e.g. height, fence, depth) according to task requirements</li>
                      <li>Sets up jigs, clamps, or push sticks as specified in the SOP</li>
                    </Box>
                  </Box>
                }
                arrow
                placement="top"
                followCursor
                enterDelay={1000}
              >
                <Box component="li" sx={{ 
                  cursor: 'help', 
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent',
                  '&:hover': {
                    backgroundColor: '#f0f9ff',
                    borderColor: '#4ecdc4',
                    color: '#4ecdc4'
                  }
                }}>
                  Inspect and set up the machine in accordance with its Safe Operating Procedure
                </Box>
              </Tooltip>
              <Tooltip
                title={
                  <Box sx={{ fontSize: '0.875rem', p: 1 }}>
                    <Box sx={{ fontWeight: 600, mb: 1 }}>Operate the equipment with control, awareness, and adherence to safety protocols:</Box>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      <li>Starts the machine safely and in the correct sequence</li>
                      <li>Maintains safe body position, posture, and hand placement throughout operation</li>
                      <li>Feeds material smoothly, with steady control and no hesitation or force</li>
                      <li>Operates the machine exactly as described in the SOP</li>
                      <li>Stays focused on the task and avoids distractions while working</li>
                    </Box>
                  </Box>
                }
                arrow
                placement="top"
                followCursor
                enterDelay={1000}
              >
                <Box component="li" sx={{ 
                  cursor: 'help', 
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent',
                  '&:hover': {
                    backgroundColor: '#f0f9ff',
                    borderColor: '#4ecdc4',
                    color: '#4ecdc4'
                  }
                }}>
                  Operate the equipment with control, awareness, and adherence to safety protocols
                </Box>
              </Tooltip>
              <Tooltip
                title={
                  <Box sx={{ fontSize: '0.875rem', p: 1 }}>
                    <Box sx={{ fontWeight: 600, mb: 1 }}>Respond to hazards or malfunctions appropriately:</Box>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      <li>Identifies key hazards associated with the machine (e.g. ejection, entanglement)</li>
                      <li>Applies appropriate risk controls (e.g. uses push sticks, guards, PPE)</li>
                      <li>Recognises and appropriately responds to unusual sounds, jams, or faults</li>
                      <li>Knows when and how to stop the machine in an emergency</li>
                      <li>Seeks help or reports issues immediately if unsure or unsafe</li>
                    </Box>
                  </Box>
                }
                arrow
                placement="top"
                followCursor
                enterDelay={1000}
              >
                <Box component="li" sx={{ 
                  cursor: 'help', 
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent',
                  '&:hover': {
                    backgroundColor: '#f0f9ff',
                    borderColor: '#4ecdc4',
                    color: '#4ecdc4'
                  }
                }}>
                  Respond to hazards or malfunctions appropriately
                </Box>
              </Tooltip>
              <Tooltip
                title={
                  <Box sx={{ fontSize: '0.875rem', p: 1 }}>
                    <Box sx={{ fontWeight: 600, mb: 1 }}>Shut down, clean, and store tools and materials safely:</Box>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      <li>Waits for all moving parts to come to a complete stop before touching the machine</li>
                      <li>Powers off and isolates the machine as per SOP</li>
                      <li>Cleans the machine and surrounding workspace</li>
                      <li>Returns all tools and equipment to their designated locations</li>
                      <li>Reports any maintenance needs or issues to the teacher/supervisor</li>
                    </Box>
                  </Box>
                }
                arrow
                placement="top"
                followCursor
                enterDelay={1000}
              >
                <Box component="li" sx={{ 
                  cursor: 'help', 
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent',
                  '&:hover': {
                    backgroundColor: '#f0f9ff',
                    borderColor: '#4ecdc4',
                    color: '#4ecdc4'
                  }
                }}>
                  Shut down, clean, and store tools and materials safely
                </Box>
              </Tooltip>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#888', 
                fontSize: '0.8rem', 
                fontStyle: 'italic', 
                mt: 2, 
                textAlign: 'center'
              }}
            >
              💡 Hover over each bullet point above to see detailed examples
            </Typography>
            <Box sx={{
              mt: 3,
              mb: 2,
              borderTop: '1px solid #e0e7ff',
            }} />
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #e9ecef', 
              borderRadius: '4px'
            }}>
              <Typography sx={{ 
                color: '#6c757d', 
                fontSize: '0.8rem',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                ⚠️ This declaration does not negate or replace any legal obligations, duties of care, or responsibilities you hold under relevant workplace health and safety laws, employer directives, or governing authority policies.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompetencyConfirmationOpen(false)} {...buttonStyles.cancel}>
              Cancel
            </Button>
            <Tooltip
              title={scrolledToBottom ? '' : 'Please scroll to the bottom and read the declaration before confirming.'}
              arrow
              enterDelay={0}
              disableHoverListener={scrolledToBottom}
            >
              <span>
                <Button
                  onClick={handleConfirmCompetencyUpdate}
                  {...buttonStyles.primary}
                  disabled={!scrolledToBottom}
                  sx={{
                    ...(buttonStyles.primary && buttonStyles.primary.sx ? buttonStyles.primary.sx : {}),
                    ...( !scrolledToBottom ? {
                      backgroundColor: '#e0e0e0',
                      color: '#888',
                      cursor: 'not-allowed',
                      pointerEvents: 'auto',
                      boxShadow: 'none',
                      border: '1px solid #ccc',
                      opacity: 0.7,
                    } : {})
                  }}
                >
                  Confirm
                </Button>
              </span>
            </Tooltip>
          </DialogActions>
        </Dialog>
      )}

      {/* Download Confirmation Dialog */}
      <Dialog open={downloadConfirmationOpen} onClose={() => setDownloadConfirmationOpen(false)}>
        <DialogTitle>Download Progress</DialogTitle>
        <DialogContent>
          <Typography>
            Download {isStaffParticipantClass ? 'participant' : 'student'} progress as an Excel document.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDownloadConfirmationOpen(false)} {...buttonStyles.cancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              exportToExcel();
              setDownloadConfirmationOpen(false);
            }}
            {...buttonStyles.primary}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lesson Due Date Dialog */}
      <Dialog 
        open={lessonDueDateDialogOpen} 
        onClose={handleCloseLessonDueDateDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { maxWidth: 500, width: 500, height: 600 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', pb: 1 }}>
          {lessonDueDateStep === 0 ? 'Select Lessons' : 'Set Due Date'}
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {lessonDueDateStep === 0 && (() => {
            const searchedLessons = sortLessonsByPageOrder([...selectedLessons], lessons).filter(lesson => 
              lesson.toLowerCase().includes(lessonDueDateSearch.toLowerCase())
            );
            const allSearchedLessonsSelected = searchedLessons.length > 0 && searchedLessons.every(l => selectedLessonsForDueDate.includes(l));
            const someSearchedLessonsSelected = searchedLessons.length > 0 && searchedLessons.some(l => selectedLessonsForDueDate.includes(l)) && !allSearchedLessonsSelected;
            
            const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
                setSelectedLessonsForDueDate(Array.from(new Set([...selectedLessonsForDueDate, ...searchedLessons])));
              } else {
                setSelectedLessonsForDueDate(selectedLessonsForDueDate.filter(l => !searchedLessons.includes(l)));
              }
            };

            return (
              <>
                <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fff', px: 3, pt: 1, pb: 2, borderBottom: '1px solid #e0e7ff' }}>
                  <Typography sx={{ mb: 2, color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                    Select the lessons you want to set a due date for:
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Search lessons"
                    value={lessonDueDateSearch}
                    onChange={e => setLessonDueDateSearch(e.target.value)}
                    size="small"
                  />
                  <Box sx={{ mt: 2, pl: 2.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allSearchedLessonsSelected}
                          indeterminate={someSearchedLessonsSelected}
                          onChange={handleSelectAll}
                        />
                      }
                      label="Select All"
                    />
                  </Box>
                </Box>
                <Box sx={{ overflowY: 'auto', maxHeight: 400, p: 3, pt: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {searchedLessons.map((lesson) => (
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
                          setSelectedLessonsForDueDate(prev =>
                            prev.includes(lesson)
                              ? prev.filter(l => l !== lesson)
                              : [...prev, lesson]
                          );
                        }}
                      >
                        <Checkbox
                          checked={selectedLessonsForDueDate.includes(lesson)}
                          onChange={(e) => {
                            setSelectedLessonsForDueDate(prev =>
                              prev.includes(lesson)
                                ? prev.filter(l => l !== lesson)
                                : [...prev, lesson]
                            );
                          }}
                          onClick={e => e.stopPropagation()}
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
                </Box>
              </>
            );
          })()}
          {lessonDueDateStep === 1 && (
            <>
              <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fff', px: 3, pt: 1, pb: 2, borderBottom: '1px solid #e0e7ff' }}>
                <Typography sx={{ mb: 2, color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                  Set the due date for the selected lessons:
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  label="Due Date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0], // Prevent setting dates in the past
                  }}
                />
              </Box>
              <Box sx={{ overflowY: 'auto', maxHeight: 400, p: 3, pt: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
                    Selected Lessons:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {selectedLessonsForDueDate.map((lesson) => (
                      <Typography 
                        key={lesson}
                        sx={{ 
                          color: '#666',
                          fontSize: '0.9rem',
                          mb: '0.5'
                        }}
                      >
                        • {lesson}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {lessonDueDateStep === 1 && (
            <Button
              onClick={() => setLessonDueDateStep(0)}
              {...buttonStyles.cancel}
            >
              Back
            </Button>
          )}
          {lessonDueDateStep === 0 && (
            <Button
              onClick={handleCloseLessonDueDateDialog}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
          )}
          {lessonDueDateStep === 0 && (
            <Button
              onClick={() => setLessonDueDateStep(1)}
              {...buttonStyles.primary}
              disabled={selectedLessonsForDueDate.length === 0}
            >
              Next
            </Button>
          )}
          {lessonDueDateStep === 1 && (
            <>
              <Button
                onClick={handleClearLessonDueDates}
                {...buttonStyles.secondary}
                disabled={selectedLessonsForDueDate.length === 0}
              >
                Clear Due Dates
              </Button>
              <Button
                onClick={handleSetLessonDueDate}
                {...buttonStyles.primary}
                disabled={!dueDate}
              >
                Set Due Date
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Layout>
  );
} 