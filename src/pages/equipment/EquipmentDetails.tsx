import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Link, Paper, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Avatar, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, Divider, Radio } from '@mui/material';
import { Layout } from '../../components/layout/Layout';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import PhotoIcon from '@mui/icons-material/Photo';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import NotesIcon from '@mui/icons-material/Notes';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import LinkIcon from '@mui/icons-material/Link';
import WarningIcon from '@mui/icons-material/Warning';
import HandymanIcon from '@mui/icons-material/Handyman';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import ScienceIcon from '@mui/icons-material/Science';
import PowerIcon from '@mui/icons-material/Power';
import ConstructionIcon from '@mui/icons-material/Construction';
import FactoryIcon from '@mui/icons-material/Factory';
import KitchenIcon from '@mui/icons-material/Kitchen';
import IronIcon from '@mui/icons-material/Iron';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import { buttonStyles } from '../../styles/buttonStyles';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  code: string;
  location: string;
  photo?: string;
}

interface EquipmentDetailsProps {
  equipment: Equipment[];
}

const equipmentTypes = ['Tool', 'Machine', 'PPE', 'Material', 'Other'];
const API_BASE = 'http://localhost:3001';

export function EquipmentDetails({ equipment }: EquipmentDetailsProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [enlargedPhotoOpen, setEnlargedPhotoOpen] = useState(false);
  const [deletePhotoDialogOpen, setDeletePhotoDialogOpen] = useState(false);
  const [editEquipment, setEditEquipment] = useState<{
    id: string | null;
    name: string;
    type: string;
    code: string;
    location: string;
  }>({
    id: null,
    name: '',
    type: '',
    code: '',
    location: '',
  });
  const [editFieldError, setEditFieldError] = useState('');
  const [rooms, setRooms] = useState<string[]>([]);
  
  // Notes state
  const [notes, setNotes] = useState<Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }>>([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{
    id: string | null;
    title: string;
    content: string;
  }>({
    id: null,
    title: '',
    content: '',
  });
  const [noteDetailDialogOpen, setNoteDetailDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
  } | null>(null);
  const [noteError, setNoteError] = useState('');
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  
  // Manuals state
  const [manuals, setManuals] = useState<Array<{
    id: string;
    title: string;
    type: 'file' | 'link';
    url?: string;
    filename?: string;
    uploadedAt: string;
  }>>([]);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [editingManual, setEditingManual] = useState<{
    id: string | null;
    title: string;
    type: 'file' | 'link';
    url: string;
    file: File | null;
  }>({
    id: null,
    title: '',
    type: 'link',
    url: '',
    file: null,
  });
  const [manualError, setManualError] = useState('');
  const [isUploadingManual, setIsUploadingManual] = useState(false);
  
  // Find equipment by ID
  const equipmentItem = equipment.find(eq => eq.id === id);
  
  // Create refs for each section
  const equipmentInfoRef = React.useRef<HTMLDivElement>(null);
  const locationRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Fetch rooms on mount
  useEffect(() => {
    fetch(`${API_BASE}/rooms`)
      .then(res => res.json())
      .then(data => setRooms(data));
  }, []);

  // Fetch notes on mount
  React.useEffect(() => {
    if (equipmentItem?.id) {
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/notes`)
        .then(res => res.json())
        .then(data => setNotes(data))
        .catch(error => console.error('Error fetching notes:', error));
    }
  }, [equipmentItem?.id]);

  // Fetch manuals on mount
  React.useEffect(() => {
    if (equipmentItem?.id) {
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/manuals`)
        .then(res => res.json())
        .then(data => setManuals(data))
        .catch(error => console.error('Error fetching manuals:', error));
    }
  }, [equipmentItem?.id]);

  // Set initial scroll position
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // Handle scroll events
  const handleScroll = React.useCallback(() => {
    if (!contentRef.current) return;
    const container = contentRef.current;
    const headerOffset = 150; // height of sticky header in px
    const sections = [equipmentInfoRef, locationRef];
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
    
    const refs = [equipmentInfoRef, locationRef];
    const targetRef = refs[newValue];
    if (targetRef.current && contentRef.current) {
      const headerOffset = 137; // Height of main header (64) + tab header (73)
      const targetPosition = targetRef.current.offsetTop - headerOffset;
      
      contentRef.current.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
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

  const handleEditClick = (equipment: Equipment) => {
    setEditEquipment({
      id: equipment.id,
      name: equipment.name,
      type: equipment.type,
      code: equipment.code,
      location: equipment.location,
    });
    setEditFieldError('');
    setEditDialogOpen(true);
  };

  const handleEditEquipment = () => {
    setEditFieldError('');
    const { id, name, type, code, location } = editEquipment;
    if (!name.trim() || !type || !location.trim()) {
      setEditFieldError('Name, Type, and Location are required.');
      return;
    }
    
    // Update the equipment in the backend
    fetch(`${API_BASE}/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), type, code: code.trim(), location: location.trim() }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          // Refresh the page to get updated data
          window.location.reload();
        } else {
          setEditFieldError('Failed to update equipment.');
        }
      })
      .catch(() => {
        setEditFieldError('Failed to update equipment.');
      });
  };

  const handleDeleteClick = (equipment: Equipment) => {
    setEditEquipment({
      id: equipment.id,
      name: equipment.name,
      type: equipment.type,
      code: equipment.code,
      location: equipment.location,
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteEquipment = () => {
    if (editEquipment.id) {
      fetch(`${API_BASE}/equipment/${editEquipment.id}`, {
        method: 'DELETE',
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            // Navigate back to equipment page
            navigate('/equipment');
          } else {
            setEditFieldError('Failed to delete equipment.');
          }
        })
        .catch(() => {
          setEditFieldError('Failed to delete equipment.');
        });
    }
    setDeleteDialogOpen(false);
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setPhotoError('Please select an image file.');
        return;
      }
      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        setPhotoError('Image file size must be less than 25MB.');
        return;
      }
      setSelectedPhoto(file);
      setPhotoError('');
    }
  };

  const handlePhotoUpload = () => {
    if (!selectedPhoto || !equipmentItem) return;
    
    setIsUploadingPhoto(true);
    setPhotoError('');
    
    const formData = new FormData();
    formData.append('photo', selectedPhoto);
    
    fetch(`${API_BASE}/equipment/${equipmentItem.id}/photo`, {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          // Refresh the page to show the new photo
          window.location.reload();
        } else {
          setPhotoError('Failed to upload photo. Please try again.');
        }
      })
      .catch(() => {
        setPhotoError('Failed to upload photo. Please check your connection and try again.');
      })
      .finally(() => {
        setIsUploadingPhoto(false);
      });
  };

  const handleRemovePhoto = () => {
    setDeletePhotoDialogOpen(true);
  };

  const handleConfirmRemovePhoto = () => {
    if (equipmentItem) {
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/photo`, {
        method: 'DELETE',
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            // Refresh the page to get updated data
            window.location.reload();
          }
        })
        .catch(error => {
          console.error('Error deleting photo:', error);
        });
    }
    setDeletePhotoDialogOpen(false);
  };

  // Note management functions
  const handleOpenNoteDialog = () => {
    setEditingNote({ id: null, title: '', content: '' });
    setNoteError('');
    setNoteDialogOpen(true);
  };

  const handleEditNote = (note: { id: string; title: string; content: string; createdAt: string }) => {
    setEditingNote({ id: note.id, title: note.title, content: note.content });
    setNoteError('');
    setNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    setNoteError('');
    const { title, content } = editingNote;
    
    if (!title.trim() || !content.trim()) {
      setNoteError('Both title and content are required.');
      return;
    }

    if (!equipmentItem?.id) {
      setNoteError('Equipment not found.');
      return;
    }

    if (editingNote.id) {
      // Edit existing note
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() })
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setNotes(prevNotes => 
              prevNotes.map(note => 
                note.id === editingNote.id 
                  ? result.note
                  : note
              )
            );
            setNoteDialogOpen(false);
            setEditingNote({ id: null, title: '', content: '' });
          } else {
            setNoteError('Failed to update note.');
          }
        })
        .catch(error => {
          console.error('Error updating note:', error);
          setNoteError('Failed to update note.');
        });
    } else {
      // Add new note
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() })
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setNotes(prevNotes => [...prevNotes, result.note]);
            setNoteDialogOpen(false);
            setEditingNote({ id: null, title: '', content: '' });
          } else {
            setNoteError('Failed to add note.');
          }
        })
        .catch(error => {
          console.error('Error adding note:', error);
          setNoteError('Failed to add note.');
        });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const noteToDeleteData = notes.find(note => note.id === noteId);
    if (noteToDeleteData) {
      setNoteToDelete({ id: noteToDeleteData.id, title: noteToDeleteData.title });
      setDeleteNoteDialogOpen(true);
    }
  };

  const handleConfirmDeleteNote = () => {
    if (!equipmentItem?.id || !noteToDelete) return;
    
    fetch(`${API_BASE}/equipment/${equipmentItem.id}/notes/${noteToDelete.id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDelete.id));
        } else {
          console.error('Failed to delete note');
        }
      })
      .catch(error => {
        console.error('Error deleting note:', error);
      })
      .finally(() => {
        setDeleteNoteDialogOpen(false);
        setNoteToDelete(null);
      });
  };

  const handleViewNote = (note: { id: string; title: string; content: string; createdAt: string }) => {
    setSelectedNote(note);
    setNoteDetailDialogOpen(true);
  };

  const formatNoteContent = (content: string) => {
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #4ecdc4; text-decoration: underline;">$1</a>');
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Manual management functions
  const handleOpenManualDialog = () => {
    setEditingManual({ id: null, title: '', type: 'link', url: '', file: null });
    setManualError('');
    setManualDialogOpen(true);
  };

  const handleManualFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        setManualError('Please select a PDF or Word document (.pdf, .doc, .docx).');
        return;
      }
      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        setManualError('File size must be less than 25MB.');
        return;
      }
      setEditingManual(prev => ({ ...prev, file, title: prev.title || file.name.replace(/\.[^/.]+$/, '') }));
      setManualError('');
    }
  };

  const handleSaveManual = () => {
    setManualError('');
    const { title, type, url, file } = editingManual;
    
    if (!title.trim()) {
      setManualError('Title is required.');
      return;
    }

    if (type === 'link' && !url.trim()) {
      setManualError('URL is required for link type.');
      return;
    }

    if (type === 'file' && !file) {
      setManualError('File is required for file type.');
      return;
    }

    if (!equipmentItem?.id) {
      setManualError('Equipment not found.');
      return;
    }

    setIsUploadingManual(true);

    if (type === 'file' && file) {
      // Upload file
      const formData = new FormData();
      formData.append('manual', file);
      formData.append('title', title.trim());

      fetch(`${API_BASE}/equipment/${equipmentItem.id}/manuals`, {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setManuals(prevManuals => [...prevManuals, result.manual]);
            setManualDialogOpen(false);
            setEditingManual({ id: null, title: '', type: 'link', url: '', file: null });
          } else {
            setManualError('Failed to upload manual.');
          }
        })
        .catch(error => {
          console.error('Error uploading manual:', error);
          setManualError('Failed to upload manual.');
        })
        .finally(() => {
          setIsUploadingManual(false);
        });
    } else {
      // Save link
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/manuals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), url: url.trim(), type: 'link' })
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setManuals(prevManuals => [...prevManuals, result.manual]);
            setManualDialogOpen(false);
            setEditingManual({ id: null, title: '', type: 'link', url: '', file: null });
          } else {
            setManualError('Failed to save manual.');
          }
        })
        .catch(error => {
          console.error('Error saving manual:', error);
          setManualError('Failed to save manual.');
        })
        .finally(() => {
          setIsUploadingManual(false);
        });
    }
  };

  const handleDeleteManual = (manualId: string) => {
    if (!equipmentItem?.id) return;
    
    fetch(`${API_BASE}/equipment/${equipmentItem.id}/manuals/${manualId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setManuals(prevManuals => prevManuals.filter(manual => manual.id !== manualId));
        } else {
          console.error('Failed to delete manual');
        }
      })
      .catch(error => {
        console.error('Error deleting manual:', error);
      });
  };

  // --- LESSON LINKING STATE ---
  const [linkLessonDialogOpen, setLinkLessonDialogOpen] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonSearch, setLessonSearch] = useState('');
  const [lessonDialogTab, setLessonDialogTab] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [linkedLesson, setLinkedLesson] = useState<any | null>(null); // for display

  // Fetch lessons when dialog opens
  useEffect(() => {
    if (linkLessonDialogOpen) {
      fetch(`${API_BASE}/lessons`)
        .then(res => res.json())
        .then(data => setLessons(data))
        .catch(() => setLessons([]));
    }
  }, [linkLessonDialogOpen]);

  // Optionally: Fetch linked lesson for this equipment (if backend supports it)
  // useEffect(() => {
  //   if (equipmentItem?.id) {
  //     fetch(`${API_BASE}/equipment/${equipmentItem.id}/lessons`)
  //       .then(res => res.json())
  //       .then(data => setLinkedLesson(data.linkedLesson || null));
  //   }
  // }, [equipmentItem?.id]);

  // --- LESSON ICONS (copy from ClassDetails) ---
  const lessonIcons: { [key: string]: JSX.Element } = {
    'Warning': <WarningIcon color="inherit" fontSize="inherit" />, 'Build': <BuildIcon color="inherit" fontSize="inherit" />, 'Handyman': <HandymanIcon color="inherit" fontSize="inherit" />, 'ElectricBolt': <ElectricBoltIcon color="inherit" fontSize="inherit" />, 'Science': <ScienceIcon color="inherit" fontSize="inherit" />, 'Power': <PowerIcon color="inherit" fontSize="inherit" />, 'Construction': <ConstructionIcon color="inherit" fontSize="inherit" />, 'Factory': <FactoryIcon color="inherit" fontSize="inherit" />, 'Kitchen': <KitchenIcon color="inherit" fontSize="inherit" />, 'Iron': <IronIcon color="inherit" fontSize="inherit" />, 'HomeRepair': <HomeRepairServiceIcon color="inherit" fontSize="inherit" />
  };
  // --- LESSON SORTING (copy from ClassDetails) ---
  const sortLessonsByPageOrder = (lessonNames: string[], allLessons: any[]) => {
    const lessonAreas = ['Industrial', 'Textiles', 'Kitchen', 'Maintenance'];
    const industrialSubAreas = [
      'Workshop Safety', 'Multiuse Workshop Equipment', 'Metalworking', 'Woodworking', 'Painting & Finishing', 'Heating & Forming'
    ];
    const lessonMap = new Map();
    allLessons.forEach(lesson => { lessonMap.set(lesson.name, lesson); });
    return lessonNames.sort((a, b) => {
      const lessonA = lessonMap.get(a); const lessonB = lessonMap.get(b);
      if (!lessonA || !lessonB) return 0;
      const areaA = lessonAreas.indexOf(lessonA.area); const areaB = lessonAreas.indexOf(lessonB.area);
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

  if (!equipmentItem) {
    return (
      <Layout title="Equipment Not Found">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>Equipment Not Found</Typography>
          <Typography sx={{ mb: 3 }}>The equipment you're looking for doesn't exist.</Typography>
          <Button {...buttonStyles.primary} onClick={() => navigate('/equipment')}>
            Back to Equipment
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout
      title={equipmentItem.name}
      breadcrumbs={[
        <Link component={RouterLink} underline="hover" color="inherit" to="/equipment" key="equipment" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 18 }}>Equipment</Link>,
        <Typography key="details" color="text.primary" sx={{ fontWeight: 600, fontSize: 18 }}>{equipmentItem.name}</Typography>
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 240, right: 0, zIndex: 1099 }}>
        {/* Tabs */}
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e7ff' }}>
          <Box sx={{ maxWidth: 1000, mx: 'auto', px: 4 }}>
            <Tabs value={tab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
              <Tab label="Equipment Information" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', fontSize: 16, textTransform: 'none' }} />
              <Tab label="Location" sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', fontSize: 16, textTransform: 'none' }} />
            </Tabs>
          </Box>
        </Box>

        {/* Content */}
        <Box ref={contentRef} sx={{ flex: 1, overflowY: 'auto' }}>
          <Box sx={{ maxWidth: 1000, mx: 'auto', px: 4, py: 4 }}>
            {/* Equipment Info Tiles Section */}
            <Box ref={equipmentInfoRef} sx={{ display: 'flex', gap: 2, minHeight: 70, mb: 3 }}>
              {/* Equipment Info Section with Photo */}
              <Paper elevation={1} sx={{ flex: 1, px: 3, py: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 3, minWidth: 0, minHeight: 70, position: 'relative' }}>
                {/* Photo Section */}
                <Box sx={{ width: 100, height: 100, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  {equipmentItem.photo ? (
                    <>
                      <img 
                        src={`${API_BASE}${equipmentItem.photo}`} 
                        alt={equipmentItem.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: '1px solid #d1d5db'
                        }}
                        onClick={() => setEnlargedPhotoOpen(true)}
                      />
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 2, 
                        right: 2, 
                        display: 'flex', 
                        gap: 0.5,
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                        '&:hover': { opacity: 1 }
                      }}>
                        <Tooltip title="Change photo" arrow>
                          <IconButton 
                            size="small" 
                            sx={{ 
                              color: '#fff', 
                              bgcolor: 'rgba(0,0,0,0.6)',
                              width: 20,
                              height: 20,
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                            }} 
                            onClick={() => setPhotoDialogOpen(true)}>
                            <EditIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove photo" arrow>
                          <IconButton 
                            size="small" 
                            sx={{ 
                              color: '#fff', 
                              bgcolor: 'rgba(0,0,0,0.6)',
                              width: 20,
                              height: 20,
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                            }} 
                            onClick={handleRemovePhoto}>
                            <DeleteIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </>
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f3f4f6',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        cursor: 'pointer'
                      }}
                      onClick={() => setPhotoDialogOpen(true)}
                    >
                      <AddAPhotoIcon sx={{ fontSize: 24, color: '#9ca3af', mb: 0.5 }} />
                      <Typography sx={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', px: 0.5 }}>
                        Add Photo
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Equipment Info Text */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: '#888', fontWeight: 700, fontSize: 13, mb: 0.5 }}>
                    {equipmentItem.type}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 22, color: '#374151', lineHeight: 1.1 }}>{equipmentItem.name}</Typography>
                  <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 14, fontFamily: 'Montserrat, sans-serif', mt: 0.5 }}>
                    ID: {equipmentItem.id} {equipmentItem.code && `• Serial: ${equipmentItem.code}`}
                  </Typography>
                  <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 14, fontFamily: 'Montserrat, sans-serif', mt: 0.5 }}>
                    Location: {equipmentItem.location}
                  </Typography>
                </Box>

                {/* Action Buttons - Bottom Right */}
                <Box sx={{ position: 'absolute', bottom: 8, right: 12, display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit equipment" arrow>
                    <IconButton size="small" sx={{ color: '#4ecdc4' }} onClick={() => handleEditClick(equipmentItem)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete equipment" arrow>
                    <IconButton size="small" sx={{ color: '#e57373' }} onClick={() => handleDeleteClick(equipmentItem)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Box>

            <div style={{ height: 12 }} />

            {/* Notes and User Manuals Section - Side by Side */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
              {/* Notes Section */}
              <Box sx={{ flex: 1, display: 'flex' }}>
                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NotesIcon sx={{ color: '#4ecdc4' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Notes & Spare Parts</Typography>
                    </Box>
                    <Button {...buttonStyles.primary} size="small" startIcon={<AddIcon />} onClick={handleOpenNoteDialog}>
                      Add Note
                    </Button>
                  </Box>
                  <Box sx={{ 
                    flexGrow: 1,
                    maxHeight: '240px',
                    overflowY: 'auto',
                    bgcolor: '#f8fafc', 
                    borderRadius: 2, 
                    p: 2, 
                    border: '1px solid #e0e7ff' 
                  }}>
                    {notes.length === 0 ? (
                      <Typography sx={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                        No notes added yet. Click "Add Note" to add spare parts links and other information.
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {notes.map((note) => (
                          <Paper 
                            key={note.id} 
                            elevation={0}
                            sx={{ 
                              p: 2,
                              borderRadius: 2, 
                              bgcolor: '#fff', 
                              border: '1px solid #e0e7ff',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transform: 'translateY(-1px)',
                              }
                            }}
                            onClick={() => handleViewNote(note)}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                              <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', pt: '4px' }}>
                                <Typography sx={{ 
                                  fontWeight: 600, 
                                  fontSize: 14, 
                                  color: '#374151',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {note.title}
                                </Typography>
                                <Typography 
                                  sx={{ 
                                    fontSize: 12, 
                                    color: '#6b7280', 
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis'
                                  }}
                                  dangerouslySetInnerHTML={{ 
                                    __html: formatNoteContent(note.content) 
                                  }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexShrink: 0, pt: '4px' }}>
                                <Tooltip title="Edit note" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#4ecdc4', p: 0.5 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditNote(note);
                                    }}
                                  >
                                    <EditIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete note" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#e57373', p: 0.5 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNote(note.id);
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Box>

              {/* User Manuals Section */}
              <Box sx={{ flex: 1, display: 'flex' }}>
                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon sx={{ color: '#4ecdc4' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>User Manuals</Typography>
                    </Box>
                    <Button {...buttonStyles.primary} size="small" startIcon={<AddIcon />} onClick={handleOpenManualDialog}>
                      Add Manual
                    </Button>
                  </Box>
                  <Box sx={{ 
                    flexGrow: 1,
                    maxHeight: '240px',
                    overflowY: 'auto',
                    bgcolor: '#f8fafc', 
                    borderRadius: 2, 
                    p: 2, 
                    border: '1px solid #e0e7ff' 
                  }}>
                    {manuals.length === 0 ? (
                      <Typography sx={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                        No user manuals uploaded yet. Click "Add Manual" to upload or link documentation.
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {manuals.map((manual) => (
                          <Paper 
                            key={manual.id} 
                            elevation={0}
                            sx={{ 
                              p: 2,
                              borderRadius: 2, 
                              bgcolor: '#fff', 
                              border: '1px solid #e0e7ff',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transform: 'translateY(-1px)',
                              }
                            }}
                            onClick={() => {
                              if (manual.type === 'file' && manual.url) {
                                window.open(`${API_BASE}${manual.url}`, '_blank');
                              } else if (manual.type === 'link' && manual.url) {
                                window.open(manual.url, '_blank');
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                              <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', pt: '4px' }}>
                                <Typography sx={{ 
                                  fontWeight: 600, 
                                  fontSize: 14, 
                                  color: '#374151',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {manual.title}
                                </Typography>
                                <Typography sx={{ 
                                  fontSize: 12, 
                                  color: '#9ca3af',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {manual.type === 'file' ? 
                                    `File: ${manual.filename}` : 
                                    'External Link'
                                  } • Added: {new Date(manual.uploadedAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, ml: 2, flexShrink: 0, pt: '4px' }}>
                                <Tooltip title="Delete manual" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#e57373', p: 0.5 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteManual(manual.id);
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Box>

            <div style={{ height: 12 }} />

            {/* Maintenance Records Section */}
            <div>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BuildIcon sx={{ color: '#4ecdc4' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Maintenance Records</Typography>
                  </Box>
                  <Button {...buttonStyles.primary} size="small" startIcon={<AddIcon />}>
                    Add Record
                  </Button>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: '1px solid #e0e7ff' }}>
                  <Typography sx={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                    No maintenance records yet. Click "Add Record" to log maintenance activities.
                  </Typography>
                </Box>
              </Paper>
            </div>

            <div style={{ height: 12 }} />

            {/* Periodic Inspections Section */}
            <div>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon sx={{ color: '#4ecdc4' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Periodic Inspections</Typography>
                  </Box>
                  <Button {...buttonStyles.primary} size="small" startIcon={<AddIcon />}>
                    Add Inspection
                  </Button>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: '1px solid #e0e7ff' }}>
                  <Typography sx={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                    No inspection records yet. Click "Add Inspection" to schedule or record inspections.
                  </Typography>
                </Box>
              </Paper>
            </div>

            <div style={{ height: 12 }} />

            {/* Linked Lessons Section */}
            <div>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ color: '#4ecdc4' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Related Lessons</Typography>
                  </Box>
                  <Button {...buttonStyles.primary} size="small" startIcon={<LinkIcon />} onClick={() => setLinkLessonDialogOpen(true)}>
                    Link Lesson
                  </Button>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: '1px solid #e0e7ff' }}>
                  {linkedLesson ? (
                    <Paper
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
                          {lessonIcons[linkedLesson.icon]}
                        </Box>
                        <Box>
                          <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: '#374151' }}>
                            {linkedLesson.name}
                          </Typography>
                          <Typography sx={{ color: '#6b7280', fontSize: 14, fontFamily: 'Montserrat, sans-serif' }}>
                            {linkedLesson.category}  b7 {linkedLesson.area}{linkedLesson.subArea ? `  b7 ${linkedLesson.subArea}` : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ) : (
                    <Typography sx={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                      No lessons linked yet. Click "Link Lesson" to connect this equipment to existing lessons.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </div>

            <div style={{ height: 12 }} />

            {/* SOPs Section */}
            <div>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon sx={{ color: '#4ecdc4' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Safe Operating Procedures (SOPs)</Typography>
                  </Box>
                  <Button {...buttonStyles.primary} size="small" startIcon={<AddIcon />}>
                    Add SOP
                  </Button>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: '1px solid #e0e7ff' }}>
                  <Typography sx={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                    No SOPs uploaded yet. Click "Add SOP" to upload safety procedures and operating instructions.
                  </Typography>
                </Box>
              </Paper>
            </div>
          </Box>
        </Box>

        {/* Add/Edit Note Dialog */}
        <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
            {editingNote.id ? 'Edit Note' : 'Add Note'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={editingNote.title}
              onChange={e => setEditingNote(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
              placeholder="e.g., Spare Parts, Safety Information, etc."
            />
            <TextField
              label="Content"
              value={editingNote.content}
              onChange={e => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
              multiline
              rows={6}
              fullWidth
              placeholder="Add your note content here. You can include links like https://example.com and they will be clickable."
            />
            {noteError && <Typography sx={{ color: 'error.main', fontSize: 13 }}>{noteError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.primary} onClick={handleSaveNote}>
              {editingNote.id ? 'Save Changes' : 'Add Note'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Note Detail Dialog */}
        <Dialog open={noteDetailDialogOpen} onClose={() => setNoteDetailDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedNote?.title}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Edit note" arrow>
                <IconButton 
                  sx={{ color: '#4ecdc4' }}
                  onClick={() => {
                    if (selectedNote) {
                      setNoteDetailDialogOpen(false);
                      handleEditNote(selectedNote);
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete note" arrow>
                <IconButton 
                  sx={{ color: '#e57373' }}
                  onClick={() => {
                    if (selectedNote) {
                      setNoteDetailDialogOpen(false);
                      handleDeleteNote(selectedNote.id);
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: 12, color: '#9ca3af', mb: 2 }}>
              Created: {selectedNote && new Date(selectedNote.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
            <Typography 
              sx={{ fontSize: 16, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ 
                __html: selectedNote ? formatNoteContent(selectedNote.content) : '' 
              }}
            />
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.primary} onClick={() => setNoteDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Equipment Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Edit Equipment</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={editEquipment.name}
              onChange={e => setEditEquipment(s => ({ ...s, name: e.target.value }))}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
            />
            <TextField
              label="Type"
              value={editEquipment.type}
              onChange={e => setEditEquipment(s => ({ ...s, type: e.target.value }))}
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
              value={editEquipment.code}
              onChange={e => setEditEquipment(s => ({ ...s, code: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Location (Room)"
              value={editEquipment.location}
              onChange={e => setEditEquipment(s => ({ ...s, location: e.target.value }))}
              select
              fullWidth
              size="small"
              disabled={rooms.length === 0}
              error={rooms.length === 0}
              helperText={rooms.length === 0 ? 'No rooms available.' : ''}
            >
              {rooms.map(room => (
                <MenuItem key={room} value={room}>{room}</MenuItem>
              ))}
            </TextField>
            {editFieldError && <Typography sx={{ color: 'error.main', fontSize: 13 }}>{editFieldError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.primary} onClick={handleEditEquipment}>
              Save Changes
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
            {editEquipment.id && (
              <Typography sx={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>
                Equipment: {editEquipment.name} ({editEquipment.type})
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
            <Button {...buttonStyles.danger} onClick={handleDeleteEquipment}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Photo Upload Dialog */}
        <Dialog open={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Upload Equipment Photo</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography sx={{ fontSize: 16, color: '#374151' }}>
              Add a photo for {equipmentItem?.name}
            </Typography>
            
            <Box sx={{ 
              border: '2px dashed #e0e7ff', 
              borderRadius: 2, 
              p: 4, 
              textAlign: 'center',
              bgcolor: selectedPhoto ? '#f0f9ff' : '#f8fafc',
              borderColor: selectedPhoto ? '#4ecdc4' : '#e0e7ff',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#4ecdc4',
                bgcolor: '#f0f9ff'
              }
            }}
            onClick={() => document.getElementById('photo-input')?.click()}
          >
            {selectedPhoto ? (
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#4ecdc4', mb: 1 }}>
                  Photo Selected
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#374151', mb: 2 }}>
                  {selectedPhoto.name}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(null);
                    if (document.getElementById('photo-input') as HTMLInputElement) {
                      (document.getElementById('photo-input') as HTMLInputElement).value = '';
                    }
                  }}
                  sx={{ color: '#e57373', borderColor: '#e57373' }}
                >
                  Remove File
                </Button>
              </Box>
            ) : (
              <Box>
                <AddAPhotoIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151', mb: 1 }}>
                  No photo selected
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#6b7280', mb: 2 }}>
                  Click to select or drag and drop an image file here
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                  Supported formats: JPG, PNG, GIF (Max 25MB)
                </Typography>
              </Box>
            )}
          </Box>
            
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoSelect}
          />
            
          {photoError && (
            <Typography sx={{ color: 'error.main', fontSize: 13, bgcolor: '#ffebee', p: 2, borderRadius: 1 }}>
              {photoError}
            </Typography>
          )}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button
              onClick={() => {
                setPhotoDialogOpen(false);
                setSelectedPhoto(null);
                setPhotoError('');
                if (document.getElementById('photo-input') as HTMLInputElement) {
                  (document.getElementById('photo-input') as HTMLInputElement).value = '';
                }
              }}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
            {!selectedPhoto ? (
              <Button
                onClick={() => document.getElementById('photo-input')?.click()}
                {...buttonStyles.primary}
              >
                Select Photo
              </Button>
            ) : (
              <Button
                onClick={handlePhotoUpload}
                disabled={isUploadingPhoto}
                {...buttonStyles.primary}
              >
                {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Enlarged Photo Dialog */}
        <Dialog 
          open={enlargedPhotoOpen} 
          onClose={() => setEnlargedPhotoOpen(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#fff',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 2,
              maxWidth: '90vw',
              maxHeight: '90vh',
              margin: 'auto'
            }
          }}
          sx={{
            '& .MuiDialog-paper': {
              margin: '20px'
            }
          }}
        >
          <DialogContent sx={{ 
            p: 3, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '60vh',
            bgcolor: '#fafafa',
            border: '1px solid #e0e0e0',
            borderRadius: 1
          }}>
            {equipmentItem?.photo && (
              <Box sx={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%'
              }}>
                <img 
                  src={`${API_BASE}${equipmentItem.photo}`} 
                  alt={equipmentItem.name}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => setEnlargedPhotoOpen(false)}
                />
                <Typography 
                  sx={{ 
                    position: 'absolute', 
                    bottom: -40, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    fontSize: 14,
                    color: '#666',
                    fontWeight: 500
                  }}
                >
                  {equipmentItem.name}
                </Typography>
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEnlargedPhotoOpen(false);
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Photo Confirmation Dialog */}
        <Dialog open={deletePhotoDialogOpen} onClose={() => setDeletePhotoDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Remove Photo</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
              Are you sure you want to remove this photo?
            </Typography>
            {equipmentItem && (
              <Typography sx={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>
                Equipment: {equipmentItem.name}
              </Typography>
            )}
            <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setDeletePhotoDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.danger} onClick={handleConfirmRemovePhoto}>
              Remove Photo
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Note Confirmation Dialog */}
        <Dialog open={deleteNoteDialogOpen} onClose={() => setDeleteNoteDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Delete Note</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
              Are you sure you want to delete this note?
            </Typography>
            {noteToDelete && (
              <Typography sx={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>
                Note: {noteToDelete.title}
              </Typography>
            )}
            <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setDeleteNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.danger} onClick={handleConfirmDeleteNote}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Manual Dialog */}
        <Dialog open={manualDialogOpen} onClose={() => setManualDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Add Manual</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={editingManual.title}
              onChange={e => setEditingManual(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
              placeholder="e.g., Operation Manual, Safety Guide, etc."
            />
            
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Button
                variant="contained"
                onClick={() => setEditingManual(prev => ({ ...prev, type: 'link', file: null }))}
                sx={{ 
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontFamily: 'Montserrat, sans-serif',
                  borderRadius: '4px',
                  px: 2,
                  py: 1,
                  whiteSpace: 'nowrap',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                  bgcolor: editingManual.type === 'link' ? '#4ecdc4' : '#fff',
                  color: editingManual.type === 'link' ? '#fff' : '#269b96',
                  border: '1px solid #269b96',
                  '&:hover': { 
                    bgcolor: editingManual.type === 'link' ? '#38b2ac' : '#f8fffe',
                    color: editingManual.type === 'link' ? '#fff' : '#1e7e7e',
                    border: editingManual.type === 'link' ? '1px solid #38b2ac' : '1px solid #1e7e7e',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                Link to Website
              </Button>
              <Button
                variant="contained"
                onClick={() => setEditingManual(prev => ({ ...prev, type: 'file', url: '' }))}
                sx={{ 
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontFamily: 'Montserrat, sans-serif',
                  borderRadius: '4px',
                  px: 2,
                  py: 1,
                  whiteSpace: 'nowrap',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                  bgcolor: editingManual.type === 'file' ? '#4ecdc4' : '#fff',
                  color: editingManual.type === 'file' ? '#fff' : '#269b96',
                  border: '1px solid #269b96',
                  '&:hover': { 
                    bgcolor: editingManual.type === 'file' ? '#38b2ac' : '#f8fffe',
                    color: editingManual.type === 'file' ? '#fff' : '#1e7e7e',
                    border: editingManual.type === 'file' ? '1px solid #38b2ac' : '1px solid #1e7e7e',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                Upload File
              </Button>
            </Box>

            {editingManual.type === 'link' ? (
              <TextField
                label="URL"
                value={editingManual.url}
                onChange={e => setEditingManual(prev => ({ ...prev, url: e.target.value }))}
                fullWidth
                placeholder="https://example.com/manual.pdf"
                helperText="Enter the full URL including https://"
              />
            ) : (
              <Box sx={{ 
                border: '2px dashed #e0e7ff', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                bgcolor: editingManual.file ? '#f0f9ff' : '#f8fafc',
                borderColor: editingManual.file ? '#4ecdc4' : '#e0e7ff',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#4ecdc4',
                  bgcolor: '#f0f9ff'
                }
              }}
              onClick={() => document.getElementById('manual-input')?.click()}
              >
                {editingManual.file ? (
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#4ecdc4', mb: 1 }}>
                      File Selected
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: '#374151', mb: 2 }}>
                      {editingManual.file.name}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingManual(prev => ({ ...prev, file: null }));
                        if (document.getElementById('manual-input') as HTMLInputElement) {
                          (document.getElementById('manual-input') as HTMLInputElement).value = '';
                        }
                      }}
                      sx={{ color: '#e57373', borderColor: '#e57373' }}
                    >
                      Remove File
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <DescriptionIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151', mb: 1 }}>
                      No file selected
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: '#6b7280', mb: 2 }}>
                      Click to select or drag and drop a document here
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                      Supported formats: PDF, DOC, DOCX (max 25MB)
                    </Typography>
                  </Box>
                )}
                <input
                  id="manual-input"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: 'none' }}
                  onChange={handleManualFileSelect}
                />
              </Box>
            )}
            
            {manualError && <Typography sx={{ color: 'error.main', fontSize: 13 }}>{manualError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setManualDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              {...buttonStyles.primary} 
              onClick={handleSaveManual}
              disabled={isUploadingManual}
            >
              {isUploadingManual ? 'Uploading...' : 'Add Manual'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Link Lesson Dialog */}
        <Dialog open={linkLessonDialogOpen} onClose={() => setLinkLessonDialogOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { maxWidth: 600, width: 600, height: 800 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif', pb: 1 }}>Select Lesson</DialogTitle>
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
                const filteredLessons = lessons.filter(lesson => lesson.area === area && lesson.name.toLowerCase().includes(lessonSearch.toLowerCase()));
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
                                <Box sx={{ color: '#4ecdc4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
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
                if (selectedLesson) {
                  const lessonObj = lessons.find(l => l.name === selectedLesson);
                  setLinkedLesson(lessonObj);
                  setLinkLessonDialogOpen(false);
                  // Optionally: POST to backend here
                  // fetch(`${API_BASE}/equipment/${equipmentItem.id}/lessons`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lesson: lessonObj }) });
                }
              }}
              {...buttonStyles.primary}
              disabled={!selectedLesson}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
} 