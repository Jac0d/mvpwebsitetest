import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
  Link
} from '@mui/material';
import { Layout } from '../../components/layout/Layout';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HearingIcon from '@mui/icons-material/Hearing';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import IconManager from './IconManager';
import html2pdf from 'html2pdf.js';

const API_BASE = 'http://localhost:3001';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  code: string;
  location: string;
  purchasePrice?: number;
}

export interface SafetyIcon {
  id: string;
  name: string;
  category: string;
  filename: string;
  path: string;
  uploadDate: string;
}

export default function SopBuilder() {
  const { colors, buttonStyles } = useThemedStyles();
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [sopData, setSopData] = useState({
    schoolName: '',
    schoolLogo: '',
    title: '',
    room: '',
    dateOfReview: '',
    reviewedBy: '',
    nextReviewDue: '',
    equipmentName: '',
    caution: '',
    preOperationalChecks: [] as string[],
    operationalChecks: [] as string[],
    housekeeping: [] as string[],
    potentialHazards: [] as string[],
    notAllowed: [] as string[],
    selectedPpeIcons: [] as string[]
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [iconManagerOpen, setIconManagerOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [safetyIcons, setSafetyIcons] = useState<SafetyIcon[]>([]);
  const [selectedPpeIcons, setSelectedPpeIcons] = useState<{ [key: string]: SafetyIcon }>({});

  // Fetch lesson and equipment data
  useEffect(() => {
    if (lessonId) {
      // Fetch lesson details
      fetch(`${API_BASE}/lessons`)
        .then(res => res.json())
        .then(data => {
          const foundLesson = data.find((l: any) => l.id.toString() === lessonId);
          if (foundLesson) {
            setLesson(foundLesson);
            setSopData(prev => ({ 
              ...prev, 
              title: `Safe Operating Procedures for ${foundLesson.name}`,
              equipmentName: foundLesson.name
            }));
          }
        })
        .catch(error => console.error('Error fetching lesson:', error));

      // Fetch equipment
      fetch(`${API_BASE}/equipment`)
        .then(res => res.json())
        .then(data => setEquipment(data))
        .catch(error => console.error('Error fetching equipment:', error));

      // Fetch safety icons
      fetch(`${API_BASE}/safety-icons`)
        .then(res => res.json())
        .then(data => setSafetyIcons(data))
        .catch(error => console.error('Error fetching safety icons:', error));

      // Check for edit or view parameters
      const urlParams = new URLSearchParams(window.location.search);
      const editSopId = urlParams.get('edit');
      const viewSopId = urlParams.get('view');

      if (editSopId || viewSopId) {
        const sopId = editSopId || viewSopId;
        // Fetch existing SOP data
        fetch(`${API_BASE}/sop-documents`)
          .then(res => res.json())
          .then(data => {
            const existingSop = data.find((sop: any) => sop.id === sopId);
            if (existingSop && existingSop.sopData) {
              setSopData(existingSop.sopData);
            }
          })
          .catch(error => console.error('Error fetching existing SOP:', error));
      }
    }
  }, [lessonId]);

  const handleDownloadPDF = () => {
    const element = document.querySelector('.sop-document');
    if (!element) {
      setSnackbarMessage('Error: Could not find SOP document element');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const opt = {
      margin: [5, 5, 5, 5],
      filename: `SOP_${sopData.equipmentName || sopData.title || 'Document'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        scrollX: 0,
        scrollY: 0,
        imageTimeout: 0,
        removeContainer: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
      setSnackbarMessage('PDF downloaded successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }).catch((error) => {
      console.error('PDF generation error:', error);
      setSnackbarMessage('Error generating PDF. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    });
  };

  const handleSave = () => {
    // Check if we're editing an existing SOP
    const urlParams = new URLSearchParams(window.location.search);
    const editSopId = urlParams.get('edit');
    
    const endpoint = editSopId ? `${API_BASE}/sop-documents/${editSopId}/update` : `${API_BASE}/sop-documents/save`;
    const method = editSopId ? 'PUT' : 'POST';
    
    const requestBody = {
      lessonId: lessonId,
      sopData: sopData
    };
    
    console.log('Saving SOP with data:', requestBody);
    console.log('Using endpoint:', endpoint);
    console.log('Using method:', method);
    console.log('Lesson ID:', lessonId);
    console.log('Lesson ID type:', typeof lessonId);
    
    // Save SOP data to backend
    fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Response data:', data);
      if (data.success) {
        setSnackbarMessage(editSopId ? 'SOP updated successfully!' : 'SOP saved successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        // Navigate back to lesson details after saving
        setTimeout(() => {
          navigate(`/lessons/${lessonId}`);
        }, 1500);
      } else {
        setSnackbarMessage('Failed to save SOP: ' + (data.message || 'Unknown error'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    })
    .catch(error => {
      console.error('Error saving SOP:', error);
      setSnackbarMessage('Error saving SOP: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    });
  };

  const handleEquipmentSelect = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setSopData(prev => ({ 
      ...prev, 
      equipmentName: equipment.name,
      room: equipment.location 
    }));
  };

  const handleIconSelect = (icon: SafetyIcon) => {
    // For now, we'll use a simple approach - you can enhance this later
    setSelectedPpeIcons(prev => ({
      ...prev,
      [icon.category]: icon
    }));
  };

  const getIconForCategory = (category: string) => {
    const icon = selectedPpeIcons[category] || safetyIcons.find(i => i.category === category);
    return icon;
  };

  return (
    <>
      {/* Print-only styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            .sop-document, .sop-document * {
              visibility: visible !important;
            }
            .sop-document {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 15mm 10mm !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              transform: none !important;
              box-shadow: none !important;
              display: flex !important;
              flex-direction: column !important;
            }
            .sop-document * {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              max-height: none !important;
            }
            @page {
              size: A4 portrait !important;
              margin: 0 !important;
            }
            * {
              box-sizing: border-box !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              overflow: hidden !important;
            }
            html {
              width: 210mm !important;
              height: 297mm !important;
              overflow: hidden !important;
            }
            .MuiBox-root {
              max-height: none !important;
              overflow: visible !important;
            }
            .MuiPaper-root {
              max-height: none !important;
              overflow: visible !important;
            }
          }
        `}
      </style>
      
      <Layout
        breadcrumbs={[
          <Link component={RouterLink} underline="hover" color="inherit" to="/lessons" key="lessons" sx={{ fontWeight: 600, fontSize: 18 }}>Lessons</Link>,
          <Link component={RouterLink} underline="hover" color="inherit" to={`/lessons/${lessonId}`} key="lesson" sx={{ fontWeight: 600, fontSize: 18 }}>{lesson?.name || 'Lesson'}</Link>,
          <Typography color="text.primary" key="current" sx={{ fontWeight: 600, fontSize: 18 }}>SOP Builder</Typography>
        ]}
      >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 64px)',
        mt: -3, // Remove the top padding from Layout
        pt: 0   // Ensure no top padding
      }}>
        {/* Fixed Header with Edit Controls */}
        <Box sx={{ 
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: 'white',
          borderBottom: `1px solid ${colors.border}`,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mx: -3, // Extend beyond Container padding
          px: 3,  // Add padding back to maintain spacing
          width: 'calc(100% + 48px)' // Full width plus Container padding
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(`/lessons/${lessonId}`)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              SOP Builder - {lesson?.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              {...buttonStyles.secondary}
              onClick={() => setEditDialogOpen(true)}
            >
              Edit SOP Content
            </Button>
            <Button
              {...buttonStyles.secondary}
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save SOP
            </Button>
            <Button
              {...buttonStyles.secondary}
              onClick={() => setIconManagerOpen(true)}
            >
              Manage Icons
            </Button>
            <Button
              {...buttonStyles.primary}
              startIcon={<PictureAsPdfIcon />}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
          </Box>
        </Box>

        {/* SOP Document */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#f5f5f5' }}>
          <style>
            {`
              @media print {
                              .sop-document * {
                max-width: 100% !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
              }
              
              .sop-document img {
                width: auto !important;
                height: auto !important;
                max-width: none !important;
                object-fit: contain !important;
                flex-shrink: 0 !important;
              }
                .sop-document {
                  width: 210mm !important;
                  height: 297mm !important;
                  margin: 0 !important;
                  padding: 10mm 8mm !important;
                  box-sizing: border-box !important;
                  overflow: hidden !important;
                }
              }
            `}
          </style>
          <Paper 
            className="sop-document"
            elevation={3} 
            sx={{ 
              width: '210mm', 
              height: '297mm', 
              mx: 'auto', 
              bgcolor: 'white',
              p: 3,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              '@media print': {
                width: '210mm !important',
                height: '297mm !important',
                margin: '0 !important',
                padding: '10mm 8mm !important',
                boxShadow: 'none !important',
                pageBreakAfter: 'always !important',
                position: 'absolute !important',
                top: '0 !important',
                left: '0 !important',
                boxSizing: 'border-box !important',
                overflow: 'hidden !important'
              }
            }}
          >
            {/* Header Section */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1, 
                mb: 1, 
                bgcolor: colors.primary, 
                color: 'white',
                textAlign: 'center',
                borderRadius: 2
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25, fontSize: 13 }}>
                {sopData.schoolName || 'SCHOOL NAME'}
              </Typography>
              {sopData.schoolLogo && (
                <Box sx={{ mb: 0.25 }}>
                  <img src={sopData.schoolLogo} alt="School Logo" style={{ maxHeight: '20px' }} />
                </Box>
              )}
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25, fontSize: 12 }}>
                Safe Operating Procedures for {sopData.equipmentName || 'Equipment'}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 9 }}>
                Room: {sopData.room || 'Room Location'}
              </Typography>
            </Paper>

            {/* Safety Warning */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 0.5, 
                mb: 1, 
                bgcolor: '#fff3cd', 
                border: `1px solid ${colors.primary}`,
                borderRadius: 2
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 12, textAlign: 'center', lineHeight: 1.2 }}>
                Only use this machine if you have been given instructions on how to use it safely and have been given permission
              </Typography>
            </Paper>

            {/* PPE Icons Section */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1, 
                mb: 1, 
                border: `1px solid ${colors.secondary}`,
                borderRadius: 2
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 2, 
                flexWrap: 'nowrap',
                overflow: 'hidden',
                '& img': {
                  width: '150px',
                  height: '150px',
                  objectFit: 'contain',
                  transition: 'width 0.3s ease, height 0.3s ease',
                  flexShrink: 1,
                  minWidth: '80px'
                }
              }}>
                {sopData.selectedPpeIcons.map((iconId, index) => {
                  const icon = safetyIcons.find(i => i.id === iconId);
                  return icon ? (
                    <img 
                      key={icon.id}
                      src={`${API_BASE}${icon.path}`}
                      alt={icon.name}
                      style={{ 
                        width: sopData.selectedPpeIcons.length > 6 ? '120px' : '150px', 
                        height: sopData.selectedPpeIcons.length > 6 ? '120px' : '150px', 
                        objectFit: 'contain' 
                      }}
                    />
                  ) : null;
                })}
              </Box>
            </Paper>

            {/* General PPE Statement */}
            {sopData.caution && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 0.5, 
                  mb: 1, 
                  bgcolor: '#fff3cd', 
                  border: `1px solid ${colors.secondary}`,
                  borderRadius: 2
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: 12, textAlign: 'center', lineHeight: 1.2 }}>
                  {sopData.caution}
                </Typography>
              </Paper>
            )}

            {/* Pre-Operational Safety Checks */}
            {sopData.preOperationalChecks.length > 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 0.5, 
                  mb: 0.5, 
                  border: `1px solid ${colors.secondary}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25, color: '#f44336', fontSize: 11, ml: '20px' }}>
                  Pre-Operational Safety Checks
                </Typography>
                <List>
                  {sopData.preOperationalChecks.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.125, minHeight: 'auto' }}>
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        <Typography sx={{ fontWeight: 600, color: colors.primary, fontSize: 11 }}>
                          {index + 1}.
                        </Typography>
                      </ListItemIcon>
                      <ListItemText primary={item} sx={{ 
                        '& .MuiListItemText-primary': { 
                          fontSize: 10, 
                          lineHeight: 1.2,
                          margin: 0
                        },
                        margin: 0
                      }} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Operational Safety Checks */}
            {sopData.operationalChecks.length > 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 0.5, 
                  mb: 0.5, 
                  border: `1px solid ${colors.secondary}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25, color: '#f44336', fontSize: 11, ml: '20px' }}>
                  Operational Safety Checks
                </Typography>
                <List>
                  {sopData.operationalChecks.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.125, minHeight: 'auto' }}>
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        <Typography sx={{ fontWeight: 600, color: colors.primary, fontSize: 11 }}>
                          {index + 1}.
                        </Typography>
                      </ListItemIcon>
                      <ListItemText primary={item} sx={{ 
                        '& .MuiListItemText-primary': { 
                          fontSize: 10, 
                          lineHeight: 1.2,
                          margin: 0
                        },
                        margin: 0
                      }} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Housekeeping */}
            {sopData.housekeeping.length > 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 0.5, 
                  mb: 0.5, 
                  border: `1px solid ${colors.secondary}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25, color: '#f44336', fontSize: 11, ml: '15px' }}>
                  Housekeeping
                </Typography>
                <List>
                  {sopData.housekeeping.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.125, minHeight: 'auto' }}>
                      <ListItemIcon sx={{ minWidth: 15 }}>
                        <Typography sx={{ fontSize: 10 }}>•</Typography>
                      </ListItemIcon>
                      <ListItemText primary={item} sx={{ 
                        '& .MuiListItemText-primary': { 
                          fontSize: 10, 
                          lineHeight: 1.2,
                          margin: 0
                        },
                        margin: 0
                      }} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Potential Hazards */}
            {sopData.potentialHazards.length > 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 0.5, 
                  mb: 0.5, 
                  border: `1px solid ${colors.secondary}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25, color: '#f44336', fontSize: 11, ml: '20px' }}>
                  Potential Hazards
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1 }}>
                  <List>
                    {sopData.potentialHazards.slice(0, Math.ceil(sopData.potentialHazards.length / 2)).map((hazard, index) => (
                      <ListItem key={index} sx={{ py: 0.125, minHeight: 'auto' }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <WarningIcon sx={{ color: '#ff9800', fontSize: 16 }} />
                        </ListItemIcon>
                        <ListItemText primary={hazard} sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontSize: 10, 
                            lineHeight: 1.2,
                            margin: 0
                          },
                          margin: 0
                        }} />
                      </ListItem>
                    ))}
                  </List>
                  <List>
                    {sopData.potentialHazards.slice(Math.ceil(sopData.potentialHazards.length / 2)).map((hazard, index) => (
                      <ListItem key={index} sx={{ py: 0.125, minHeight: 'auto' }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <WarningIcon sx={{ color: '#ff9800', fontSize: 16 }} />
                        </ListItemIcon>
                        <ListItemText primary={hazard} sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontSize: 10, 
                            lineHeight: 1.2,
                            margin: 0
                          },
                          margin: 0
                        }} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Paper>
            )}

            {/* Not Allowed */}
            {sopData.notAllowed.length > 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 0.5, 
                  mb: 0.5, 
                  border: `1px solid ${colors.secondary}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25, color: '#f44336', fontSize: 11, ml: '20px' }}>
                  Not Allowed
                </Typography>
                <List>
                  {sopData.notAllowed.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.125, minHeight: 'auto' }}>
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        <BlockIcon sx={{ color: '#f44336', fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText primary={item} sx={{ 
                        '& .MuiListItemText-primary': { 
                          fontSize: 10, 
                          lineHeight: 1.2,
                          margin: 0
                        },
                        margin: 0
                      }} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

                        {/* Footer Section */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 0.5, 
                mb: 0.5, 
                border: `1px solid ${colors.secondary}`,
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 10 }}>
                    Date of Review: {sopData.dateOfReview || 'Date'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 10 }}>
                    Reviewed By: {sopData.reviewedBy || 'Reviewer Name'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 10 }}>
                    Next Review Due: {sopData.nextReviewDue || 'Due Date'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 10 }}>
                    Signature: ________________________________________
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Disclaimer */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 0.5, 
                mb: 0.5, 
                border: `1px solid ${colors.secondary}`,
                borderRadius: 2,
                bgcolor: '#f8f9fa'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: 8, 
                  color: '#6c757d', 
                  textAlign: 'center',
                  fontStyle: 'italic',
                  lineHeight: 1.2
                }}
              >
                Modified from: {sopData.title || 'Safe Operating Procedures'} © State of Queensland (Department of Education) 2018 CC BY 4.0.
              </Typography>
            </Paper>
          </Paper>
        </Box>

        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <IconManager 
          open={iconManagerOpen}
          onClose={() => setIconManagerOpen(false)}
          onIconSelect={handleIconSelect}
        />

        {/* Edit SOP Content Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit SOP Content</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {/* Equipment Name */}
              <TextField
                label="Equipment Name"
                value={sopData.equipmentName}
                onChange={(e) => setSopData(prev => ({ 
                  ...prev, 
                  equipmentName: e.target.value,
                  title: `Safe Operating Procedures for ${e.target.value}`
                }))}
                fullWidth
              />

              {/* Caution Text */}
              <TextField
                label="Caution Statement"
                multiline
                rows={2}
                value={sopData.caution}
                onChange={(e) => setSopData(prev => ({ ...prev, caution: e.target.value }))}
                fullWidth
              />

              {/* PPE Icons Selection */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Required PPE Icons</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1 }}>
                  {safetyIcons.map((icon) => (
                    <Box
                      key={icon.id}
                      sx={{
                        border: `2px solid ${sopData.selectedPpeIcons.includes(icon.id) ? colors.primary : colors.border}`,
                        borderRadius: 1,
                        p: 1,
                        cursor: 'pointer',
                        bgcolor: sopData.selectedPpeIcons.includes(icon.id) ? `${colors.primary}20` : 'transparent',
                        '&:hover': { bgcolor: `${colors.primary}10` }
                      }}
                      onClick={() => {
                        const newSelected = sopData.selectedPpeIcons.includes(icon.id)
                          ? sopData.selectedPpeIcons.filter(id => id !== icon.id)
                          : [...sopData.selectedPpeIcons, icon.id];
                        setSopData(prev => ({ ...prev, selectedPpeIcons: newSelected }));
                      }}
                    >
                      <img 
                        src={`${API_BASE}${icon.path}`}
                        alt={icon.name}
                        style={{ width: '50px', height: '50px', objectFit: 'contain', marginBottom: '4px' }}
                      />
                      <Typography variant="caption" sx={{ fontSize: '10px', display: 'block', textAlign: 'center' }}>
                        {icon.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Pre-Operational Checks */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Pre-Operational Safety Checks</Typography>
                <Box sx={{ mb: 1 }}>
                  <TextField
                    label="Paste multiple items (separated by line breaks)"
                    multiline
                    rows={3}
                    placeholder="Paste your content here and it will automatically split into individual items..."
                    fullWidth
                    size="small"
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      const items = pastedText
                        .split(/\n+/)
                        .map(item => item.trim())
                        .filter(item => item.length > 0);
                      
                      if (items.length > 1) {
                        setSopData(prev => ({
                          ...prev,
                          preOperationalChecks: [...prev.preOperationalChecks, ...items]
                        }));
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      setSopData(prev => ({
                        ...prev,
                        preOperationalChecks: [...prev.preOperationalChecks, '']
                      }));
                    }}
                    size="small"
                    variant={buttonStyles.secondary.variant}
                    sx={{ 
                      ...buttonStyles.secondary.sx,
                      mt: 0.5 
                    }}
                  >
                    Add Single Check
                  </Button>
                </Box>
                {sopData.preOperationalChecks.map((check, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      value={check}
                      onChange={(e) => {
                        const newChecks = [...sopData.preOperationalChecks];
                        newChecks[index] = e.target.value;
                        setSopData(prev => ({ ...prev, preOperationalChecks: newChecks }));
                      }}
                      fullWidth
                      size="small"
                    />
                    <IconButton
                      onClick={() => {
                        const newChecks = sopData.preOperationalChecks.filter((_, i) => i !== index);
                        setSopData(prev => ({ ...prev, preOperationalChecks: newChecks }));
                      }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              {/* Operational Checks */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Operational Safety Checks</Typography>
                <Box sx={{ mb: 1 }}>
                  <TextField
                    label="Paste multiple items (separated by line breaks)"
                    multiline
                    rows={3}
                    placeholder="Paste your content here and it will automatically split into individual items..."
                    fullWidth
                    size="small"
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      const items = pastedText
                        .split(/\n+/)
                        .map(item => item.trim())
                        .filter(item => item.length > 0);
                      
                      if (items.length > 1) {
                        setSopData(prev => ({
                          ...prev,
                          operationalChecks: [...prev.operationalChecks, ...items]
                        }));
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      setSopData(prev => ({
                        ...prev,
                        operationalChecks: [...prev.operationalChecks, '']
                      }));
                    }}
                    size="small"
                    variant={buttonStyles.secondary.variant}
                    sx={{ 
                      ...buttonStyles.secondary.sx,
                      mt: 0.5 
                    }}
                  >
                    Add Single Check
                  </Button>
                </Box>
                {sopData.operationalChecks.map((check, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      value={check}
                      onChange={(e) => {
                        const newChecks = [...sopData.operationalChecks];
                        newChecks[index] = e.target.value;
                        setSopData(prev => ({ ...prev, operationalChecks: newChecks }));
                      }}
                      fullWidth
                      size="small"
                    />
                    <IconButton
                      onClick={() => {
                        const newChecks = sopData.operationalChecks.filter((_, i) => i !== index);
                        setSopData(prev => ({ ...prev, operationalChecks: newChecks }));
                      }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              {/* Housekeeping */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Housekeeping</Typography>
                <Box sx={{ mb: 1 }}>
                  <TextField
                    label="Paste multiple items (separated by line breaks)"
                    multiline
                    rows={3}
                    placeholder="Paste your content here and it will automatically split into individual items..."
                    fullWidth
                    size="small"
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      const items = pastedText
                        .split(/\n+/)
                        .map(item => item.trim())
                        .filter(item => item.length > 0);
                      
                      if (items.length > 1) {
                        setSopData(prev => ({
                          ...prev,
                          housekeeping: [...prev.housekeeping, ...items]
                        }));
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      setSopData(prev => ({
                        ...prev,
                        housekeeping: [...prev.housekeeping, '']
                      }));
                    }}
                    size="small"
                    variant={buttonStyles.secondary.variant}
                    sx={{ 
                      ...buttonStyles.secondary.sx,
                      mt: 0.5 
                    }}
                  >
                    Add Single Item
                  </Button>
                </Box>
                {sopData.housekeeping.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      value={item}
                      onChange={(e) => {
                        const newItems = [...sopData.housekeeping];
                        newItems[index] = e.target.value;
                        setSopData(prev => ({ ...prev, housekeeping: newItems }));
                      }}
                      fullWidth
                      size="small"
                    />
                    <IconButton
                      onClick={() => {
                        const newItems = sopData.housekeeping.filter((_, i) => i !== index);
                        setSopData(prev => ({ ...prev, housekeeping: newItems }));
                      }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              {/* Potential Hazards */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Potential Hazards</Typography>
                <Box sx={{ mb: 1 }}>
                  <TextField
                    label="Paste multiple items (separated by line breaks)"
                    multiline
                    rows={3}
                    placeholder="Paste your content here and it will automatically split into individual items..."
                    fullWidth
                    size="small"
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      const items = pastedText
                        .split(/\n+/)
                        .map(item => item.trim())
                        .filter(item => item.length > 0);
                      
                      if (items.length > 1) {
                        setSopData(prev => ({
                          ...prev,
                          potentialHazards: [...prev.potentialHazards, ...items]
                        }));
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      setSopData(prev => ({
                        ...prev,
                        potentialHazards: [...prev.potentialHazards, '']
                      }));
                    }}
                    size="small"
                    variant={buttonStyles.secondary.variant}
                    sx={{ 
                      ...buttonStyles.secondary.sx,
                      mt: 0.5 
                    }}
                  >
                    Add Single Hazard
                  </Button>
                </Box>
                {sopData.potentialHazards.map((hazard, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      value={hazard}
                      onChange={(e) => {
                        const newHazards = [...sopData.potentialHazards];
                        newHazards[index] = e.target.value;
                        setSopData(prev => ({ ...prev, potentialHazards: newHazards }));
                      }}
                      fullWidth
                      size="small"
                    />
                    <IconButton
                      onClick={() => {
                        const newHazards = sopData.potentialHazards.filter((_, i) => i !== index);
                        setSopData(prev => ({ ...prev, potentialHazards: newHazards }));
                      }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              {/* Not Allowed */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Not Allowed</Typography>
                <Box sx={{ mb: 1 }}>
                  <TextField
                    label="Paste multiple items (separated by line breaks)"
                    multiline
                    rows={3}
                    placeholder="Paste your content here and it will automatically split into individual items..."
                    fullWidth
                    size="small"
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      const items = pastedText
                        .split(/\n+/)
                        .map(item => item.trim())
                        .filter(item => item.length > 0);
                      
                      if (items.length > 1) {
                        setSopData(prev => ({
                          ...prev,
                          notAllowed: [...prev.notAllowed, ...items]
                        }));
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      setSopData(prev => ({
                        ...prev,
                        notAllowed: [...prev.notAllowed, '']
                      }));
                    }}
                    size="small"
                    variant={buttonStyles.secondary.variant}
                    sx={{ 
                      ...buttonStyles.secondary.sx,
                      mt: 0.5 
                    }}
                  >
                    Add Single Item
                  </Button>
                </Box>
                {sopData.notAllowed.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      value={item}
                      onChange={(e) => {
                        const newItems = [...sopData.notAllowed];
                        newItems[index] = e.target.value;
                        setSopData(prev => ({ ...prev, notAllowed: newItems }));
                      }}
                      fullWidth
                      size="small"
                    />
                    <IconButton
                      onClick={() => {
                        const newItems = sopData.notAllowed.filter((_, i) => i !== index);
                        setSopData(prev => ({ ...prev, notAllowed: newItems }));
                      }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setEditDialogOpen(false)}
              variant={buttonStyles.secondary.variant}
              sx={{
                ...buttonStyles.secondary.sx,
                mr: 1
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setEditDialogOpen(false)}
              variant={buttonStyles.primary.variant}
              sx={buttonStyles.primary.sx}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      </Layout>
    </>
  );
}
