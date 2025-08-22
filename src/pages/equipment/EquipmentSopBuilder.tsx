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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Collapse,
  Card,
  CardContent
} from '@mui/material';
import { Layout } from '../../components/layout/Layout';
import { useThemedStyles } from '../../hooks/useThemedStyles';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import IconManager from '../lessons/IconManager';
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

export default function EquipmentSopBuilder() {
  const { colors, buttonStyles } = useThemedStyles();
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
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
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [iconManagerOpen, setIconManagerOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [safetyIcons, setSafetyIcons] = useState<SafetyIcon[]>([]);
  const [isViewMode, setIsViewMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    basicInfo: true,
    safetyChecks: false,
    hazards: false,
    ppe: false,
    review: false
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [copiedContentDialogOpen, setCopiedContentDialogOpen] = useState(false);
  const [copiedSopData, setCopiedSopData] = useState<any>(null);

  // Fetch equipment and safety icons data
  useEffect(() => {
    if (equipmentId) {
      // Fetch equipment details
      fetch(`${API_BASE}/equipment`)
        .then(res => res.json())
        .then(data => {
          const foundEquipment = data.find((e: Equipment) => e.id === equipmentId);
          if (foundEquipment) {
            setEquipment(foundEquipment);
            setSopData(prev => ({ 
              ...prev, 
              title: `Safe Operating Procedures for ${foundEquipment.name}`,
              equipmentName: foundEquipment.name,
              room: foundEquipment.location // Automatically set room from equipment location
            }));

            // Check for edit or view parameters
            const urlParams = new URLSearchParams(window.location.search);
            const editSopId = urlParams.get('edit');
            const viewSopId = urlParams.get('view');
            const download = urlParams.get('download');
            
            if (viewSopId) {
              setIsViewMode(true);
            }

            if (download) {
              setTimeout(handleDownloadPDF, 1000);
            }

            if (editSopId || viewSopId) {
              const sopId = editSopId || viewSopId;
              // Fetch existing SOP data
              fetch(`${API_BASE}/equipment/${equipmentId}/sops`)
                .then(res => res.json())
                .then(data => {
                  const existingSop = data.find((sop: any) => sop.id === sopId);
                  if (existingSop && existingSop.sopData) {
                    setSopData(prev => ({
                      ...prev,
                      ...existingSop.sopData
                    }));
                  }
                })
                .catch(error => console.error('Error fetching existing SOP:', error));
            } else {
              // If creating a new SOP, check for linked lesson SOP to copy from
              fetch(`${API_BASE}/equipment/${equipmentId}/lessons`)
                .then(res => res.json())
                .then(data => {
                  if (data.success && data.linkedLesson) {
                    const linkedLesson = data.linkedLesson;
                    // Fetch SOPs for the linked lesson
                    fetch(`${API_BASE}/sop-documents/lesson/${linkedLesson.id}`)
                      .then(res => res.json())
                      .then(lessonSops => {
                        if (lessonSops.length > 0) {
                          // Find the most recent SOP or the first one
                          const lessonSop = lessonSops[0]; // You could sort by date if needed
                          if (lessonSop && lessonSop.sopData) {
                            // Store the copied SOP data for user confirmation
                            const copiedData = {
                              ...lessonSop.sopData,
                              title: `Safe Operating Procedures for ${foundEquipment.name}`,
                              equipmentName: foundEquipment.name,
                              room: foundEquipment.location,
                            };
                            setCopiedSopData(copiedData);
                            setCopiedContentDialogOpen(true);
                          }
                        }
                      })
                      .catch(error => console.error('Error fetching lesson SOPs:', error));
                  }
                })
                .catch(error => console.error('Error fetching linked lesson:', error));
            }
          }
        })
        .catch(error => console.error('Error fetching equipment:', error));

      // Fetch safety icons
      fetch(`${API_BASE}/safety-icons`)
        .then(res => res.json())
        .then(data => setSafetyIcons(data))
        .catch(error => console.error('Error fetching safety icons:', error));
    }
  }, [equipmentId]);

  // Validation function
  const validateSopData = () => {
    const errors: {[key: string]: string} = {};
    
    if (!sopData.equipmentName.trim()) {
      errors.equipmentName = 'Equipment name is required';
    }
    
    if (!sopData.caution.trim()) {
      errors.caution = 'Caution statement is required';
    }
    
    if (sopData.preOperationalChecks.length === 0) {
      errors.preOperationalChecks = 'At least one pre-operational check is required';
    }
    
    if (sopData.operationalChecks.length === 0) {
      errors.operationalChecks = 'At least one operational check is required';
    }
    
    if (sopData.potentialHazards.length === 0) {
      errors.potentialHazards = 'At least one potential hazard is required';
    }
    
    if (sopData.selectedPpeIcons.length === 0) {
      errors.selectedPpeIcons = 'At least one PPE icon is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced PDF generation
  const handleDownloadPDF = async () => {
    if (!validateSopData()) {
      setSnackbarMessage('Please fix validation errors before generating PDF');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      const element = document.querySelector('.sop-document');
      if (!element) {
        throw new Error('Could not find SOP document element');
      }

      const images = element.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `SOP_${sopData.equipmentName || 'Document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: 794,
          height: 1123,
          scrollX: 0,
          scrollY: 0,
          imageTimeout: 15000,
          removeContainer: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };
      
      await html2pdf().set(opt).from(element).save();
      
      setSnackbarMessage('PDF downloaded successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('download')) {
        setTimeout(() => {
          navigate(`/equipment/${equipmentId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      setSnackbarMessage('Error generating PDF. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Save SOP for equipment
  const handleSave = () => {
    if (!validateSopData()) {
      setSnackbarMessage('Please fix validation errors before saving');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const editSopId = urlParams.get('edit');
    
    const endpoint = editSopId 
      ? `${API_BASE}/equipment/${equipmentId}/sops/${editSopId}`
      : `${API_BASE}/equipment/${equipmentId}/sops`;
    const method = editSopId ? 'PUT' : 'POST';
    
    const requestBody = {
      sopData: sopData
    };
    
    fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        setSnackbarMessage(editSopId ? 'SOP updated successfully!' : 'SOP saved successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate(`/equipment/${equipmentId}`);
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAcceptCopiedContent = () => {
    if (copiedSopData) {
      setSopData(copiedSopData);
      setSnackbarMessage('Content copied from lesson SOP successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
    setCopiedContentDialogOpen(false);
    setCopiedSopData(null);
  };

  const handleRejectCopiedContent = () => {
    setCopiedContentDialogOpen(false);
    setCopiedSopData(null);
    setSnackbarMessage('Starting with blank SOP template');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  if (!equipment) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
          <Typography variant="h6" color="text.secondary">Equipment not found</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <>
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
            }
            @page {
              size: A4 portrait !important;
              margin: 0 !important;
            }
          }
        `}
      </style>
      
      <Layout
        breadcrumbs={[
          <Link component={RouterLink} underline="hover" color="inherit" to="/equipment" key="equipment" sx={{ fontWeight: 600, fontSize: 18 }}>Equipment</Link>,
          <Link component={RouterLink} underline="hover" color="inherit" to={`/equipment/${equipmentId}`} key="equipmentDetail" sx={{ fontWeight: 600, fontSize: 18 }}>{equipment.name}</Link>,
          <Typography color="text.primary" key="current" sx={{ fontWeight: 600, fontSize: 18 }}>SOP Builder</Typography>
        ]}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: 'calc(100vh - 64px)',
          mt: -3,
          pt: 0
        }}>
          {/* Fixed Header */}
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
            mx: -3,
            px: 3,
            width: 'calc(100% + 48px)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate(`/equipment/${equipmentId}`)}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                SOP Builder - {equipment.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!isViewMode && (
                <>
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
                </>
              )}
              <Button
                {...buttonStyles.primary}
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </Button>
            </Box>
          </Box>

          {/* SOP Document */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#f5f5f5' }}>
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
                boxSizing: 'border-box'
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
                  {sopData.title || 'Safe Operating Procedures'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 9 }}>
                  Room: {sopData.room || equipment.location}
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
                }}>
                  {sopData.selectedPpeIcons.map((iconId, index) => {
                    const icon = safetyIcons.find(i => i.id === iconId);
                    return icon ? (
                      <Box
                        key={icon.id}
                        aria-label={icon.name}
                        sx={{
                          width: sopData.selectedPpeIcons.length > 6 ? '120px' : '150px',
                          height: sopData.selectedPpeIcons.length > 6 ? '120px' : '150px',
                          backgroundImage: `url(${API_BASE}${icon.path})`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          flexShrink: 1,
                          minWidth: '80px'
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
             onIconSelect={(icon) => {
               const newSelected = sopData.selectedPpeIcons.includes(icon.id)
                 ? sopData.selectedPpeIcons.filter(id => id !== icon.id)
                 : [...sopData.selectedPpeIcons, icon.id];
               setSopData(prev => ({ ...prev, selectedPpeIcons: newSelected }));
             }}
           />

           {/* Copied Content Dialog */}
           <Dialog 
             open={copiedContentDialogOpen} 
             onClose={handleRejectCopiedContent}
             maxWidth="md"
             fullWidth
           >
             <DialogTitle>
               <Typography variant="h6" sx={{ fontWeight: 600 }}>
                 Found Existing Lesson SOP
               </Typography>
             </DialogTitle>
             <DialogContent>
               <Box sx={{ mt: 2 }}>
                 <Typography variant="body1" sx={{ mb: 2 }}>
                   We found an existing SOP for the linked lesson. Would you like to copy its content as a starting point for this equipment SOP?
                 </Typography>
                 
                 {copiedSopData && (
                   <Paper sx={{ p: 2, bgcolor: '#f8f9fa', border: `1px solid ${colors.border}`, borderRadius: 2 }}>
                     <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                       Content Preview:
                     </Typography>
                     <Typography variant="body2" sx={{ mb: 1 }}>
                       <strong>Equipment:</strong> {copiedSopData.equipmentName}
                     </Typography>
                     <Typography variant="body2" sx={{ mb: 1 }}>
                       <strong>Pre-Operational Checks:</strong> {copiedSopData.preOperationalChecks?.length || 0} items
                     </Typography>
                     <Typography variant="body2" sx={{ mb: 1 }}>
                       <strong>Operational Checks:</strong> {copiedSopData.operationalChecks?.length || 0} items
                     </Typography>
                     <Typography variant="body2" sx={{ mb: 1 }}>
                       <strong>Potential Hazards:</strong> {copiedSopData.potentialHazards?.length || 0} items
                     </Typography>
                     <Typography variant="body2" sx={{ mb: 1 }}>
                       <strong>PPE Icons:</strong> {copiedSopData.selectedPpeIcons?.length || 0} selected
                     </Typography>
                     {copiedSopData.caution && (
                       <Typography variant="body2" sx={{ mb: 1 }}>
                         <strong>Caution:</strong> {copiedSopData.caution}
                       </Typography>
                     )}
                   </Paper>
                 )}
                 
                 <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                   You can always modify the content after copying, or start fresh with a blank template.
                 </Typography>
               </Box>
             </DialogContent>
             <DialogActions>
               <Button 
                 onClick={handleRejectCopiedContent}
                 variant="outlined"
                 color="secondary"
               >
                 Start Fresh
               </Button>
               <Button 
                 onClick={handleAcceptCopiedContent}
                 variant="contained"
                 color="primary"
               >
                 Copy Content
               </Button>
             </DialogActions>
           </Dialog>

           {/* Edit Dialog would go here - similar to the lesson SOP builder */}
        </Box>
      </Layout>
    </>
  );
}
