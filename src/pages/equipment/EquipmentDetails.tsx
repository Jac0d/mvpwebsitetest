import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Link, Paper, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Avatar, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, Divider, Radio, Autocomplete, Checkbox, Snackbar, Alert, Menu } from '@mui/material';
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
import BlockIcon from '@mui/icons-material/Block';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

interface EquipmentDetailsProps {
  equipment: Equipment[];
}

const equipmentTypes = ['Hand Tool', 'Power Tool', 'Machine', 'Portable Appliance', 'Fixed Appliance'];
const API_BASE = 'http://localhost:3001';

const tagOutSteps = [
  'Ensure the machine is switched off',
  'Switch off the power source/s at the isolating control/s or unplug electrical lead from the GPO',
  'Apply lock to the isolation control or to electrical plug & attach suitable tag/s',
  'Test equipment control buttons to ensure power has been disconnected'
];

const untagSteps = [
  'Perform the required maintenance checks and/or cleaning process',
  'Ensure all guards and protective devices are reinstated',
  'Check that all tools and/or cleaning products are removed from around the machine',
  'Remove lock/s, lockout devices and tag/s',
  'Reconnect power source/s',
  'Ensure everyone is clear of the machine and start machine'
];

export function EquipmentDetails({ equipment }: EquipmentDetailsProps) {
  const { colors, buttonStyles } = useThemedStyles();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  
  // Notification states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [enlargedPhotoOpen, setEnlargedPhotoOpen] = useState(false);
  const [deletePhotoDialogOpen, setDeletePhotoDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editEquipment, setEditEquipment] = useState<{
    id: string | null;
    name: string;
    type: string;
    code: string;
    location: string;
    purchasePrice: string;
  }>({
    id: null,
    name: '',
    type: '',
    code: '',
    location: '',
    purchasePrice: '',
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
  
  // Maintenance records state
  const [maintenanceRecords, setMaintenanceRecords] = useState<Array<{
    id: string;
    serviceDate: string;
    workUndertaken: string;
    completedBy: string;
    nextServiceDue: string;
    photos?: string[];
    createdAt: string;
  }>>([]);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<{
    id: string | null;
    serviceDate: string;
    workUndertaken: string;
    completedBy: string;
    nextServiceDue: string;
    photos: File[];
  }>({
    id: null,
    serviceDate: '',
    workUndertaken: '',
    completedBy: '',
    nextServiceDue: '',
    photos: [],
  });
  const [maintenanceDetailDialogOpen, setMaintenanceDetailDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<{
    id: string;
    serviceDate: string;
    workUndertaken: string;
    completedBy: string;
    nextServiceDue: string;
    createdAt: string;
    photos?: string[];
  } | null>(null);
  const [maintenanceError, setMaintenanceError] = useState('');
  const [deleteMaintenanceDialogOpen, setDeleteMaintenanceDialogOpen] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<{
    id: string;
    serviceDate: string;
  } | null>(null);

  // Inspection records state
  const [inspectionRecords, setInspectionRecords] = useState<Array<{
    id: string;
    inspectionDate: string;
    completedBy: string;
    nextInspectionDue: string;
    inspectionAreas: string[];
    createdAt: string;
  }>>([]);
  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<{
    id: string | null;
    inspectionDate: string;
    completedBy: string;
    nextInspectionDue: string;
    inspectionAreas: string[];
  }>({
    id: null,
    inspectionDate: '',
    completedBy: '',
    nextInspectionDue: '',
    inspectionAreas: [],
  });
  const [inspectionDetailDialogOpen, setInspectionDetailDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<{
    id: string;
    inspectionDate: string;
    completedBy: string;
    nextInspectionDue: string;
    inspectionAreas: string[];
    createdAt: string;
  } | null>(null);

  // Tag/Lock Out state
  const [tagOutDialogOpen, setTagOutDialogOpen] = useState(false);
  const [editingTagOut, setEditingTagOut] = useState<{
    id: string | null;
    tagOutDate: string;
    completedBy: string;
    tagOutSteps: string[];
    notes: string;
  }>({
    id: null,
    tagOutDate: '',
    completedBy: '',
    tagOutSteps: [],
    notes: '',
  });
  const [tagOutError, setTagOutError] = useState('');
  const [isTaggedOut, setIsTaggedOut] = useState(false);
  const [currentTagOut, setCurrentTagOut] = useState<{
    id: string;
    tagOutDate: string;
    completedBy: string;
    tagOutSteps: string[];
    notes: string;
    createdAt: string;
  } | null>(null);

  // Untag Equipment state
  const [untagDialogOpen, setUntagDialogOpen] = useState(false);
  const [editingUntag, setEditingUntag] = useState<{
    untagDate: string;
    completedBy: string;
    untagSteps: string[];
    notes: string;
  }>({
    untagDate: '',
    completedBy: '',
    untagSteps: [],
    notes: '',
  });
  const [untagError, setUntagError] = useState('');

  // Lend equipment state
  const [lendDialogOpen, setLendDialogOpen] = useState(false);
  const [editingLend, setEditingLend] = useState<{
    lendDate: string;
    lentTo: string;
    dueBackDate: string;
    notes: string;
  }>({
    lendDate: '',
    lentTo: '',
    dueBackDate: '',
    notes: '',
  });
  const [lendError, setLendError] = useState('');
  const [isLentOut, setIsLentOut] = useState(false);
  const [currentLend, setCurrentLend] = useState<any>(null);

  // Competency check state
  const [competencyWarningDialogOpen, setCompetencyWarningDialogOpen] = useState(false);
  const [competencyWarningType, setCompetencyWarningType] = useState<'noLessonOrStaff' | 'notCompetent'>('noLessonOrStaff');
  const [pendingLendData, setPendingLendData] = useState<any>(null);

  const [inspectionError, setInspectionError] = useState('');
  const [deleteInspectionDialogOpen, setDeleteInspectionDialogOpen] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState<{
    id: string;
    inspectionDate: string;
  } | null>(null);
  
  // Staff state for autocomplete
  const [staff, setStaff] = useState<Array<{
    userID: string;
    name: string;
    role?: string;
    email?: string;
    progress?: Record<string, { progress: number; competent: boolean }>;
  }>>([]);
  
  // Find equipment by ID
  const equipmentItem = equipment.find(eq => eq.id === id);
  
  // Create refs for each section
  const equipmentInfoRef = React.useRef<HTMLDivElement>(null);
  const inspectionsRef = React.useRef<HTMLDivElement>(null);
  const maintenanceRef = React.useRef<HTMLDivElement>(null);
  const notesManualsRef = React.useRef<HTMLDivElement>(null);
  const sopsRef = React.useRef<HTMLDivElement>(null);
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

  // Fetch maintenance records on mount
  React.useEffect(() => {
    if (equipmentItem?.id) {
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/maintenance`)
        .then(res => res.json())
        .then(data => setMaintenanceRecords(data))
        .catch(error => console.error('Error fetching maintenance records:', error));
    }
  }, [equipmentItem?.id]);

  // Fetch inspection records on mount
  React.useEffect(() => {
    if (equipmentItem?.id) {
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/inspections`)
        .then(res => res.json())
        .then(data => setInspectionRecords(data))
        .catch(error => console.error('Error fetching inspection records:', error));
    }
  }, [equipmentItem?.id]);

  // Fetch tag out status on mount
  React.useEffect(() => {
    if (equipmentItem?.id) {
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/tagout`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setIsTaggedOut(true);
            setCurrentTagOut(data);
          } else {
            setIsTaggedOut(false);
            setCurrentTagOut(null);
          }
        })
        .catch(error => console.error('Error fetching tag out status:', error));
    }
  }, [equipmentItem?.id]);

  // Fetch lend status on mount
  React.useEffect(() => {
    if (equipmentItem?.id) {
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/loan`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setIsLentOut(true);
            setCurrentLend(data);
          } else {
            setIsLentOut(false);
            setCurrentLend(null);
          }
        })
        .catch(error => console.error('Error fetching lend status:', error));
    }
  }, [equipmentItem?.id]);

  // Fetch staff data on mount
  React.useEffect(() => {
    fetch(`${API_BASE}/staff`)
      .then(res => res.json())
      .then(data => setStaff(data))
      .catch(error => console.error('Error fetching staff:', error));
  }, []);

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
    const sections = [equipmentInfoRef, inspectionsRef, maintenanceRef, notesManualsRef, sopsRef];
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
    
    const refs = [equipmentInfoRef, inspectionsRef, maintenanceRef, notesManualsRef, sopsRef];
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

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleEditClick = (equipment: Equipment) => {
    setEditEquipment({
      id: equipment.id,
      name: equipment.name,
      type: equipment.type,
      code: equipment.code,
      location: equipment.location,
      purchasePrice: equipment.purchasePrice ? `$${equipment.purchasePrice}` : '',
    });
    setEditFieldError('');
    setEditDialogOpen(true);
  };

  const handleEditEquipment = () => {
    setEditFieldError('');
    const { id, name, type, code, location, purchasePrice } = editEquipment;
    if (!name.trim() || !type || !location.trim()) {
      setEditFieldError('Name, Type, and Location are required.');
      return;
    }
    
    // Update the equipment in the backend
    fetch(`${API_BASE}/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: name.trim(), 
        type, 
        code: code.trim(), 
        location: location.trim(),
        ...(purchasePrice && purchasePrice.trim() && purchasePrice !== '$' ? { 
          purchasePrice: parseFloat(purchasePrice.replace('$', '')) 
        } : {})
      }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          showNotification('Equipment updated successfully!', 'success');
          // Refresh the page to get updated data
          window.location.reload();
        } else {
          setEditFieldError('Failed to update equipment.');
          showNotification('Failed to update equipment.', 'error');
        }
      })
      .catch(() => {
        setEditFieldError('Failed to update equipment.');
        showNotification('Failed to update equipment.', 'error');
      });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleViewDetails = () => {
    handleMenuClose();
    setDetailsDialogOpen(true);
  };

  const handleEditFromMenu = () => {
    handleMenuClose();
    if (equipmentItem) {
      handleEditClick(equipmentItem);
    }
  };

  const handleDeleteFromMenu = () => {
    handleMenuClose();
    if (equipmentItem) {
      handleDeleteClick(equipmentItem);
    }
  };

  // Helper function to get upcoming inspection date
  const getUpcomingInspection = () => {
    if (!inspectionRecords || inspectionRecords.length === 0) return null;
    
    const upcoming = inspectionRecords
      .filter(record => new Date(record.nextInspectionDue) > new Date())
      .sort((a, b) => new Date(a.nextInspectionDue).getTime() - new Date(b.nextInspectionDue).getTime());
    
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  // Helper function to get upcoming maintenance date
  const getUpcomingMaintenance = () => {
    if (!maintenanceRecords || maintenanceRecords.length === 0) return null;
    
    const upcoming = maintenanceRecords
      .filter(record => new Date(record.nextServiceDue) > new Date())
      .sort((a, b) => new Date(a.nextServiceDue).getTime() - new Date(b.nextServiceDue).getTime());
    
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  // Helper function to calculate days until due
  const getDaysUntilDue = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDeleteClick = (equipment: Equipment) => {
    setEditEquipment({
      id: equipment.id,
      name: equipment.name,
      type: equipment.type,
      code: equipment.code,
      location: equipment.location,
      purchasePrice: equipment.purchasePrice ? `$${equipment.purchasePrice}` : '',
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
            showNotification('Equipment deleted successfully!', 'success');
            // Navigate back to equipment page
            navigate('/equipment');
          } else {
            setEditFieldError('Failed to delete equipment.');
            showNotification('Failed to delete equipment.', 'error');
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
          showNotification('Photo uploaded successfully!', 'success');
          // Refresh the page to show the new photo
          window.location.reload();
        } else {
          setPhotoError('Failed to upload photo. Please try again.');
          showNotification('Failed to upload photo. Please try again.', 'error');
        }
      })
      .catch(() => {
        setPhotoError('Failed to upload photo. Please check your connection and try again.');
        showNotification('Failed to upload photo. Please check your connection and try again.', 'error');
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
            showNotification('Photo removed successfully!', 'success');
            // Refresh the page to get updated data
            window.location.reload();
          } else {
            showNotification('Failed to remove photo.', 'error');
          }
        })
        .catch(error => {
          console.error('Error deleting photo:', error);
          showNotification('Failed to remove photo.', 'error');
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
            showNotification('Note updated successfully!', 'success');
          } else {
            setNoteError('Failed to update note.');
            showNotification('Failed to update note.', 'error');
          }
        })
        .catch(error => {
          console.error('Error updating note:', error);
          setNoteError('Failed to update note.');
          showNotification('Failed to update note.', 'error');
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
            showNotification('Note added successfully!', 'success');
          } else {
            setNoteError('Failed to add note.');
            showNotification('Failed to add note.', 'error');
          }
        })
        .catch(error => {
          console.error('Error adding note:', error);
          setNoteError('Failed to add note.');
          showNotification('Failed to add note.', 'error');
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
          showNotification('Note deleted successfully!', 'success');
        } else {
          console.error('Failed to delete note');
          showNotification('Failed to delete note.', 'error');
        }
      })
      .catch(error => {
        console.error('Error deleting note:', error);
        showNotification('Failed to delete note.', 'error');
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
            showNotification('Manual uploaded successfully!', 'success');
          } else {
            setManualError('Failed to upload manual.');
            showNotification('Failed to upload manual.', 'error');
          }
        })
        .catch(error => {
          console.error('Error uploading manual:', error);
          setManualError('Failed to upload manual.');
          showNotification('Failed to upload manual.', 'error');
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
            showNotification('Manual saved successfully!', 'success');
          } else {
            setManualError('Failed to save manual.');
            showNotification('Failed to save manual.', 'error');
          }
        })
        .catch(error => {
          console.error('Error saving manual:', error);
          setManualError('Failed to save manual.');
          showNotification('Failed to save manual.', 'error');
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
          showNotification('Manual deleted successfully!', 'success');
        } else {
          console.error('Failed to delete manual');
          showNotification('Failed to delete manual.', 'error');
        }
      })
      .catch(error => {
        console.error('Error deleting manual:', error);
        showNotification('Failed to delete manual.', 'error');
      });
  };

  // Maintenance management functions
  const handleOpenMaintenanceDialog = () => {
    setEditingMaintenance({ id: null, serviceDate: '', workUndertaken: '', completedBy: '', nextServiceDue: '', photos: [] });
    setMaintenanceError('');
    setMaintenanceDialogOpen(true);
  };

  const handleEditMaintenance = (maintenance: { id: string; serviceDate: string; workUndertaken: string; completedBy: string; nextServiceDue: string; createdAt: string; photos?: string[] }) => {
    setEditingMaintenance({ id: maintenance.id, serviceDate: maintenance.serviceDate, workUndertaken: maintenance.workUndertaken, completedBy: maintenance.completedBy, nextServiceDue: maintenance.nextServiceDue, photos: [] });
    setMaintenanceError('');
    setMaintenanceDialogOpen(true);
  };

  const handleSaveMaintenance = () => {
    setMaintenanceError('');
    const { serviceDate, workUndertaken, completedBy, nextServiceDue } = editingMaintenance;
    
    if (!serviceDate.trim() || !workUndertaken.trim() || !completedBy.trim()) {
      setMaintenanceError('Service date, work undertaken, and completed by are required.');
      return;
    }

    if (!equipmentItem?.id) {
      setMaintenanceError('Equipment not found.');
      return;
    }

    if (editingMaintenance.id) {
      // Edit existing maintenance record
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/maintenance/${editingMaintenance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceDate: serviceDate.trim(), workUndertaken: workUndertaken.trim(), completedBy: completedBy.trim(), nextServiceDue: nextServiceDue.trim() })
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setMaintenanceRecords(prevRecords => 
              prevRecords.map(record => 
                record.id === editingMaintenance.id 
                  ? result.maintenanceRecord
                  : record
              )
            );
            setMaintenanceDialogOpen(false);
            setEditingMaintenance({ id: null, serviceDate: '', workUndertaken: '', completedBy: '', nextServiceDue: '', photos: [] });
            showNotification('Maintenance record updated successfully!', 'success');
          } else {
            setMaintenanceError('Failed to update maintenance record.');
            showNotification('Failed to update maintenance record.', 'error');
          }
        })
        .catch(error => {
          console.error('Error updating maintenance record:', error);
          setMaintenanceError('Failed to update maintenance record.');
          showNotification('Failed to update maintenance record.', 'error');
        });
    } else {
      // Add new maintenance record
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceDate: serviceDate.trim(), workUndertaken: workUndertaken.trim(), completedBy: completedBy.trim(), nextServiceDue: nextServiceDue.trim() })
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            const newRecord = result.maintenanceRecord;
            
            // Upload photos if any
            if (editingMaintenance.photos.length > 0) {
              const formData = new FormData();
              editingMaintenance.photos.forEach(photo => {
                formData.append('photos', photo);
              });

              return fetch(`${API_BASE}/equipment/${equipmentItem.id}/maintenance/${newRecord.id}/photos`, {
                method: 'POST',
                body: formData
              })
                .then(res => res.json())
                .then(photoResult => {
                  if (photoResult.success) {
                    newRecord.photos = photoResult.photos;
                  }
                  return newRecord;
                })
                .catch(error => {
                  console.error('Error uploading photos:', error);
                  return newRecord; // Return the record even if photo upload fails
                });
            }
            return newRecord;
          } else {
            throw new Error('Failed to add maintenance record.');
          }
        })
        .then(newRecord => {
          setMaintenanceRecords(prevRecords => [...prevRecords, newRecord]);
          setMaintenanceDialogOpen(false);
          setEditingMaintenance({ id: null, serviceDate: '', workUndertaken: '', completedBy: '', nextServiceDue: '', photos: [] });
          showNotification('Maintenance record added successfully!', 'success');
        })
        .catch(error => {
          console.error('Error adding maintenance record:', error);
          setMaintenanceError('Failed to add maintenance record.');
          showNotification('Failed to add maintenance record.', 'error');
        });
    }
  };

  const handleDeleteMaintenance = (recordId: string) => {
    const recordToDelete = maintenanceRecords.find(record => record.id === recordId);
    if (recordToDelete) {
      setMaintenanceToDelete({ id: recordToDelete.id, serviceDate: recordToDelete.serviceDate });
      setDeleteMaintenanceDialogOpen(true);
    }
  };

  const handleConfirmDeleteMaintenance = () => {
    if (!equipmentItem?.id || !maintenanceToDelete) return;
    
    fetch(`${API_BASE}/equipment/${equipmentItem.id}/maintenance/${maintenanceToDelete.id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setMaintenanceRecords(prevRecords => prevRecords.filter(record => record.id !== maintenanceToDelete.id));
        } else {
          console.error('Failed to delete maintenance record');
        }
      })
      .catch(error => {
        console.error('Error deleting maintenance record:', error);
      })
      .finally(() => {
        setDeleteMaintenanceDialogOpen(false);
        setMaintenanceToDelete(null);
      });
  };

  const handleViewMaintenance = (maintenance: { id: string; serviceDate: string; workUndertaken: string; completedBy: string; nextServiceDue: string; createdAt: string; photos?: string[] }) => {
    setSelectedMaintenance(maintenance);
    setMaintenanceDetailDialogOpen(true);
  };

  // Photo upload handlers for maintenance
  const handleMaintenancePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files);
      setEditingMaintenance(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    }
  };

  const handleRemoveMaintenancePhoto = (index: number) => {
    setEditingMaintenance(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Date calculation handlers
  const handleCalculateNextService = (months: number) => {
    if (!editingMaintenance.serviceDate) {
      setMaintenanceError('Please set a service date first.');
      return;
    }
    
    const serviceDate = new Date(editingMaintenance.serviceDate);
    const nextServiceDate = new Date(serviceDate);
    nextServiceDate.setMonth(nextServiceDate.getMonth() + months);
    
    setEditingMaintenance(prev => ({
      ...prev,
      nextServiceDue: nextServiceDate.toISOString().split('T')[0]
    }));
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingMaintenance(prev => ({
      ...prev,
      serviceDate: today
    }));
  };

  // Inspection areas data with descriptions
  const inspectionAreas = [
    { name: 'General Condition', description: 'Signs of damage, corrosion, wear, or fatigue' },
    { name: 'Guards & Safety Covers', description: 'In place, secure, undamaged, not bypassed or removed' },
    { name: 'Emergency Stop', description: 'Working correctly, clearly labelled, easily accessible' },
    { name: 'Power Supply / Cables', description: 'No fraying, kinks, exposed wires, correct plugs fitted' },
    { name: 'Controls & Switches', description: 'Operational, labelled, no sticking or malfunction' },
    { name: 'Moving Parts / Belts', description: 'Tension, alignment, wear, lubrication as required' },
    { name: 'Fasteners / Fittings', description: 'Bolts, screws, brackets tight and not missing' },
    { name: 'Noise & Vibration', description: 'Any abnormal sounds or excessive vibration during operation' },
    { name: 'Signage & Labels', description: 'Warning stickers, SOP nearby, risk level displayed' },
    { name: 'Filters / Vents', description: 'Clear of dust, grease, debris – especially on extraction units' },
    { name: 'Function Test', description: 'Machine operates as expected under normal conditions' },
    { name: 'Lockout / Tagout Items', description: 'Tags, locks in place for out-of-service equipment' },
    { name: 'Cleanliness', description: 'Free from dust, oil, shavings, spills' },
    { name: 'SOP Accessibility', description: 'Printed and legible SOP nearby or attached to equipment' },
    { name: 'Maintenance Log Updated', description: 'EMR signed, dated, and issues noted for action' }
  ];

  // Inspection handlers
  const handleOpenInspectionDialog = () => {
    setEditingInspection({
      id: null,
      inspectionDate: '',
      completedBy: '',
      nextInspectionDue: '',
      inspectionAreas: [],
    });
    setInspectionError('');
    setInspectionDialogOpen(true);
  };

  const handleEditInspection = (inspection: { id: string; inspectionDate: string; completedBy: string; nextInspectionDue: string; inspectionAreas: string[]; createdAt: string }) => {
    setEditingInspection({
      id: inspection.id,
      inspectionDate: inspection.inspectionDate,
      completedBy: inspection.completedBy,
      nextInspectionDue: inspection.nextInspectionDue,
      inspectionAreas: inspection.inspectionAreas,
    });
    setInspectionError('');
    setInspectionDialogOpen(true);
  };

  const handleSaveInspection = () => {
    setInspectionError('');
    const { inspectionDate, completedBy, inspectionAreas } = editingInspection;
    if (!inspectionDate || !completedBy || inspectionAreas.length === 0) {
      setInspectionError('Inspection date, completed by, and at least one inspection area are required.');
      return;
    }

    if (editingInspection.id && equipmentItem?.id) {
      // Edit existing inspection
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/inspections/${editingInspection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingInspection)
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            const updated = inspectionRecords.map(record => 
              record.id === editingInspection.id ? result.inspection : record
            );
            setInspectionRecords(updated);
            setInspectionDialogOpen(false);
            setEditingInspection({
              id: null,
              inspectionDate: '',
              completedBy: '',
              nextInspectionDue: '',
              inspectionAreas: [],
            });
            showNotification('Inspection record updated successfully!', 'success');
          } else {
            setInspectionError('Failed to update inspection record.');
            showNotification('Failed to update inspection record.', 'error');
          }
        })
        .catch(() => {
          setInspectionError('Failed to update inspection record.');
          showNotification('Failed to update inspection record.', 'error');
        });
    } else if (equipmentItem?.id) {
      // Add new inspection
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingInspection)
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            const newRecord = result.inspection;
            const updated = [...inspectionRecords, newRecord];
            setInspectionRecords(updated);
            setInspectionDialogOpen(false);
            setEditingInspection({
              id: null,
              inspectionDate: '',
              completedBy: '',
              nextInspectionDue: '',
              inspectionAreas: [],
            });
            showNotification('Inspection record added successfully!', 'success');
          } else {
            setInspectionError('Failed to add inspection record.');
            showNotification('Failed to add inspection record.', 'error');
          }
        })
        .catch(() => {
          setInspectionError('Failed to add inspection record.');
          showNotification('Failed to add inspection record.', 'error');
        });
    }
  };

  const handleDeleteInspection = (recordId: string) => {
    const inspectionToDelete = inspectionRecords.find(r => r.id === recordId);
    if (inspectionToDelete) {
      setInspectionToDelete(inspectionToDelete);
      setDeleteInspectionDialogOpen(true);
    }
  };

  const handleConfirmDeleteInspection = () => {
    if (inspectionToDelete && equipmentItem?.id) {
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/inspections/${inspectionToDelete.id}`, {
        method: 'DELETE'
      })
        .then(() => {
          const updated = inspectionRecords.filter(r => r.id !== inspectionToDelete.id);
          setInspectionRecords(updated);
          setDeleteInspectionDialogOpen(false);
          setInspectionToDelete(null);
        });
    }
  };

  const handleViewInspection = (inspection: { id: string; inspectionDate: string; completedBy: string; nextInspectionDue: string; inspectionAreas: string[]; createdAt: string }) => {
    setSelectedInspection(inspection);
    setInspectionDetailDialogOpen(true);
  };

  // Date calculation handlers for inspections
  const handleCalculateNextInspection = (months: number) => {
    if (!editingInspection.inspectionDate) {
      setInspectionError('Please set an inspection date first.');
      return;
    }
    
    const inspectionDate = new Date(editingInspection.inspectionDate);
    const nextInspectionDate = new Date(inspectionDate);
    nextInspectionDate.setMonth(nextInspectionDate.getMonth() + months);
    
    setEditingInspection(prev => ({
      ...prev,
      nextInspectionDue: nextInspectionDate.toISOString().split('T')[0]
    }));
  };

  const handleSetInspectionToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingInspection(prev => ({
      ...prev,
      inspectionDate: today
    }));
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

  // Fetch linked lesson for this equipment
  useEffect(() => {
    if (equipmentItem?.id) {
      fetch(`${API_BASE}/equipment/${equipmentItem.id}/lessons`)
        .then(res => res.json())
        .then(data => setLinkedLesson(data.linkedLesson || null));
    }
  }, [equipmentItem?.id]);

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

  const handleLinkLesson = () => {
    if (!equipmentItem?.id || !selectedLesson) return;
    
    // Find the lesson by name to get its ID
    const lesson = lessons.find(l => l.name === selectedLesson);
    if (!lesson) {
      console.error('Lesson not found');
      return;
    }
    
    fetch(`${API_BASE}/equipment/${equipmentItem.id}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: lesson.id })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setLinkedLesson(result.linkedLesson);
          setLinkLessonDialogOpen(false);
          showNotification('Lesson linked successfully!', 'success');
        } else {
          console.error('Failed to link lesson');
          showNotification('Failed to link lesson.', 'error');
        }
      })
      .catch(error => {
        console.error('Error linking lesson:', error);
        showNotification('Failed to link lesson.', 'error');
      });
  };

  const handleUnlinkLesson = () => {
    if (!equipmentItem?.id || !linkedLesson) return;
    
    fetch(`${API_BASE}/equipment/${equipmentItem.id}/lessons`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setLinkedLesson(null);
          showNotification('Lesson unlinked successfully!', 'success');
        } else {
          console.error('Failed to unlink lesson');
          showNotification('Failed to unlink lesson.', 'error');
        }
      })
      .catch(error => {
        console.error('Error unlinking lesson:', error);
        showNotification('Failed to unlink lesson.', 'error');
      });
  };

  // Tag/Lock Out handlers
  const handleOpenTagOutDialog = () => {
    if (isTaggedOut) {
      // If already tagged out, untag it
                              handleOpenUntagDialog();
    } else {
      // Open tag out dialog
      setEditingTagOut({
        id: null,
        tagOutDate: new Date().toISOString().split('T')[0],
        completedBy: '',
        tagOutSteps: [],
        notes: '',
      });
      setTagOutError('');
      setTagOutDialogOpen(true);
    }
  };

  const handleTagOutStepToggle = (step: string) => {
    setEditingTagOut(prev => ({
      ...prev,
      tagOutSteps: prev.tagOutSteps.includes(step)
        ? prev.tagOutSteps.filter(s => s !== step)
        : [...prev.tagOutSteps, step]
    }));
  };

  const handleSelectAllTagOutSteps = () => {
    setEditingTagOut(prev => ({
      ...prev,
      tagOutSteps: [...tagOutSteps]
    }));
  };

  const handleSaveTagOut = () => {
    if (!equipmentItem?.id) return;

    if (!editingTagOut.tagOutDate) {
      setTagOutError('Please select a date.');
      return;
    }
    if (!editingTagOut.completedBy) {
      setTagOutError('Please enter who completed the tag out.');
      return;
    }
    if (editingTagOut.tagOutSteps.length === 0) {
      setTagOutError('Please complete at least one tag out step.');
      return;
    }

    const tagOutData = {
      ...editingTagOut,
      createdAt: new Date().toISOString(),
    };

    // Save tag out record
    fetch(`${API_BASE}/equipment/${equipmentItem.id}/tagout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tagOutData)
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setIsTaggedOut(true);
          setCurrentTagOut(result.tagOut);
          setTagOutDialogOpen(false);
          showNotification('Equipment tagged out successfully!', 'success');
          
          // Add to notes
          const noteContent = `Equipment Tagged Out on ${new Date(editingTagOut.tagOutDate).toLocaleDateString()} • Completed by: ${editingTagOut.completedBy} • Steps completed: ${editingTagOut.tagOutSteps.join(', ')} • Reason: ${editingTagOut.notes}`;
          
          const noteData = {
            title: 'Equipment Tagged Out',
            content: noteContent,
            createdAt: new Date().toISOString(),
          };

          fetch(`${API_BASE}/equipment/${equipmentItem.id}/notes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
          })
            .then(res => res.json())
            .then(noteResult => {
              if (noteResult.success) {
                setNotes(prev => [noteResult.note, ...prev]);
              }
            })
            .catch(error => {
              console.error('Error adding note:', error);
            });
        } else {
          setTagOutError('Failed to tag out equipment.');
          showNotification('Failed to tag out equipment.', 'error');
        }
      })
      .catch(error => {
        console.error('Error tagging out equipment:', error);
        setTagOutError('Failed to tag out equipment.');
        showNotification('Failed to tag out equipment.', 'error');
      });
  };

  const handleOpenUntagDialog = () => {
    setEditingUntag({
      untagDate: new Date().toISOString().split('T')[0],
      completedBy: '',
      untagSteps: [],
      notes: '',
    });
    setUntagError('');
    setUntagDialogOpen(true);
  };

  const handleUntagStepToggle = (step: string) => {
    setEditingUntag(prev => ({
      ...prev,
      untagSteps: prev.untagSteps.includes(step)
        ? prev.untagSteps.filter(s => s !== step)
        : [...prev.untagSteps, step]
    }));
  };

  const handleSelectAllUntagSteps = () => {
    setEditingUntag(prev => ({
      ...prev,
      untagSteps: untagSteps
    }));
  };

  const handleSaveUntag = () => {
    setUntagError('');
    const { untagDate, completedBy, untagSteps: selectedSteps, notes } = editingUntag;
    
    if (!untagDate.trim()) {
      setUntagError('Date is required.');
      return;
    }

    if (!completedBy.trim()) {
      setUntagError('Completed by is required.');
      return;
    }

    if (selectedSteps.length === 0) {
      setUntagError('Please select at least one step.');
      return;
    }

    if (!equipmentItem?.id) {
      setUntagError('Equipment not found.');
      return;
    }

    // First, untag the equipment
    fetch(`${API_BASE}/equipment/${equipmentItem.id}/tagout`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setIsTaggedOut(false);
          setCurrentTagOut(null);
          setUntagDialogOpen(false);
          showNotification('Equipment untagged successfully!', 'success');
          
          // Add untag note with detailed information
          const noteContent = `Equipment Untagged on ${new Date(untagDate).toLocaleDateString()} • Completed by: ${completedBy} • Steps completed: ${selectedSteps.join(', ')} • Notes: ${notes}`;
          
          const noteData = {
            title: 'Equipment Untagged',
            content: noteContent,
            createdAt: new Date().toISOString(),
          };

          fetch(`${API_BASE}/equipment/${equipmentItem.id}/notes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
          })
            .then(res => res.json())
            .then(noteResult => {
              if (noteResult.success) {
                setNotes(prev => [noteResult.note, ...prev]);
              }
            })
            .catch(error => {
              console.error('Error adding note:', error);
            });
        } else {
          setUntagError('Failed to untag equipment.');
          showNotification('Failed to untag equipment.', 'error');
        }
      })
      .catch(error => {
        console.error('Error untagging equipment:', error);
        setUntagError('Failed to untag equipment.');
        showNotification('Failed to untag equipment.', 'error');
      });
  };

  // Lend equipment handlers
  const handleOpenLendDialog = () => {
    if (isLentOut) {
      // If already lent out, handle return
      handleReturnEquipment();
    } else {
      // Open lend dialog
      setEditingLend({
        lendDate: new Date().toISOString().split('T')[0],
        lentTo: '',
        dueBackDate: '',
        notes: ''
      });
      setLendError('');
      setLendDialogOpen(true);
    }
  };

  const handleReturnEquipment = () => {
    if (!equipmentItem?.id || !currentLend) return;

    const returnNoteContent = `Equipment returned on ${new Date().toISOString().split('T')[0]} • Previously lent to: ${currentLend.lentTo} • Due back: ${currentLend.dueBackDate}`;
    
    const noteData = {
      title: 'Equipment Returned',
      content: returnNoteContent,
      createdAt: new Date().toISOString(),
    };

    // Remove lend status
    fetch(`${API_BASE}/equipment/${equipmentItem.id}/loan`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setIsLentOut(false);
          setCurrentLend(null);
          showNotification('Equipment returned successfully!', 'success');
          
          // Add return note
          fetch(`${API_BASE}/equipment/${equipmentItem.id}/notes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
          })
            .then(res => res.json())
            .then(noteResult => {
              if (noteResult.success) {
                setNotes(prev => [noteResult.note, ...prev]);
              }
            })
            .catch(error => {
              console.error('Error adding note:', error);
            });
        } else {
          showNotification('Failed to return equipment.', 'error');
        }
      })
      .catch(error => {
        console.error('Error returning equipment:', error);
        showNotification('Failed to return equipment.', 'error');
      });
  };

  const handleSaveLend = async () => {
    setLendError('');
    const { lendDate, lentTo, dueBackDate, notes } = editingLend;
    
    if (!lendDate.trim()) {
      setLendError('Lend date is required.');
      return;
    }

    if (!lentTo.trim()) {
      setLendError('Lent to is required.');
      return;
    }

    if (!dueBackDate.trim()) {
      setLendError('Due back date is required.');
      return;
    }

    if (!equipmentItem?.id) {
      setLendError('Equipment not found.');
      return;
    }

    // Create lend record
    const lendData = {
      lendDate,
      lentTo,
      dueBackDate,
      notes,
      createdAt: new Date().toISOString(),
    };

    // Check competency before proceeding
    const competencyCheckPassed = await handleCompetencyCheck(lendData);
    if (!competencyCheckPassed) {
      return; // Warning dialog will be shown
    }

    // Proceed with lending if competency check passed
    proceedWithLending(lendData);
  };

  // Competency check functions
  const checkCompetency = async (personName: string) => {
    if (!equipmentItem?.id) {
      return { hasLinkedLesson: false, isStaffMember: false, isCompetent: false };
    }
    
    // Check if equipment has linked lesson
    const linkedLessonResponse = await fetch(`${API_BASE}/equipment/${equipmentItem.id}/lessons`);
    const linkedLessonData = await linkedLessonResponse.json();
    const hasLinkedLesson = linkedLessonData.success && linkedLessonData.linkedLesson;
    
    // Check if person is a staff member
    const staffMember = staff.find(s => s.name.toLowerCase() === personName.toLowerCase());
    const isStaffMember = !!staffMember;

    // If no linked lesson, we can't check competency
    if (!hasLinkedLesson) {
      return { hasLinkedLesson: false, isStaffMember, isCompetent: false };
    }

    // If person is not a staff member, we can't check competency
    if (!isStaffMember) {
      return { hasLinkedLesson: true, isStaffMember: false, isCompetent: false };
    }

    // Check if staff member is competent in the linked lesson
    const lessonName = linkedLessonData.linkedLesson.name;
    const staffProgress = staffMember.progress?.[lessonName];
    const isCompetent = staffProgress?.competent === true;

    return { 
      hasLinkedLesson: true, 
      isStaffMember: true, 
      isCompetent 
    };
  };

  const handleCompetencyCheck = async (lendData: any) => {
    const competencyResult = await checkCompetency(lendData.lentTo);
    
    if (!competencyResult.hasLinkedLesson || !competencyResult.isStaffMember) {
      // No linked lesson or person not in system
      setCompetencyWarningType('noLessonOrStaff');
      setPendingLendData({ ...lendData, competencyResult });
      setCompetencyWarningDialogOpen(true);
      return false;
    } else if (!competencyResult.isCompetent) {
      // Staff member not competent
      setCompetencyWarningType('notCompetent');
      setPendingLendData(lendData);
      setCompetencyWarningDialogOpen(true);
      return false;
    }
    
    return true; // Competency check passed
  };

  const handleConfirmLendWithWarning = () => {
    if (pendingLendData) {
      setCompetencyWarningDialogOpen(false);
      setPendingLendData(null);
      // Proceed with lending despite warning
      proceedWithLending(pendingLendData);
    }
  };

  const handleCancelLendWithWarning = () => {
    setCompetencyWarningDialogOpen(false);
    setPendingLendData(null);
  };

  const proceedWithLending = (lendData: any) => {
    if (!equipmentItem?.id) {
      setLendError('Equipment not found.');
      return;
    }
    
    fetch(`${API_BASE}/equipment/${equipmentItem.id}/loan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lendData)
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setIsLentOut(true);
          setCurrentLend(result.loan);
          setLendDialogOpen(false);
          showNotification('Equipment lent successfully!', 'success');
          
          // Add lend note
          const noteContent = `Equipment lent on ${new Date(lendData.lendDate).toLocaleDateString()} • Lent to: ${lendData.lentTo} • Due back: ${new Date(lendData.dueBackDate).toLocaleDateString()} • Notes: ${lendData.notes}`;
          
          const noteData = {
            title: 'Equipment Lent',
            content: noteContent,
            createdAt: new Date().toISOString(),
          };

          fetch(`${API_BASE}/equipment/${equipmentItem.id}/notes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
          })
            .then(res => res.json())
            .then(noteResult => {
              if (noteResult.success) {
                setNotes(prev => [noteResult.note, ...prev]);
              }
            })
            .catch(error => {
              console.error('Error adding note:', error);
            });
        } else {
          setLendError('Failed to lend equipment.');
          showNotification('Failed to lend equipment.', 'error');
        }
      })
      .catch(error => {
        console.error('Error lending equipment:', error);
        setLendError('Failed to lend equipment.');
        showNotification('Failed to lend equipment.', 'error');
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
        <Link component={RouterLink} underline="hover" color="inherit" to="/equipment" key="equipment" sx={{ fontWeight: 600, fontSize: 18 }}>Equipment</Link>,
        <Typography key="details" color="text.primary" sx={{ fontWeight: 600, fontSize: 18 }}>{equipmentItem.name}</Typography>
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 240, right: 0, zIndex: 1099 }}>
        {/* Tabs */}
        <Box sx={{ bgcolor: '#fff', borderBottom: `1px solid ${colors.border}`, pt: 1, pb: 0.5 }}>
          <Box sx={{ 
            maxWidth: 1000, 
            mx: 'auto', 
            px: 8,
            width: '100%'
          }}>
            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 0 }} textColor="primary" indicatorColor="primary">
              <Tab label="Equipment Info" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              <Tab label="Inspections" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              <Tab label="Maintenance" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              <Tab label="Notes & Manuals" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
              <Tab label="SOPs" sx={{ fontWeight: 600, fontSize: 16, textTransform: 'none' }} />
            </Tabs>
          </Box>
        </Box>

        {/* Content */}
        <Box ref={contentRef} sx={{ flex: 1, overflowY: 'auto' }}>
          <Box sx={{ maxWidth: 1000, mx: 'auto', px: 4, py: 4 }}>
            {/* Equipment Info Tiles Section - Two Columns */}
            <Box ref={equipmentInfoRef} sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {/* First Column - Equipment Info Section with Photo */}
              <Paper elevation={1} sx={{ flex: 1, px: 3, py: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 3, minWidth: 0, position: 'relative' }}>
                {/* Photo Section */}
                <Box sx={{ width: 130, height: 130, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
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
                  {/* Linked Lesson Display */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, minHeight: '34px' }}>
                    <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 14, fontFamily: 'Montserrat, sans-serif', mr: 1 }}>
                      Related Lesson:
                    </Typography>
                    {linkedLesson ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                          {linkedLesson.name}
                        </Typography>
                        <Tooltip title="Unlink Lesson" arrow>
                          <IconButton size="small" sx={{ color: '#9ca3af', ml: 0.5, '&:hover': { color: '#ef4444' } }} onClick={handleUnlinkLesson}>
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
                </Box>

                {/* Action Buttons - Top Right */}
                <Box sx={{ position: 'absolute', top: 8, right: 12 }}>
                  <Tooltip title="More actions" arrow>
                    <IconButton 
                      size="small" 
                      sx={{ color: '#9ca3af', width: 28, height: 28 }} 
                      onClick={handleMenuClick}
                    >
                      <MoreVertIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={handleViewDetails}>
                      <VisibilityIcon sx={{ fontSize: 16, mr: 1, color: colors.iconPrimary }} />
                      View Details
                    </MenuItem>
                    <MenuItem onClick={handleEditFromMenu}>
                      <EditIcon sx={{ fontSize: 16, mr: 1, color: colors.iconPrimary }} />
                      Edit
                    </MenuItem>
                    <MenuItem onClick={handleDeleteFromMenu}>
                      <DeleteIcon sx={{ fontSize: 16, mr: 1, color: '#e57373' }} />
                      Delete
                    </MenuItem>
                  </Menu>
                </Box>
              </Paper>

              {/* Second Column - Action Buttons and Display Information */}
              <Paper elevation={1} sx={{ flex: 1, px: 3, py: 3, borderRadius: 2, display: 'flex', alignItems: 'flex-start', gap: 3, minWidth: 0, position: 'relative' }}>
                {/* Left Side - Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                  <Typography sx={{ color: '#888', fontWeight: 700, fontSize: 13, mb: 0.5 }}>
                    Quick Actions
                  </Typography>
                  
                  {/* Tag / Lock Out Equipment Button */}
                  <Tooltip 
                    title={isLentOut ? "Equipment must be returned before tagging out" : ""} 
                    arrow
                    disableHoverListener={!isLentOut}
                  >
                    <span style={{ width: '100%' }}>
                      <Button
                        {...(isLentOut ? buttonStyles.disabled : (isTaggedOut ? buttonStyles.successFull : buttonStyles.dangerFull))}
                        startIcon={isTaggedOut ? <LockOpenIcon /> : <BlockIcon />}
                        size="small"
                        disabled={isLentOut}
                        onClick={handleOpenTagOutDialog}
                      >
                        {isTaggedOut ? 'Untag / Unlock' : 'Tag / Lock Out'}
                      </Button>
                    </span>
                  </Tooltip>

                  {/* Lend Equipment Button */}
                  <Tooltip 
                    title={isTaggedOut ? "Equipment must be untagged before lending" : ""} 
                    arrow
                    disableHoverListener={!isTaggedOut}
                  >
                    <span style={{ width: '100%' }}>
                      <Button
                        {...(isTaggedOut ? buttonStyles.disabled : buttonStyles.secondaryFull)}
                        startIcon={<HandshakeIcon />}
                        size="small"
                        disabled={isTaggedOut}
                        onClick={handleOpenLendDialog}
                      >
                        {isLentOut ? 'Return Equipment' : 'Lend Equipment'}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>

                {/* Right Side - Status Information */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                  <Typography sx={{ color: '#888', fontWeight: 700, fontSize: 13, mb: 0.5 }}>
                    Status
                  </Typography>
                  
                  {/* Equipment Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      bgcolor: isTaggedOut ? '#ef4444' : isLentOut ? '#f59e0b' : '#10b981',
                      flexShrink: 0 
                    }} />
                    <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 13, fontFamily: 'Montserrat, sans-serif' }}>
                      {isTaggedOut ? 'Locked / Tagged Out' : isLentOut ? `Lent to ${currentLend?.lentTo}` : 'Available'}
                    </Typography>
                  </Box>

                  {/* Status Details */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {isLentOut && currentLend?.dueBackDate && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: 11 }}>
                          Due Back:
                        </Typography>
                        <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}>
                          {new Date(currentLend.dueBackDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: 11 }}>
                        Last Maintenance:
                      </Typography>
                      <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}>
                        {maintenanceRecords.length > 0 
                          ? new Date(maintenanceRecords[0].serviceDate).toLocaleDateString()
                          : 'No records'
                        }
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: 11 }}>
                        Next Inspection:
                      </Typography>
                      <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}>
                        {inspectionRecords.length > 0 && inspectionRecords[0].nextInspectionDue
                          ? new Date(inspectionRecords[0].nextInspectionDue).toLocaleDateString()
                          : 'Not scheduled'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>

            <div style={{ height: 12 }} />

            {/* Periodic Inspections Section */}
            <div ref={inspectionsRef}>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon sx={{ color: colors.iconPrimary }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Periodic Inspections</Typography>
                  </Box>
                  <Button {...buttonStyles.primary} size="small" startIcon={<AddIcon />} onClick={handleOpenInspectionDialog}>
                    Add Inspection
                  </Button>
                </Box>
                <Box sx={{ 
                  maxHeight: '240px',
                  overflowY: 'auto',
                  bgcolor: colors.containerPaper, 
                  borderRadius: 2, 
                  p: 2, 
                  border: `1px solid ${colors.border}` 
                }}>
                  {inspectionRecords.length === 0 ? (
                    <Typography sx={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                      No inspection records yet. Click "Add Inspection" to schedule or record inspections.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {inspectionRecords
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((record) => (
                        <Paper 
                          key={record.id} 
                          elevation={0}
                          sx={{ 
                            p: 2,
                            borderRadius: 2, 
                            bgcolor: '#fff', 
                            border: `1px solid ${colors.border}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              transform: 'translateY(-1px)',
                            }
                          }}
                          onClick={() => handleViewInspection(record)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', pt: '4px' }}>
                              <Typography sx={{ 
                                fontWeight: 600, 
                                fontSize: 16, 
                                color: '#374151',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}>
                                Inspection Date: {new Date(record.inspectionDate).toLocaleDateString()}
                              </Typography>
                              <Typography sx={{ 
                                fontSize: 14, 
                                color: '#6b7280',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                              }}>
                                Completed by: {record.completedBy} • Areas: {record.inspectionAreas.length}
                              </Typography>
                              {record.nextInspectionDue && (
                                <Typography sx={{ 
                                  fontSize: 13, 
                                  color: '#9ca3af',
                                  fontStyle: 'italic'
                                }}>
                                  Next inspection due: {new Date(record.nextInspectionDue).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexShrink: 0, pt: '4px' }}>
                              <Tooltip title="Edit record" arrow>
                                <IconButton 
                                  size="small" 
                                  sx={{ color: colors.iconPrimary, p: 0.5 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditInspection(record);
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete record" arrow>
                                <IconButton 
                                  size="small" 
                                  sx={{ color: '#e57373', p: 0.5 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteInspection(record.id);
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
            </div>

            <div style={{ height: 12 }} />

            {/* Maintenance Records Section */}
            <div ref={maintenanceRef}>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BuildIcon sx={{ color: colors.iconPrimary }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Maintenance Records</Typography>
                  </Box>
                  <Button {...buttonStyles.primary} size="small" startIcon={<AddIcon />} onClick={handleOpenMaintenanceDialog}>
                    Add Record
                  </Button>
                </Box>
                <Box sx={{ 
                  maxHeight: '240px',
                  overflowY: 'auto',
                  bgcolor: colors.containerPaper, 
                  borderRadius: 2, 
                  p: 2, 
                  border: `1px solid ${colors.border}` 
                }}>
                  {maintenanceRecords.length === 0 ? (
                    <Typography sx={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                      No maintenance records yet. Click "Add Record" to log maintenance activities.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {maintenanceRecords
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((record) => (
                        <Paper 
                          key={record.id} 
                          elevation={0}
                          sx={{ 
                            p: 2,
                            borderRadius: 2, 
                            bgcolor: '#fff', 
                            border: `1px solid ${colors.border}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              transform: 'translateY(-1px)',
                            }
                          }}
                          onClick={() => handleViewMaintenance(record)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', pt: '4px' }}>
                              <Typography sx={{ 
                                fontWeight: 600, 
                                fontSize: 16, 
                                color: '#374151',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}>
                                Service Date: {new Date(record.serviceDate).toLocaleDateString()}
                              </Typography>
                              <Typography sx={{ 
                                fontSize: 14, 
                                color: '#6b7280',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                              }}>
                                Work: {truncateText(record.workUndertaken, 60)} • Completed by: {record.completedBy}
                              </Typography>
                              {record.nextServiceDue && (
                                <Typography sx={{ 
                                  fontSize: 13, 
                                  color: '#9ca3af',
                                  fontStyle: 'italic'
                                }}>
                                  Next service due: {new Date(record.nextServiceDue).toLocaleDateString()}
                                </Typography>
                              )}
                              {record.photos && record.photos.length > 0 && (
                                <Typography sx={{ 
                                  fontSize: 13, 
                                  color: colors.iconPrimary,
                                  fontStyle: 'italic'
                                }}>
                                  📷 {record.photos.length} photo{record.photos.length !== 1 ? 's' : ''}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexShrink: 0, pt: '4px' }}>
                              <Tooltip title="Edit record" arrow>
                                <IconButton 
                                  size="small" 
                                  sx={{ color: colors.iconPrimary, p: 0.5 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditMaintenance(record);
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete record" arrow>
                                <IconButton 
                                  size="small" 
                                  sx={{ color: '#e57373', p: 0.5 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMaintenance(record.id);
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
            </div>

            <div style={{ height: 12 }} />

            {/* Notes and User Manuals Section - Side by Side */}
            <Box ref={notesManualsRef} sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
              {/* Notes Section */}
              <Box sx={{ flex: 1, display: 'flex', minWidth: 0 }}>
                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, width: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NotesIcon sx={{ color: colors.iconPrimary }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Notes</Typography>
                    </Box>
                    <Button {...buttonStyles.primary} size="small" startIcon={<AddIcon />} onClick={handleOpenNoteDialog}>
                      Add Note
                    </Button>
                  </Box>
                  <Box sx={{ 
                    flexGrow: 1,
                    maxHeight: '240px',
                    overflowY: 'auto',
                    bgcolor: colors.containerPaper, 
                    borderRadius: 2, 
                    p: 2, 
                    border: `1px solid ${colors.border}` 
                  }}>
                    {notes.length === 0 ? (
                      <Typography sx={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                        No notes added yet. Click "Add Note" to add spare parts links and other information.
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {notes
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((note) => (
                          <Paper 
                            key={note.id} 
                            elevation={0}
                            sx={{ 
                              p: 2,
                              borderRadius: 2, 
                              bgcolor: '#fff', 
                              border: `1px solid ${colors.border}`,
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
                                    __html: formatNoteContent(truncateText(note.content, 80)) 
                                  }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexShrink: 0, pt: '4px' }}>
                                <Tooltip title="Edit note" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: colors.iconPrimary, p: 0.5 }}
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
              <Box sx={{ flex: 1, display: 'flex', minWidth: 0 }}>
                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, width: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon sx={{ color: colors.iconPrimary }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>User Manuals & Spares</Typography>
                    </Box>
                    <Button {...buttonStyles.primary} size="small" startIcon={<AddIcon />} onClick={handleOpenManualDialog}>
                      Add Manual
                    </Button>
                  </Box>
                  <Box sx={{ 
                    flexGrow: 1,
                    maxHeight: '240px',
                    overflowY: 'auto',
                    bgcolor: colors.containerPaper, 
                    borderRadius: 2, 
                    p: 2, 
                    border: `1px solid ${colors.border}` 
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
                              border: `1px solid ${colors.border}`,
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

            {/* SOPs Section */}
            <div ref={sopsRef}>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon sx={{ color: colors.iconPrimary }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Safe Operating Procedures (SOPs)</Typography>
                  </Box>
                  <Button {...buttonStyles.primary} size="small" startIcon={<AddIcon />}>
                    Add SOP
                  </Button>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: colors.containerPaper, borderRadius: 2, p: 2, border: `1px solid ${colors.border}` }}>
                  <Typography sx={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                    No SOPs uploaded yet. Click "Add SOP" to upload safety procedures and operating instructions.
                  </Typography>
                </Box>
              </Paper>
            </div>
          </Box>
        </Box>

        {/* Equipment Details Dialog */}
        <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24, pb: 1 }}>
            Equipment Details - {equipmentItem?.name}
          </DialogTitle>
          <DialogContent sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Basic Information */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                  Basic Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Equipment ID</Typography>
                    <Typography sx={{ fontSize: 16 }}>{equipmentItem?.id}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Type</Typography>
                    <Typography sx={{ fontSize: 16 }}>{equipmentItem?.type}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Serial Number</Typography>
                    <Typography sx={{ fontSize: 16 }}>{equipmentItem?.code || '—'}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Location</Typography>
                    <Typography sx={{ fontSize: 16 }}>{equipmentItem?.location}</Typography>
                  </Box>
                  {equipmentItem?.purchasePrice && (
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Purchase Price</Typography>
                      <Typography sx={{ fontSize: 16, color: '#2e7d32', fontWeight: 600 }}>
                        ${equipmentItem.purchasePrice.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Upcoming Maintenance & Inspections */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                  Upcoming Schedule
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                  
                  {/* Next Inspection */}
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#6b7280', fontSize: 14, mb: 1 }}>
                      Next Inspection
                    </Typography>
                    {(() => {
                      const upcomingInspection = getUpcomingInspection();
                      if (upcomingInspection) {
                        const daysUntil = getDaysUntilDue(upcomingInspection.nextInspectionDue);
                        return (
                          <Box>
                            <Typography sx={{ fontSize: 16 }}>
                              {new Date(upcomingInspection.nextInspectionDue).toLocaleDateString()}
                            </Typography>
                            <Typography 
                              sx={{ 
                                fontSize: 13, 
                                color: daysUntil <= 7 ? '#d32f2f' : daysUntil <= 30 ? '#f57c00' : '#2e7d32',
                                fontWeight: 600
                              }}
                            >
                              {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days remaining`}
                            </Typography>
                          </Box>
                        );
                      } else {
                        return <Typography sx={{ fontSize: 16, color: '#9ca3af' }}>No upcoming inspections</Typography>;
                      }
                    })()}
                  </Box>

                  {/* Next Maintenance */}
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#6b7280', fontSize: 14, mb: 1 }}>
                      Next Maintenance
                    </Typography>
                    {(() => {
                      const upcomingMaintenance = getUpcomingMaintenance();
                      if (upcomingMaintenance) {
                        const daysUntil = getDaysUntilDue(upcomingMaintenance.nextServiceDue);
                        return (
                          <Box>
                            <Typography sx={{ fontSize: 16 }}>
                              {new Date(upcomingMaintenance.nextServiceDue).toLocaleDateString()}
                            </Typography>
                            <Typography 
                              sx={{ 
                                fontSize: 13, 
                                color: daysUntil <= 7 ? '#d32f2f' : daysUntil <= 30 ? '#f57c00' : '#2e7d32',
                                fontWeight: 600
                              }}
                            >
                              {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days remaining`}
                            </Typography>
                          </Box>
                        );
                      } else {
                        return <Typography sx={{ fontSize: 16, color: '#9ca3af' }}>No upcoming maintenance</Typography>;
                      }
                    })()}
                  </Box>
                </Box>
              </Paper>

              {/* Current Status */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                  Current Status
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Availability</Typography>
                    <Typography sx={{ fontSize: 16, color: '#2e7d32', fontWeight: 600 }}>Available</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Total Inspections</Typography>
                    <Typography sx={{ fontSize: 16 }}>{inspectionRecords?.length || 0}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Total Maintenance</Typography>
                    <Typography sx={{ fontSize: 16 }}>{maintenanceRecords?.length || 0}</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Related Information */}
              {linkedLesson && (
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                    Related Lesson
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label={linkedLesson.name} 
                      sx={{ 
                        bgcolor: '#e0f7fa', 
                        color: '#00695c',
                        '& .MuiChip-label': { fontWeight: 600 }
                      }} 
                    />
                  </Box>
                </Paper>
              )}

            </Box>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button onClick={() => setDetailsDialogOpen(false)} {...buttonStyles.cancel}>
              Close
            </Button>
            <Button onClick={handleEditFromMenu} {...buttonStyles.primary}>
              Edit Equipment
            </Button>
          </DialogActions>
        </Dialog>

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

        {/* Add/Edit Maintenance Record Dialog */}
        <Dialog open={maintenanceDialogOpen} onClose={() => setMaintenanceDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
            {editingMaintenance.id ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="Service Date"
                type="date"
                value={editingMaintenance.serviceDate}
                onChange={e => setEditingMaintenance(prev => ({ ...prev, serviceDate: e.target.value }))}
                size="small"
                sx={{ flex: 1, mt: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <Button 
                {...buttonStyles.secondary}
                size="small" 
                onClick={handleSetToday}
              >
                Today
              </Button>
            </Box>
            <TextField
              label="Work / Maintenance Undertaken"
              value={editingMaintenance.workUndertaken}
              onChange={e => setEditingMaintenance(prev => ({ ...prev, workUndertaken: e.target.value }))}
              multiline
              rows={4}
              fullWidth
              placeholder="Describe the maintenance work performed..."
            />
            <Autocomplete
              options={staff}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                return option.name;
              }}
              value={editingMaintenance.completedBy}
              onChange={(_, newValue) => {
                setEditingMaintenance(prev => ({ 
                  ...prev, 
                  completedBy: typeof newValue === 'string' ? newValue : (newValue ? newValue.name : '') 
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Completed By"
                  size="small"
                  placeholder="Select staff member or type name"
                  value={editingMaintenance.completedBy}
                  onChange={(e) => {
                    setEditingMaintenance(prev => ({ 
                      ...prev, 
                      completedBy: e.target.value 
                    }));
                  }}
                />
              )}
              freeSolo
              inputValue={editingMaintenance.completedBy}
              onInputChange={(_, newInputValue) => {
                setEditingMaintenance(prev => ({ 
                  ...prev, 
                  completedBy: newInputValue 
                }));
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  label="Next Service Due Date (optional)"
                  type="date"
                  value={editingMaintenance.nextServiceDue}
                  onChange={e => setEditingMaintenance(prev => ({ ...prev, nextServiceDue: e.target.value }))}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  placeholder="When is the next service due?"
                  sx={{ flex: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    {...buttonStyles.secondary}
                    size="small" 
                    onClick={() => handleCalculateNextService(6)}
                  >
                    6 Months
                  </Button>
                  <Button 
                    {...buttonStyles.secondary}
                    size="small" 
                    onClick={() => handleCalculateNextService(12)}
                  >
                    12 Months
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Photo Upload Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                Photos (optional)
              </Typography>
              <Box sx={{ 
                border: '2px dashed #e0e7ff', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                bgcolor: editingMaintenance.photos.length > 0 ? '#f0f9ff' : '#f8fafc',
                borderColor: editingMaintenance.photos.length > 0 ? '#4ecdc4' : '#e0e7ff',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#4ecdc4',
                  bgcolor: '#f0f9ff'
                }
              }}
              onClick={() => document.getElementById('maintenance-photo-input')?.click()}
              >
                {editingMaintenance.photos.length > 0 ? (
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#4ecdc4', mb: 1 }}>
                      {editingMaintenance.photos.length} Photo{editingMaintenance.photos.length !== 1 ? 's' : ''} Selected
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 2 }}>
                      {editingMaintenance.photos.map((photo, index) => (
                        <Box key={index} sx={{ position: 'relative' }}>
                          <img 
                            src={URL.createObjectURL(photo)} 
                            alt={`Photo ${index + 1}`}
                            style={{ 
                              width: 60, 
                              height: 60, 
                              borderRadius: '4px', 
                              objectFit: 'cover',
                              border: '1px solid #e0e7ff'
                            }} 
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -5,
                              right: -5,
                              bgcolor: '#e57373',
                              color: '#fff',
                              width: 20,
                              height: 20,
                              '&:hover': { bgcolor: '#d32f2f' }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMaintenancePhoto(index);
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <AddAPhotoIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151', mb: 1 }}>
                      No photos selected
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: '#6b7280', mb: 2 }}>
                      Click to select or drag and drop photos here
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                      Supported formats: JPG, PNG, GIF (max 10MB each)
                    </Typography>
                  </Box>
                )}
                <input
                  id="maintenance-photo-input"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleMaintenancePhotoSelect}
                />
              </Box>
            </Box>

            {maintenanceError && <Typography sx={{ color: 'error.main', fontSize: 13 }}>{maintenanceError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setMaintenanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.primary} onClick={handleSaveMaintenance}>
              {editingMaintenance.id ? 'Save Changes' : 'Add Record'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Maintenance Record Detail Dialog */}
        <Dialog open={maintenanceDetailDialogOpen} onClose={() => setMaintenanceDetailDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Maintenance Record
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Edit record" arrow>
                <IconButton 
                  sx={{ color: colors.iconPrimary }}
                  onClick={() => {
                    if (selectedMaintenance) {
                      setMaintenanceDetailDialogOpen(false);
                      handleEditMaintenance(selectedMaintenance);
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete record" arrow>
                <IconButton 
                  sx={{ color: '#e57373' }}
                  onClick={() => {
                    if (selectedMaintenance) {
                      setMaintenanceDetailDialogOpen(false);
                      handleDeleteMaintenance(selectedMaintenance.id);
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
              Created: {selectedMaintenance && new Date(selectedMaintenance.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1 }}>
                  Service Date:
                </Typography>
                <Typography sx={{ fontSize: 16, color: '#374151' }}>
                  {selectedMaintenance && new Date(selectedMaintenance.serviceDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1 }}>
                  Work / Maintenance Undertaken:
                </Typography>
                <Typography sx={{ fontSize: 16, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {selectedMaintenance?.workUndertaken}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1 }}>
                  Completed By:
                </Typography>
                <Typography sx={{ fontSize: 16, color: '#374151' }}>
                  {selectedMaintenance?.completedBy}
                </Typography>
              </Box>
              {selectedMaintenance?.nextServiceDue && (
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1 }}>
                    Next Service Due:
                  </Typography>
                  <Typography sx={{ fontSize: 16, color: '#374151' }}>
                    {selectedMaintenance && new Date(selectedMaintenance.nextServiceDue).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
              {selectedMaintenance?.photos && selectedMaintenance.photos.length > 0 && (
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1 }}>
                    Photos:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedMaintenance.photos.map((photo, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img 
                          src={`${API_BASE}${photo}`} 
                          alt={`Maintenance photo ${index + 1}`}
                          style={{ 
                            width: 80, 
                            height: 80, 
                            borderRadius: '4px', 
                            objectFit: 'cover',
                            border: '1px solid #e0e7ff',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            // Could add a photo viewer here
                            window.open(`${API_BASE}${photo}`, '_blank');
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.primary} onClick={() => setMaintenanceDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Maintenance Record Confirmation Dialog */}
        <Dialog open={deleteMaintenanceDialogOpen} onClose={() => setDeleteMaintenanceDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Delete Maintenance Record</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
              Are you sure you want to delete this maintenance record?
            </Typography>
            {maintenanceToDelete && (
              <Typography sx={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>
                Service Date: {new Date(maintenanceToDelete.serviceDate).toLocaleDateString()}
              </Typography>
            )}
            <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setDeleteMaintenanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.danger} onClick={handleConfirmDeleteMaintenance}>
              Delete
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
            <TextField
              label="Purchase Price (optional)"
              value={editEquipment.purchasePrice}
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
                
                setEditEquipment(s => ({ ...s, purchasePrice: cleanValue }));
              }}
              onFocus={e => {
                if (!e.target.value) {
                  setEditEquipment(s => ({ ...s, purchasePrice: '$' }));
                }
              }}
              onBlur={e => {
                if (e.target.value === '$') {
                  setEditEquipment(s => ({ ...s, purchasePrice: '' }));
                }
              }}
              fullWidth
              size="small"
              inputProps={{ 
                inputMode: 'decimal',
                pattern: '[0-9]*'
              }}
            />
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
                  bgcolor: editingManual.type === 'link' ? colors.primary : '#fff',
                  color: editingManual.type === 'link' ? '#fff' : colors.primary,
                  border: `1px solid ${colors.primary}`,
                  '&:hover': { 
                    bgcolor: editingManual.type === 'link' ? colors.primaryHover : '#f8fffe',
                    color: editingManual.type === 'link' ? '#fff' : colors.primaryHover,
                    border: `1px solid ${editingManual.type === 'link' ? colors.primaryHover : colors.primaryHover}`,
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
                  bgcolor: editingManual.type === 'file' ? colors.primary : '#fff',
                  color: editingManual.type === 'file' ? '#fff' : colors.primary,
                  border: `1px solid ${colors.primary}`,
                  '&:hover': { 
                    bgcolor: editingManual.type === 'file' ? colors.primaryHover : '#f8fffe',
                    color: editingManual.type === 'file' ? '#fff' : colors.primaryHover,
                    border: `1px solid ${editingManual.type === 'file' ? colors.primaryHover : colors.primaryHover}`,
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
                border: `2px dashed ${colors.border}`, 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                bgcolor: editingManual.file ? '#f0f9ff' : colors.containerPaper,
                borderColor: editingManual.file ? colors.primary : colors.border,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: '#f0f9ff'
                }
              }}
              onClick={() => document.getElementById('manual-input')?.click()}
              >
                {editingManual.file ? (
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.primary, mb: 1 }}>
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
              onClick={handleLinkLesson}
              {...buttonStyles.primary}
              disabled={!selectedLesson}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add/Edit Inspection Dialog */}
        <Dialog open={inspectionDialogOpen} onClose={() => setInspectionDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
            {editingInspection.id ? 'Edit Inspection Record' : 'Add Inspection Record'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="Inspection Date"
                type="date"
                value={editingInspection.inspectionDate}
                onChange={e => setEditingInspection(prev => ({ ...prev, inspectionDate: e.target.value }))}
                size="small"
                sx={{ flex: 1, mt: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <Button 
                {...buttonStyles.secondary}
                size="small" 
                onClick={handleSetInspectionToday}
              >
                Today
              </Button>
            </Box>
            <Autocomplete
              options={staff}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                return option.name;
              }}
              value={editingInspection.completedBy}
              onChange={(_, newValue) => {
                setEditingInspection(prev => ({ 
                  ...prev, 
                  completedBy: typeof newValue === 'string' ? newValue : (newValue ? newValue.name : '') 
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Completed By"
                  size="small"
                  placeholder="Select staff member or type name"
                  value={editingInspection.completedBy}
                  onChange={(e) => {
                    setEditingInspection(prev => ({ 
                      ...prev, 
                      completedBy: e.target.value 
                    }));
                  }}
                />
              )}
              freeSolo
              inputValue={editingInspection.completedBy}
              onInputChange={(_, newInputValue) => {
                setEditingInspection(prev => ({ 
                  ...prev, 
                  completedBy: newInputValue 
                }));
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                Inspection Areas
              </Typography>
              {/* Select All Checkbox */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 0.5,
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                }}
                onClick={() => {
                  const allSelected = editingInspection.inspectionAreas.length === inspectionAreas.length;
                  if (allSelected) {
                    setEditingInspection(prev => ({
                      ...prev,
                      inspectionAreas: []
                    }));
                  } else {
                    const allAreaNames = inspectionAreas.map(area => area.name);
                    setEditingInspection(prev => ({
                      ...prev,
                      inspectionAreas: allAreaNames
                    }));
                  }
                }}
              >
                <Checkbox
                  checked={editingInspection.inspectionAreas.length === inspectionAreas.length}
                  indeterminate={editingInspection.inspectionAreas.length > 0 && editingInspection.inspectionAreas.length < inspectionAreas.length}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                      const allAreaNames = inspectionAreas.map(area => area.name);
                      setEditingInspection(prev => ({
                        ...prev,
                        inspectionAreas: allAreaNames
                      }));
                    } else {
                      setEditingInspection(prev => ({
                        ...prev,
                        inspectionAreas: []
                      }));
                    }
                  }}
                  sx={{ 
                    color: colors.primary, 
                    '&.Mui-checked': { color: colors.primary },
                    '&.MuiCheckbox-indeterminate': { color: colors.primary }
                  }}
                />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', ml: 1 }}>
                  Select All
                </Typography>
              </Box>
              <Box sx={{ 
                border: `1px solid ${colors.border}`, 
                borderRadius: 2, 
                p: 2, 
                maxHeight: '300px',
                overflowY: 'auto',
                bgcolor: colors.containerPaper
              }}>
                {inspectionAreas.map((area) => (
                  <Box 
                    key={area.name} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      mb: 2, 
                      p: 1, 
                      borderRadius: 1, 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                    onClick={() => {
                      const isSelected = editingInspection.inspectionAreas.includes(area.name);
                      if (isSelected) {
                        setEditingInspection(prev => ({
                          ...prev,
                          inspectionAreas: prev.inspectionAreas.filter(a => a !== area.name)
                        }));
                      } else {
                        setEditingInspection(prev => ({
                          ...prev,
                          inspectionAreas: [...prev.inspectionAreas, area.name]
                        }));
                      }
                    }}
                  >
                    <Checkbox
                      checked={editingInspection.inspectionAreas.includes(area.name)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setEditingInspection(prev => ({
                            ...prev,
                            inspectionAreas: [...prev.inspectionAreas, area.name]
                          }));
                        } else {
                          setEditingInspection(prev => ({
                            ...prev,
                            inspectionAreas: prev.inspectionAreas.filter(a => a !== area.name)
                          }));
                        }
                      }}
                      sx={{ color: colors.primary, '&.Mui-checked': { color: colors.primary }, mt: 0.5 }}
                    />
                    <Box sx={{ ml: 1, flex: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151', mb: 0.5 }}>
                        {area.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
                        {area.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  label="Next Inspection Due Date (optional)"
                  type="date"
                  value={editingInspection.nextInspectionDue}
                  onChange={e => setEditingInspection(prev => ({ ...prev, nextInspectionDue: e.target.value }))}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  placeholder="When is the next inspection due?"
                  sx={{ flex: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    {...buttonStyles.secondary}
                    size="small" 
                    onClick={() => handleCalculateNextInspection(1)}
                  >
                    1 Month
                  </Button>
                  <Button 
                    {...buttonStyles.secondary}
                    size="small" 
                    onClick={() => handleCalculateNextInspection(3)}
                  >
                    3 Months
                  </Button>
                </Box>
              </Box>
            </Box>
            {inspectionError && <Typography sx={{ color: 'error.main', fontSize: 13 }}>{inspectionError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setInspectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.primary} onClick={handleSaveInspection}>
              {editingInspection.id ? 'Save Changes' : 'Add Inspection'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Inspection Detail Dialog */}
        <Dialog open={inspectionDetailDialogOpen} onClose={() => setInspectionDetailDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Inspection Details
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Edit inspection" arrow>
                <IconButton 
                  sx={{ color: colors.iconPrimary }}
                  onClick={() => {
                    if (selectedInspection) {
                      setInspectionDetailDialogOpen(false);
                      handleEditInspection(selectedInspection);
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete inspection" arrow>
                <IconButton 
                  sx={{ color: '#e57373' }}
                  onClick={() => {
                    if (selectedInspection) {
                      setInspectionDetailDialogOpen(false);
                      handleDeleteInspection(selectedInspection.id);
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
              Created: {selectedInspection && new Date(selectedInspection.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1 }}>
                  Inspection Date:
                </Typography>
                <Typography sx={{ fontSize: 16, color: '#374151' }}>
                  {selectedInspection && new Date(selectedInspection.inspectionDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1 }}>
                  Completed By:
                </Typography>
                <Typography sx={{ fontSize: 16, color: '#374151' }}>
                  {selectedInspection?.completedBy}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1 }}>
                  Inspection Areas:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedInspection?.inspectionAreas.map((areaName, index) => {
                    const area = inspectionAreas.find(a => a.name === areaName);
                    return (
                      <Box key={index} sx={{ pl: 2, p: 1, borderRadius: 1, bgcolor: colors.containerPaper }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151', mb: 0.5 }}>
                          • {areaName}
                        </Typography>
                        {area && (
                          <Typography sx={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', pl: 1 }}>
                            {area.description}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              {selectedInspection?.nextInspectionDue && (
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1 }}>
                    Next Inspection Due:
                  </Typography>
                  <Typography sx={{ fontSize: 16, color: '#374151' }}>
                    {selectedInspection && new Date(selectedInspection.nextInspectionDue).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.primary} onClick={() => setInspectionDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Inspection Confirmation Dialog */}
        <Dialog open={deleteInspectionDialogOpen} onClose={() => setDeleteInspectionDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Delete Inspection</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
              Are you sure you want to delete this inspection?
            </Typography>
            {inspectionToDelete && (
              <Typography sx={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>
                Inspection Date: {new Date(inspectionToDelete.inspectionDate).toLocaleDateString()}
              </Typography>
            )}
            <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button {...buttonStyles.cancel} onClick={() => setDeleteInspectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button {...buttonStyles.danger} onClick={handleConfirmDeleteInspection}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tag/Lock Out Dialog */}
        <Dialog open={tagOutDialogOpen} onClose={() => setTagOutDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Tag / Lock Out Equipment</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography sx={{ fontSize: 16, color: '#374151' }}>
              Tag out or lock out {equipmentItem?.name} for safety purposes.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="Tag Out Date"
                type="date"
                value={editingTagOut.tagOutDate}
                onChange={e => setEditingTagOut(prev => ({ ...prev, tagOutDate: e.target.value }))}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <Button 
                {...buttonStyles.secondary}
                size="small" 
                onClick={() => setEditingTagOut(prev => ({ ...prev, tagOutDate: new Date().toISOString().split('T')[0] }))}
              >
                Today
              </Button>
            </Box>

            <Autocomplete
              options={staff}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
              value={editingTagOut.completedBy}
              onChange={(_, newValue) => {
                const value = typeof newValue === 'string' ? newValue : (newValue ? newValue.name : '');
                setEditingTagOut(prev => ({ 
                  ...prev, 
                  completedBy: value
                }));
              }}
              onInputChange={(_, newInputValue) => {
                setEditingTagOut(prev => ({ 
                  ...prev, 
                  completedBy: newInputValue
                }));
              }}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Completed By"
                  size="small"
                  placeholder="Who is tagging out the equipment?"
                />
              )}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
                Tag Out Steps Checklist
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 1, 
                borderRadius: 1, 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
              }}
              onClick={() => {
                if (editingTagOut.tagOutSteps.length === tagOutSteps.length) {
                  // If all are selected, deselect all
                  setEditingTagOut(prev => ({
                    ...prev,
                    tagOutSteps: []
                  }));
                } else {
                  // Otherwise, select all
                  setEditingTagOut(prev => ({
                    ...prev,
                    tagOutSteps: [...tagOutSteps]
                  }));
                }
              }}
              >
                <Checkbox
                  checked={editingTagOut.tagOutSteps.length === tagOutSteps.length}
                  indeterminate={editingTagOut.tagOutSteps.length > 0 && editingTagOut.tagOutSteps.length < tagOutSteps.length}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                      setEditingTagOut(prev => ({
                        ...prev,
                        tagOutSteps: [...tagOutSteps]
                      }));
                    } else {
                      setEditingTagOut(prev => ({
                        ...prev,
                        tagOutSteps: []
                      }));
                    }
                  }}
                  sx={{ 
                    color: colors.primary, 
                    '&.Mui-checked': { color: colors.primary },
                    '&.MuiCheckbox-indeterminate': { color: colors.primary }
                  }}
                />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', ml: 1 }}>
                  Select All
                </Typography>
              </Box>
              <Box sx={{ 
                border: `1px solid ${colors.border}`, 
                borderRadius: 2, 
                p: 2, 
                maxHeight: '200px',
                overflowY: 'auto',
                bgcolor: colors.containerPaper
              }}>
                {tagOutSteps.map((step, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1, 
                      p: 1, 
                      borderRadius: 1, 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                    onClick={() => handleTagOutStepToggle(step)}
                  >
                    <Checkbox
                      checked={editingTagOut.tagOutSteps.includes(step)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleTagOutStepToggle(step);
                      }}
                      sx={{ color: colors.primary, '&.Mui-checked': { color: colors.primary } }}
                    />
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151', ml: 1 }}>
                      {step}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <TextField
              label="Reason for Tag Out"
              value={editingTagOut.notes}
              onChange={e => setEditingTagOut(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
              placeholder="Enter the reason for tagging out this equipment..."
              size="small"
            />

            {tagOutError && (
              <Typography sx={{ color: 'error.main', fontSize: 13, bgcolor: '#ffebee', p: 2, borderRadius: 1 }}>
                {tagOutError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button
              onClick={() => {
                setTagOutDialogOpen(false);
                setEditingTagOut({
                  id: null,
                  tagOutDate: '',
                  completedBy: '',
                  tagOutSteps: [],
                  notes: '',
                });
                setTagOutError('');
              }}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTagOut}
              {...buttonStyles.danger}
            >
              Tag / Lock Out Machine
            </Button>
          </DialogActions>
        </Dialog>

        {/* Untag Equipment Dialog */}
        <Dialog open={untagDialogOpen} onClose={() => setUntagDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Untag / Unlock Equipment</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography sx={{ fontSize: 16, color: '#374151' }}>
              Untag and unlock {equipmentItem?.name} after completing required safety checks.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="Untag Date"
                type="date"
                value={editingUntag.untagDate}
                onChange={e => setEditingUntag(prev => ({ ...prev, untagDate: e.target.value }))}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <Button 
                {...buttonStyles.secondary}
                size="small" 
                onClick={() => setEditingUntag(prev => ({ ...prev, untagDate: new Date().toISOString().split('T')[0] }))}
              >
                Today
              </Button>
            </Box>

            <Autocomplete
              options={staff}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
              value={editingUntag.completedBy}
              onChange={(_, newValue) => {
                const value = typeof newValue === 'string' ? newValue : (newValue ? newValue.name : '');
                setEditingUntag(prev => ({ 
                  ...prev, 
                  completedBy: value
                }));
              }}
              onInputChange={(_, newInputValue) => {
                setEditingUntag(prev => ({ 
                  ...prev, 
                  completedBy: newInputValue
                }));
              }}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Completed By"
                  size="small"
                  placeholder="Who is untagging the equipment?"
                />
              )}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
                Untag Steps Checklist
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 1, 
                borderRadius: 1, 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
              }}
              onClick={() => {
                if (editingUntag.untagSteps.length === untagSteps.length) {
                  // If all are selected, deselect all
                  setEditingUntag(prev => ({
                    ...prev,
                    untagSteps: []
                  }));
                } else {
                  // Otherwise, select all
                  setEditingUntag(prev => ({
                    ...prev,
                    untagSteps: [...untagSteps]
                  }));
                }
              }}
              >
                <Checkbox
                  checked={editingUntag.untagSteps.length === untagSteps.length}
                  indeterminate={editingUntag.untagSteps.length > 0 && editingUntag.untagSteps.length < untagSteps.length}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                      setEditingUntag(prev => ({
                        ...prev,
                        untagSteps: [...untagSteps]
                      }));
                    } else {
                      setEditingUntag(prev => ({
                        ...prev,
                        untagSteps: []
                      }));
                    }
                  }}
                  sx={{ 
                    color: colors.primary, 
                    '&.Mui-checked': { color: colors.primary },
                    '&.MuiCheckbox-indeterminate': { color: colors.primary }
                  }}
                />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', ml: 1 }}>
                  Select All
                </Typography>
              </Box>
              <Box sx={{ 
                border: `1px solid ${colors.border}`, 
                borderRadius: 2, 
                p: 2, 
                maxHeight: '200px',
                overflowY: 'auto',
                bgcolor: colors.containerPaper
              }}>
                {untagSteps.map((step, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1, 
                      p: 1, 
                      borderRadius: 1, 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                    onClick={() => handleUntagStepToggle(step)}
                  >
                    <Checkbox
                      checked={editingUntag.untagSteps.includes(step)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleUntagStepToggle(step);
                      }}
                      sx={{ color: colors.primary, '&.Mui-checked': { color: colors.primary } }}
                    />
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151', ml: 1 }}>
                      {step}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <TextField
              label="Notes (Optional)"
              value={editingUntag.notes}
              onChange={e => setEditingUntag(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
              placeholder="Enter any additional notes about the untag process..."
              size="small"
            />

            {untagError && (
              <Typography sx={{ color: 'error.main', fontSize: 13, bgcolor: '#ffebee', p: 2, borderRadius: 1 }}>
                {untagError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button
              onClick={() => {
                setUntagDialogOpen(false);
                setEditingUntag({
                  untagDate: '',
                  completedBy: '',
                  untagSteps: [],
                  notes: '',
                });
                setUntagError('');
              }}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUntag}
              {...buttonStyles.primary}
            >
              Untag / Unlock Equipment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lend Equipment Dialog */}
        <Dialog open={lendDialogOpen} onClose={() => setLendDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>Lend Equipment</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography sx={{ fontSize: 16, color: '#374151' }}>
              Lend {equipmentItem?.name} to a person or department.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="Lend Date"
                type="date"
                value={editingLend.lendDate}
                onChange={e => setEditingLend(prev => ({ ...prev, lendDate: e.target.value }))}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <Button 
                {...buttonStyles.secondary}
                size="small" 
                onClick={() => setEditingLend(prev => ({ ...prev, lendDate: new Date().toISOString().split('T')[0] }))}
              >
                Today
              </Button>
            </Box>

            <Autocomplete
              options={staff}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
              value={editingLend.lentTo}
              onChange={(_, newValue) => {
                const value = typeof newValue === 'string' ? newValue : (newValue ? newValue.name : '');
                setEditingLend(prev => ({ 
                  ...prev, 
                  lentTo: value
                }));
              }}
              onInputChange={(_, newInputValue) => {
                setEditingLend(prev => ({ 
                  ...prev, 
                  lentTo: newInputValue
                }));
              }}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Lent To"
                  size="small"
                  placeholder="Who is borrowing the equipment?"
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="Due Back Date"
                type="date"
                value={editingLend.dueBackDate}
                onChange={e => setEditingLend(prev => ({ ...prev, dueBackDate: e.target.value }))}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <Button 
                {...buttonStyles.secondary}
                size="small" 
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setEditingLend(prev => ({ ...prev, dueBackDate: tomorrow.toISOString().split('T')[0] }));
                }}
              >
                1 Day
              </Button>
              <Button 
                {...buttonStyles.secondary}
                size="small" 
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setEditingLend(prev => ({ ...prev, dueBackDate: nextWeek.toISOString().split('T')[0] }));
                }}
              >
                1 Week
              </Button>
            </Box>

            <TextField
              label="Notes (Optional)"
              value={editingLend.notes}
              onChange={e => setEditingLend(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
              placeholder="Enter any additional notes about lending the equipment..."
              size="small"
            />

            {lendError && (
              <Typography sx={{ color: 'error.main', fontSize: 13, bgcolor: '#ffebee', p: 2, borderRadius: 1 }}>
                {lendError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button
              onClick={() => {
                setLendDialogOpen(false);
                setEditingLend({
                  lendDate: '',
                  lentTo: '',
                  dueBackDate: '',
                  notes: '',
                });
                setLendError('');
              }}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLend}
              {...buttonStyles.primary}
            >
              Lend Equipment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Competency Warning Dialog */}
        <Dialog open={competencyWarningDialogOpen} onClose={handleCancelLendWithWarning} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 24, color: '#d32f2f' }}>
            ⚠️ Competency Warning
          </DialogTitle>
          <DialogContent sx={{ pb: 2 }}>
            <Typography sx={{ mb: 2, fontSize: 16, lineHeight: 1.5 }}>
              {competencyWarningType === 'noLessonOrStaff' 
                ? (() => {
                    const hasLinkedLesson = pendingLendData?.competencyResult?.hasLinkedLesson;
                    const isStaffMember = pendingLendData?.competencyResult?.isStaffMember;
                    
                    let message = "Therefore, staff competency cannot be confirmed. Please ensure the user is adequately experienced in the safe and correct use of this equipment before lending.";
                    
                    if (!hasLinkedLesson && !isStaffMember) {
                      message = "There is no lesson linked for this equipment and this person is not registered on the system. " + message;
                    } else if (!hasLinkedLesson) {
                      message = "There is no lesson linked for this equipment. " + message;
                    } else if (!isStaffMember) {
                      message = "This person is not registered on the system. " + message;
                    }
                    
                    return message;
                  })()
                : "The staff member listed for the loan has not been marked as competent in the use of this equipment. Before continuing with the loan, the staff member must first be assessed and marked as competent in the safe and correct use of the equipment."
              }
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
            <Button
              onClick={handleCancelLendWithWarning}
              {...buttonStyles.cancel}
            >
              Cancel
            </Button>
            {competencyWarningType === 'noLessonOrStaff' && (
              <Button
                onClick={handleConfirmLendWithWarning}
                {...buttonStyles.primary}
              >
                Confirm Loan
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
} 