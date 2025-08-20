import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Link, Paper, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Checkbox, Snackbar, Alert } from '@mui/material';
import { Layout } from '../../components/layout/Layout';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const API_BASE = 'http://localhost:3001';

export interface Lesson {
  id: number;
  name: string;
  icon: string;
  description: string;
  category: string;
  area: string;
  subArea?: string;
}

export default function LessonDetails() {
  const { colors, buttonStyles } = useThemedStyles();
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [documentTemplates, setDocumentTemplates] = useState<any[]>([]);
  const [sopFiles, setSopFiles] = useState<any[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sopUploadDialogOpen, setSopUploadDialogOpen] = useState(false);
  const [sopGenerateDialogOpen, setSopGenerateDialogOpen] = useState(false);
  const [selectedSop, setSelectedSop] = useState<any>(null);
  const [sopFieldValues, setSopFieldValues] = useState<{[key: string]: string}>({});
  const [sopUploadFormData, setSopUploadFormData] = useState({
    name: '',
    description: '',
    sopFields: []
  });
  const [uploadedSopFile, setUploadedSopFile] = useState<File | null>(null);
  const [templateUploadDialogOpen, setTemplateUploadDialogOpen] = useState(false);
  const [templateGenerateDialogOpen, setTemplateGenerateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateFieldValues, setTemplateFieldValues] = useState<{[key: string]: string}>({});
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    description: '',
    templateFields: []
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ignoreScrollSpy, setIgnoreScrollSpy] = useState(false);
  
  // Create refs for each section
  const lessonInfoRef = React.useRef<HTMLDivElement>(null);
  const sopRef = React.useRef<HTMLDivElement>(null);
  const templatesRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Fetch lesson data
  useEffect(() => {
    if (lessonId) {
      fetch(`${API_BASE}/lessons`)
        .then(res => res.json())
        .then(data => {
          const foundLesson = data.find((l: Lesson) => l.id.toString() === lessonId);
          if (foundLesson) {
            setLesson(foundLesson);
          } else {
            setLesson(null);
          }
        })
        .catch(error => {
          console.error('Error fetching lesson details:', error);
          setLesson(null);
        });
    }
  }, [lessonId]);

  // Fetch document templates for this lesson
  useEffect(() => {
    if (lessonId) {
      fetch(`${API_BASE}/document-templates/lesson/${lessonId}`)
        .then(res => res.json())
        .then(data => setDocumentTemplates(data))
        .catch(error => console.error('Error fetching templates:', error));
    }
  }, [lessonId]);

  // Fetch SOP documents for this lesson
  useEffect(() => {
    if (lessonId) {
      fetch(`${API_BASE}/sop-documents/lesson/${lessonId}`)
        .then(res => res.json())
        .then(data => setSopFiles(data))
        .catch(error => console.error('Error fetching SOPs:', error));
    }
  }, [lessonId]);

  // Set initial scroll position
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // Create tabs
  const tabs = React.useMemo(() => [
    { label: 'Lesson Info', ref: lessonInfoRef },
    { label: 'SOP Documents', ref: sopRef },
    { label: 'Document Templates', ref: templatesRef }
  ], []);

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

  // Template management functions
  const handleTemplateUpload = async () => {
    try {
      if (!uploadedFile) {
        setSnackbarMessage('Please select a file to upload');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const formData = new FormData();
      formData.append('template', uploadedFile);
      formData.append('name', uploadFormData.name);
      formData.append('description', uploadFormData.description);
      formData.append('lessonId', lessonId || '');
      formData.append('templateFields', JSON.stringify(uploadFormData.templateFields));

      const response = await fetch(`${API_BASE}/document-templates/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload template');
      }

      // Refresh templates list
      fetch(`${API_BASE}/document-templates/lesson/${lessonId}`).then(res => res.json()).then(data => setDocumentTemplates(data));
      
      setTemplateUploadDialogOpen(false);
      setUploadedFile(null);
      setUploadFormData({ name: '', description: '', templateFields: [] });
      
      setSnackbarMessage('Template uploaded successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error uploading template:', error);
      setSnackbarMessage('Failed to upload template. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleTemplateGenerate = async () => {
    try {
      if (!selectedTemplate) return;

      const response = await fetch(`${API_BASE}/document-templates/${selectedTemplate.id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fieldValues: templateFieldValues,
          themeColors: colors
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.name}_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Close dialog and show success message
      setTemplateGenerateDialogOpen(false);
      setSelectedTemplate(null);
      setTemplateFieldValues({});
      
      setSnackbarMessage('Document generated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

    } catch (error) {
      console.error('Error generating document:', error);
      setSnackbarMessage('Failed to generate document. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleTemplateDelete = async (templateId: string) => {
    try {
      const response = await fetch(`${API_BASE}/document-templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      // Refresh templates list
      fetch(`${API_BASE}/document-templates/lesson/${lessonId}`).then(res => res.json()).then(data => setDocumentTemplates(data));
      
      setSnackbarMessage('Template deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting template:', error);
      setSnackbarMessage('Failed to delete template. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setTemplateFieldValues({});
    setTemplateGenerateDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (!uploadFormData.name) {
        setUploadFormData(prev => ({ ...prev, name: file.name.replace('.docx', '') }));
      }
    }
  };

  // SOP management functions
  const handleSopUpload = async () => {
    try {
      if (!uploadedSopFile) {
        setSnackbarMessage('Please select a file to upload');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const formData = new FormData();
      formData.append('sop', uploadedSopFile);
      formData.append('name', sopUploadFormData.name);
      formData.append('description', sopUploadFormData.description);
      formData.append('lessonId', lessonId || '');
      formData.append('sopFields', JSON.stringify(sopUploadFormData.sopFields));

      const response = await fetch(`${API_BASE}/sop-documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload SOP');
      }

      // Refresh SOPs list
      fetch(`${API_BASE}/sop-documents/lesson/${lessonId}`).then(res => res.json()).then(data => setSopFiles(data));
      
      setSopUploadDialogOpen(false);
      setUploadedSopFile(null);
      setSopUploadFormData({ name: '', description: '', sopFields: [] });
      
      setSnackbarMessage('SOP uploaded successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error uploading SOP:', error);
      setSnackbarMessage('Failed to upload SOP. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSopGenerate = async () => {
    try {
      if (!selectedSop) return;

      const response = await fetch(`${API_BASE}/sop-documents/${selectedSop.id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fieldValues: sopFieldValues,
          themeColors: colors
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SOP');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedSop.name}_${new Date().toISOString().split('T')[0]}.${selectedSop.fileType === 'application/pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Close dialog and show success message
      setSopGenerateDialogOpen(false);
      setSelectedSop(null);
      setSopFieldValues({});
      
      setSnackbarMessage('SOP generated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

    } catch (error) {
      console.error('Error generating SOP:', error);
      setSnackbarMessage('Failed to generate SOP. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSopDelete = async (sopId: string) => {
    try {
      const response = await fetch(`${API_BASE}/sop-documents/${sopId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete SOP');
      }

      // Refresh SOPs list
      fetch(`${API_BASE}/sop-documents/lesson/${lessonId}`).then(res => res.json()).then(data => setSopFiles(data));
      
      setSnackbarMessage('SOP deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting SOP:', error);
      setSnackbarMessage('Failed to delete SOP. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSopSelect = (sop: any) => {
    setSelectedSop(sop);
    setSopFieldValues({});
    setSopGenerateDialogOpen(true);
  };

  const handleSopDownload = (sop: any) => {
    // For builder-generated SOPs, we'll navigate to the SOP builder with the data
    if (sop.type === 'builder-generated') {
      navigate(`/lessons/${lessonId}/sop-builder?view=${sop.id}`);
    }
  };

  const handleSopFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedSopFile(file);
      if (!sopUploadFormData.name) {
        setSopUploadFormData(prev => ({ ...prev, name: file.name.replace(/\.(docx|pdf)$/i, '') }));
      }
    }
  };

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  if (!lesson) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
          <Typography variant="h6" color="text.secondary">Lesson not found</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout
      breadcrumbs={[
        <Link component={RouterLink} underline="hover" color="inherit" to="/lessons" key="lessons" sx={{ fontWeight: 600, fontSize: 18 }}>Lessons</Link>,
        <Typography color="text.primary" key="current" sx={{ fontWeight: 600, fontSize: 18 }}>{lesson.name}</Typography>
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
        {/* Fixed header section */}
        <Box sx={{ 
          position: 'fixed', 
          top: 64,
          left: { xs: 0, md: '64px', lg: '240px' },
          right: 0,
          bgcolor: '#fff', 
          zIndex: 1000,
          borderBottom: `1px solid ${colors.border}`,
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
            {/* Lesson Info Section */}
            <Box ref={lessonInfoRef} sx={{ display: 'flex', gap: 2, minHeight: 70 }}>
              <Paper elevation={1} sx={{ flex: 1, px: 3, py: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, minHeight: 70, position: 'relative' }}>
                <Typography sx={{ color: '#888', fontWeight: 700, fontSize: 13, mb: 0.5 }}>
                  {lesson.category} • {lesson.area}{lesson.subArea ? ` • ${lesson.subArea}` : ''}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 22, color: '#374151', lineHeight: 1.1 }}>{lesson.name}</Typography>
                {lesson.description && (
                  <Typography sx={{ color: '#374151', fontWeight: 500, fontSize: 14, mt: 0.5 }}>
                    {lesson.description}
                  </Typography>
                )}
                <Box sx={{ position: 'absolute', bottom: 8, right: 12, display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit lesson details" arrow>
                    <IconButton size="small" sx={{ color: colors.iconPrimary }} onClick={() => setEditDialogOpen(true)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Box>
            <div style={{ height: 12 }} />
            
            {/* SOP Documents Section */}
            <div ref={sopRef}>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'left' }}>SOP Documents</Typography>
                  <Button
                    {...buttonStyles.primary}
                    startIcon={<BuildIcon />}
                    size="small"
                    onClick={() => navigate(`/lessons/${lessonId}/sop-builder`)}
                  >
                    Create SOP
                  </Button>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: colors.containerPaper, borderRadius: 2, p: 2, border: `1px solid ${colors.border}` }}>
                  {sopFiles.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {sopFiles.map((sop) => (
                        <Paper
                          key={sop.id}
                          elevation={0}
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
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                            <Box sx={{ 
                              color: colors.iconPrimary,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 24
                            }}>
                              <DescriptionIcon />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>
                                {sop.name}
                              </Typography>
                              <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
                                {sop.description || 'No description'}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                                {sop.type === 'builder-generated' ? (
                                  `Created: ${new Date(sop.createdAt).toLocaleDateString()} • Builder Generated`
                                ) : (
                                  `Uploaded: ${new Date(sop.uploadedAt).toLocaleDateString()} • ${sop.fileType === 'application/pdf' ? 'PDF' : 'Word Document'}`
                                )}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {sop.type === 'builder-generated' ? (
                              <>
                                <Tooltip title="View SOP" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: colors.iconPrimary }} 
                                    onClick={() => navigate(`/lessons/${lessonId}/sop-builder?edit=${sop.id}`)}
                                  >
                                    <EditIcon sx={{ fontSize: 20 }}/>
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download PDF" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: colors.iconPrimary }} 
                                    onClick={() => handleSopDownload(sop)}
                                  >
                                    <DownloadIcon sx={{ fontSize: 20 }}/>
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <Tooltip title="Generate SOP" arrow>
                                <IconButton 
                                  size="small" 
                                  sx={{ color: colors.iconPrimary }} 
                                  onClick={() => handleSopSelect(sop)}
                                >
                                  <DownloadIcon sx={{ fontSize: 20 }}/>
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete SOP" arrow>
                              <IconButton 
                                size="small" 
                                sx={{ color: '#e57373' }} 
                                onClick={() => handleSopDelete(sop.id)}
                              >
                                <DeleteIcon sx={{ fontSize: 20 }}/>
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ color: '#bbb', fontSize: 14, textAlign: 'center', py: 2 }}>
                      No SOP documents uploaded yet
                    </Typography>
                  )}
                </Box>
              </Paper>
            </div>
            
            {/* Document Templates Section */}
            <div ref={templatesRef}>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 3, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'left' }}>Document Templates</Typography>
                  <Button
                    {...buttonStyles.primary}
                    startIcon={<UploadIcon />}
                    size="small"
                    onClick={() => setTemplateUploadDialogOpen(true)}
                  >
                    Upload Template
                  </Button>
                </Box>
                <Box sx={{ minHeight: 80, bgcolor: colors.containerPaper, borderRadius: 2, p: 2, border: `1px solid ${colors.border}` }}>
                  {documentTemplates.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {documentTemplates.map((template) => (
                        <Paper
                          key={template.id}
                          elevation={0}
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
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.12)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                            <Box sx={{ 
                              color: colors.iconPrimary,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 24
                            }}>
                              <DescriptionIcon />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>
                                {template.name}
                              </Typography>
                              <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
                                {template.description || 'No description'}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                                Uploaded: {new Date(template.uploadedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Generate Document" arrow>
                              <IconButton 
                                size="small" 
                                sx={{ color: colors.iconPrimary }} 
                                onClick={() => handleTemplateSelect(template)}
                              >
                                <DownloadIcon sx={{ fontSize: 20 }}/>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Template" arrow>
                              <IconButton 
                                size="small" 
                                sx={{ color: '#e57373' }} 
                                onClick={() => handleTemplateDelete(template.id)}
                              >
                                <DeleteIcon sx={{ fontSize: 20 }}/>
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ color: '#bbb', fontSize: 14, textAlign: 'center', py: 2 }}>
                      No document templates uploaded yet
                    </Typography>
                  )}
                </Box>
              </Paper>
            </div>
          </Box>
        </Box>
      </Box>

      {/* Template Upload Dialog */}
      <Dialog open={templateUploadDialogOpen} onClose={() => setTemplateUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
          Upload Document Template
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography sx={{ mb: 3, fontSize: 16, color: '#6b7280' }}>
            Upload a Word document template (.docx) that contains placeholder fields. Use {`{fieldName}`} syntax for placeholders.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* File Upload */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#374151', mb: 2 }}>
                Template File
              </Typography>
              <input
                accept=".docx"
                style={{ display: 'none' }}
                id="template-file-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="template-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ 
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                      borderColor: colors.primaryHover,
                      color: colors.primaryHover,
                    }
                  }}
                >
                  Choose Template File
                </Button>
              </label>
              {uploadedFile && (
                <Typography sx={{ mt: 1, fontSize: 14, color: '#4caf50' }}>
                  Selected: {uploadedFile.name}
                </Typography>
              )}
            </Box>

            {/* Template Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Template Name"
                value={uploadFormData.name}
                onChange={(e) => setUploadFormData(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                size="small"
              />
              <TextField
                label="Description"
                value={uploadFormData.description}
                onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
            </Box>

            {/* Template Fields Info */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#374151', mb: 2 }}>
                Template Fields
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#6b7280', mb: 1 }}>
                Use these placeholders in your Word document:
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: `1px solid ${colors.border}` }}>
                <Typography sx={{ fontSize: 13, fontFamily: 'monospace', color: '#374151' }}>
                  • {'{personName}'} - Person's name<br/>
                  • {'{companyName}'} - Company name<br/>
                  • {'{date}'} - Current date<br/>
                  • {'{equipment}'} - Equipment list<br/>
                  • {'{generatedDate}'} - Generation date<br/>
                  • {'{generatedTime}'} - Generation time<br/>
                  • {'{themePrimary}'} - Primary theme color<br/>
                  • {'{themeSecondary}'} - Secondary theme color<br/>
                  • {'{themeAccent}'} - Accent theme color<br/>
                  • Any custom field: {'{yourFieldName}'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
          <Button {...buttonStyles.cancel} onClick={() => setTemplateUploadDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            {...buttonStyles.primary} 
            onClick={handleTemplateUpload}
            disabled={!uploadedFile || !uploadFormData.name}
            startIcon={<UploadIcon />}
          >
            Upload Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Generation Dialog */}
      <Dialog open={templateGenerateDialogOpen} onClose={() => setTemplateGenerateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
          Generate Document from Template
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          {selectedTemplate && (
            <>
              <Typography sx={{ mb: 3, fontSize: 16, color: '#6b7280' }}>
                Fill in the template fields to customize your document:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Template Info */}
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#374151', mb: 1 }}>
                    Template: {selectedTemplate.name}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                    {selectedTemplate.description || 'No description'}
                  </Typography>
                </Box>

                {/* Dynamic Fields */}
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#374151', mb: 2 }}>
                    Template Fields
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Person Name"
                      value={templateFieldValues.personName || ''}
                      onChange={(e) => setTemplateFieldValues(prev => ({ ...prev, personName: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Company Name"
                      value={templateFieldValues.companyName || ''}
                      onChange={(e) => setTemplateFieldValues(prev => ({ ...prev, companyName: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Custom Field 1"
                      value={templateFieldValues.customField1 || ''}
                      onChange={(e) => setTemplateFieldValues(prev => ({ ...prev, customField1: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Custom Field 2"
                      value={templateFieldValues.customField2 || ''}
                      onChange={(e) => setTemplateFieldValues(prev => ({ ...prev, customField2: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
          <Button {...buttonStyles.cancel} onClick={() => setTemplateGenerateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            {...buttonStyles.primary} 
            onClick={handleTemplateGenerate}
            startIcon={<DownloadIcon />}
          >
            Generate Document
          </Button>
        </DialogActions>
      </Dialog>

      {/* SOP Upload Dialog */}
      <Dialog open={sopUploadDialogOpen} onClose={() => setSopUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
          Upload SOP Document
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography sx={{ mb: 3, fontSize: 16, color: '#6b7280' }}>
            Upload a Standard Operating Procedure document (.docx or .pdf) that contains placeholder fields. Use {`{fieldName}`} syntax for placeholders in Word documents.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* File Upload */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#374151', mb: 2 }}>
                SOP File
              </Typography>
              <input
                accept=".docx,.pdf"
                style={{ display: 'none' }}
                id="sop-file-upload"
                type="file"
                onChange={handleSopFileUpload}
              />
              <label htmlFor="sop-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ 
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                      borderColor: colors.primaryHover,
                      color: colors.primaryHover,
                    }
                  }}
                >
                  Choose SOP File
                </Button>
              </label>
              {uploadedSopFile && (
                <Typography sx={{ mt: 1, fontSize: 14, color: '#4caf50' }}>
                  Selected: {uploadedSopFile.name}
                </Typography>
              )}
            </Box>

            {/* SOP Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="SOP Name"
                value={sopUploadFormData.name}
                onChange={(e) => setSopUploadFormData(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                size="small"
              />
              <TextField
                label="Description"
                value={sopUploadFormData.description}
                onChange={(e) => setSopUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
            </Box>

            {/* SOP Fields Info */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#374151', mb: 2 }}>
                SOP Fields (for Word documents)
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#6b7280', mb: 1 }}>
                Use these placeholders in your Word document:
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: `1px solid ${colors.border}` }}>
                <Typography sx={{ fontSize: 13, fontFamily: 'monospace', color: '#374151' }}>
                  • {'{personName}'} - Person's name<br/>
                  • {'{companyName}'} - Company name<br/>
                  • {'{date}'} - Current date<br/>
                  • {'{generatedDate}'} - Generation date<br/>
                  • {'{generatedTime}'} - Generation time<br/>
                  • {'{themePrimary}'} - Primary theme color<br/>
                  • {'{themeSecondary}'} - Secondary theme color<br/>
                  • {'{themeAccent}'} - Accent theme color<br/>
                  • Any custom field: {'{yourFieldName}'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
          <Button {...buttonStyles.cancel} onClick={() => setSopUploadDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            {...buttonStyles.primary} 
            onClick={handleSopUpload}
            disabled={!uploadedSopFile || !sopUploadFormData.name}
            startIcon={<UploadIcon />}
          >
            Upload SOP
          </Button>
        </DialogActions>
      </Dialog>

      {/* SOP Generation Dialog */}
      <Dialog open={sopGenerateDialogOpen} onClose={() => setSopGenerateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
          Generate SOP Document
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          {selectedSop && (
            <>
              <Typography sx={{ mb: 3, fontSize: 16, color: '#6b7280' }}>
                Fill in the SOP fields to customize your document:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* SOP Info */}
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#374151', mb: 1 }}>
                    SOP: {selectedSop.name}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                    {selectedSop.description || 'No description'}
                  </Typography>
                </Box>

                {/* Dynamic Fields */}
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#374151', mb: 2 }}>
                    SOP Fields
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Person Name"
                      value={sopFieldValues.personName || ''}
                      onChange={(e) => setSopFieldValues(prev => ({ ...prev, personName: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Company Name"
                      value={sopFieldValues.companyName || ''}
                      onChange={(e) => setSopFieldValues(prev => ({ ...prev, companyName: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Custom Field 1"
                      value={sopFieldValues.customField1 || ''}
                      onChange={(e) => setSopFieldValues(prev => ({ ...prev, customField1: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Custom Field 2"
                      value={sopFieldValues.customField2 || ''}
                      onChange={(e) => setSopFieldValues(prev => ({ ...prev, customField2: e.target.value }))}
                      fullWidth
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3, pl: 3 }}>
          <Button {...buttonStyles.cancel} onClick={() => setSopGenerateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            {...buttonStyles.primary} 
            onClick={handleSopGenerate}
            startIcon={<DownloadIcon />}
          >
            Generate SOP
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage || 'Success!'}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
