import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

const API_BASE = 'http://localhost:3001';

interface SafetyIcon {
  id: string;
  name: string;
  category: string;
  filename: string;
  path: string;
  uploadDate: string;
}

interface IconManagerProps {
  open: boolean;
  onClose: () => void;
  onIconSelect?: (icon: SafetyIcon) => void;
}

export default function IconManager({ open, onClose, onIconSelect }: IconManagerProps) {
  const { colors, buttonStyles } = useThemedStyles();
  const [icons, setIcons] = useState<SafetyIcon[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    category: 'ppe'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch icons on component mount
  useEffect(() => {
    if (open) {
      fetchIcons();
    }
  }, [open]);

  const fetchIcons = async () => {
    try {
      const response = await fetch(`${API_BASE}/safety-icons`);
      const data = await response.json();
      setIcons(data);
    } catch (error) {
      console.error('Error fetching icons:', error);
      setSnackbarMessage('Failed to fetch icons');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadFormData.name) {
        setUploadFormData(prev => ({ ...prev, name: file.name.split('.')[0] }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setSnackbarMessage('Please select a file');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append('icon', selectedFile);
    formData.append('name', uploadFormData.name);
    formData.append('category', uploadFormData.category);

    try {
      const response = await fetch(`${API_BASE}/safety-icons/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSnackbarMessage('Icon uploaded successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadFormData({ name: '', category: 'ppe' });
        fetchIcons();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading icon:', error);
      setSnackbarMessage('Failed to upload icon');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteIcon = async (iconId: string) => {
    try {
      const response = await fetch(`${API_BASE}/safety-icons/${iconId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbarMessage('Icon deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        fetchIcons();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting icon:', error);
      setSnackbarMessage('Failed to delete icon');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleIconSelect = (icon: SafetyIcon) => {
    if (onIconSelect) {
      onIconSelect(icon);
    }
    onClose();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ppe': return colors.primary;
      case 'warning': return '#ff9800';
      case 'danger': return '#f44336';
      case 'info': return colors.secondary;
      default: return colors.border;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'ppe': return 'PPE';
      case 'warning': return 'Warning';
      case 'danger': return 'Danger';
      case 'info': return 'Info';
      default: return 'General';
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Safety Icons Library</Typography>
          <Box>
            <Button
              {...buttonStyles.primary}
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              size="small"
            >
              Upload Icon
            </Button>
            <IconButton onClick={onClose} sx={{ ml: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {icons.map((icon) => (
              <Card 
                key={icon.id}
                elevation={2}
                sx={{ 
                  cursor: onIconSelect ? 'pointer' : 'default',
                  '&:hover': onIconSelect ? {
                    elevation: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  } : {}
                }}
                onClick={() => onIconSelect && handleIconSelect(icon)}
              >
                <CardMedia
                  component="img"
                  height="120"
                  image={`${API_BASE}${icon.path}`}
                  alt={icon.name}
                  sx={{ objectFit: 'contain', p: 1, bgcolor: '#f5f5f5' }}
                />
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {icon.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: getCategoryColor(icon.category),
                        fontWeight: 600
                      }}
                    >
                      {getCategoryLabel(icon.category)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIcon(icon.id);
                      }}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          {icons.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No safety icons uploaded yet.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click "Upload Icon" to add your first safety icon.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Safety Icon</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Icon Name"
              value={uploadFormData.name}
              onChange={(e) => setUploadFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={uploadFormData.category}
                onChange={(e) => setUploadFormData(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                <MenuItem value="ppe">PPE (Personal Protective Equipment)</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="danger">Danger</MenuItem>
                <MenuItem value="info">Information</MenuItem>
                <MenuItem value="general">General</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="icon-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="icon-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                >
                  {selectedFile ? selectedFile.name : 'Select Icon File'}
                </Button>
              </label>
            </Box>
            {selectedFile && (
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            {...buttonStyles.primary}
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
