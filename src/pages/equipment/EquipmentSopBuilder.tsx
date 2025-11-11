import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
import HearingIcon from '@mui/icons-material/Hearing';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
  const location = useLocation();
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [safetyIcons, setSafetyIcons] = useState<SafetyIcon[]>([]);
  const isViewMode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.has('view');
  }, [location.search]);
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
            const loadTemplate = urlParams.get('loadTemplate');
            const selectedSopId = urlParams.get('selectedSopId');
            const schoolName = urlParams.get('schoolName');
            const dateOfReview = urlParams.get('dateOfReview');
            const reviewedBy = urlParams.get('reviewedBy');
            const nextReviewDue = urlParams.get('nextReviewDue');

            if (download) {
              setTimeout(handleDownloadPDF, 1000);
            }

            const applyReviewParams = () => {
              if (schoolName || dateOfReview || reviewedBy || nextReviewDue) {
                setSopData(prev => ({
                  ...prev,
                  ...(schoolName && { schoolName }),
                  ...(dateOfReview && { dateOfReview }),
                  ...(reviewedBy && { reviewedBy }),
                  ...(nextReviewDue && { nextReviewDue }),
                }));
              }
            };

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
                      ...existingSop.sopData,
                      title: `Safe Operating Procedures for ${foundEquipment.name}`,
                      equipmentName: foundEquipment.name,
                      room: foundEquipment.location
                    }));
                    applyReviewParams();
                  }
                })
                .catch(error => console.error('Error fetching existing SOP:', error));
            } else if (loadTemplate && selectedSopId) {
              fetch(`${API_BASE}/sop-documents`)
                .then(res => res.json())
                .then(data => {
                  const templateSop = data.find((sop: any) => sop.id === selectedSopId);
                  if (templateSop && templateSop.sopData) {
                    setSopData(prev => ({
                      ...prev,
                      ...templateSop.sopData,
                      title: `Safe Operating Procedures for ${foundEquipment.name}`,
                      equipmentName: foundEquipment.name,
                      room: foundEquipment.location
                    }));
                    applyReviewParams();
                  }
                })
                .catch(error => console.error('Error fetching template SOP:', error));
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
                            applyReviewParams();
                          }
                        }
                      })
                      .catch(error => console.error('Error fetching lesson SOPs:', error));
                  }
                })
                .catch(error => console.error('Error fetching linked lesson:', error));
            }
            applyReviewParams();
          }
        })
        .catch(error => console.error('Error fetching equipment:', error));

      // Fetch safety icons
      fetch(`${API_BASE}/safety-icons`)
        .then(res => res.json())
        .then(data => setSafetyIcons(data))
        .catch(error => console.error('Error fetching safety icons:', error));
    }
  }, [equipmentId, location.search]);

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
    if (!isViewMode && !validateSopData()) {
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
        filename: `${(sopData.equipmentName || 'equipment').replace(/[^a-z0-9]+/gi, '_')}_SOP.pdf`,
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

  const formatDateForDisplay = (value: string | undefined) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB');
  };

  const addItemToArray = (arrayName: keyof typeof sopData, item: string) => {
    if (item.trim()) {
      setSopData(prev => ({
        ...prev,
        [arrayName]: [...(prev[arrayName] as string[]), item.trim()]
      }));
      if (validationErrors[arrayName]) {
        setValidationErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[arrayName];
          return newErrors;
        });
      }
    }
  };

  const removeItemFromArray = (arrayName: keyof typeof sopData, index: number) => {
    setSopData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as string[]).filter((_, i) => i !== index)
    }));
  };

  const updateItemInArray = (arrayName: keyof typeof sopData, index: number, value: string) => {
    setSopData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as string[]).map((item, i) => (i === index ? value : item))
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
                      Date of Review: {formatDateForDisplay(sopData.dateOfReview) || 'Date'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 10 }}>
                      Reviewed By: {sopData.reviewedBy || 'Reviewer Name'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 10 }}>
                      Next Review Due: {formatDateForDisplay(sopData.nextReviewDue) || 'Due Date'}
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
                {...buttonStyles.secondary}
                 onClick={handleRejectCopiedContent}
               >
                 Start Fresh
               </Button>
               <Button 
                {...buttonStyles.primary}
                 onClick={handleAcceptCopiedContent}
               >
                 Copy Content
               </Button>
             </DialogActions>
           </Dialog>

          {/* Edit SOP Content Dialog */}
          <Dialog 
            open={editDialogOpen} 
            onClose={() => setEditDialogOpen(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Edit SOP Content</Typography>
              <Button
                {...buttonStyles.secondary}
                size="small"
                onClick={() => {
                  if (validateSopData()) {
                    setEditDialogOpen(false);
                  } else {
                    setSnackbarMessage('Please fix validation errors before closing');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                  }
                }}
              >
                Save & Close
              </Button>
            </DialogTitle>
            <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                
                {/* Basic Information Section */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Basic Information</Typography>
                      <IconButton onClick={() => toggleSection('basicInfo')}>
                        {expandedSections.basicInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    <Collapse in={expandedSections.basicInfo}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          label="Equipment Name"
                          value={sopData.equipmentName}
                          onChange={(e) => setSopData(prev => ({ 
                            ...prev, 
                            equipmentName: e.target.value,
                            title: `Safe Operating Procedures for ${e.target.value}`
                          }))}
                          fullWidth
                          error={!!validationErrors.equipmentName}
                          helperText={validationErrors.equipmentName}
                          required
                        />
                        <TextField
                          label="Room/Location"
                          value={sopData.room}
                          onChange={(e) => setSopData(prev => ({ ...prev, room: e.target.value }))}
                          fullWidth
                        />
                        <TextField
                          label="Caution Statement"
                          multiline
                          rows={2}
                          value={sopData.caution}
                          onChange={(e) => setSopData(prev => ({ ...prev, caution: e.target.value }))}
                          fullWidth
                          error={!!validationErrors.caution}
                          helperText={validationErrors.caution}
                          required
                        />
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>

                {/* PPE Icons Section */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Required PPE Icons</Typography>
                      <IconButton onClick={() => toggleSection('ppe')}>
                        {expandedSections.ppe ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    <Collapse in={expandedSections.ppe}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Select the required personal protective equipment icons for this SOP
                        </Typography>
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
                                '&:hover': { bgcolor: `${colors.primary}10` },
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => {
                                const newSelected = sopData.selectedPpeIcons.includes(icon.id)
                                  ? sopData.selectedPpeIcons.filter(id => id !== icon.id)
                                  : [...sopData.selectedPpeIcons, icon.id];
                                setSopData(prev => ({ ...prev, selectedPpeIcons: newSelected }));
                                if (validationErrors.selectedPpeIcons) {
                                  setValidationErrors(prevErrors => {
                                    const newErrors = { ...prevErrors };
                                    delete newErrors.selectedPpeIcons;
                                    return newErrors;
                                  });
                                }
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
                        {validationErrors.selectedPpeIcons && (
                          <FormHelperText error sx={{ mt: 1 }}>{validationErrors.selectedPpeIcons}</FormHelperText>
                        )}
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>

                {/* Safety Checks Section */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Safety Checks</Typography>
                      <IconButton onClick={() => toggleSection('safetyChecks')}>
                        {expandedSections.safetyChecks ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    <Collapse in={expandedSections.safetyChecks}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        
                        {/* Pre-Operational Checks */}
                        <Box>
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Pre-Operational Safety Checks</Typography>
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
                                  .split(/\r?\n+/)
                                  .map(item => item.trim())
                                  .filter(item => item.length > 0);

                                if (items.length === 0) {
                                  return;
                                }

                                setSopData(prev => ({
                                  ...prev,
                                  preOperationalChecks: [...prev.preOperationalChecks, ...items]
                                }));

                                if (validationErrors.preOperationalChecks) {
                                  setValidationErrors(prevErrors => {
                                    const newErrors = { ...prevErrors };
                                    delete newErrors.preOperationalChecks;
                                    return newErrors;
                                  });
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
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            >
                              Add Single Check
                            </Button>
                          </Box>
                          {sopData.preOperationalChecks.map((check, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <TextField
                                value={check}
                                onChange={(e) => updateItemInArray('preOperationalChecks', index, e.target.value)}
                                fullWidth
                                size="small"
                                placeholder={`Check ${index + 1}`}
                              />
                              <IconButton
                                onClick={() => removeItemFromArray('preOperationalChecks', index)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                          {validationErrors.preOperationalChecks && (
                            <FormHelperText error>{validationErrors.preOperationalChecks}</FormHelperText>
                          )}
                        </Box>

                        {/* Operational Checks */}
                        <Box>
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Operational Safety Checks</Typography>
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
                                  .split(/\r?\n+/)
                                  .map(item => item.trim())
                                  .filter(item => item.length > 0);

                                if (items.length === 0) {
                                  return;
                                }

                                setSopData(prev => ({
                                  ...prev,
                                  operationalChecks: [...prev.operationalChecks, ...items]
                                }));

                                if (validationErrors.operationalChecks) {
                                  setValidationErrors(prevErrors => {
                                    const newErrors = { ...prevErrors };
                                    delete newErrors.operationalChecks;
                                    return newErrors;
                                  });
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
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            >
                              Add Single Check
                            </Button>
                          </Box>
                          {sopData.operationalChecks.map((check, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <TextField
                                value={check}
                                onChange={(e) => updateItemInArray('operationalChecks', index, e.target.value)}
                                fullWidth
                                size="small"
                                placeholder={`Check ${index + 1}`}
                              />
                              <IconButton
                                onClick={() => removeItemFromArray('operationalChecks', index)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                          {validationErrors.operationalChecks && (
                            <FormHelperText error>{validationErrors.operationalChecks}</FormHelperText>
                          )}
                        </Box>

                        {/* Housekeeping */}
                        <Box>
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Housekeeping</Typography>
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
                                  .split(/\r?\n+/)
                                  .map(item => item.trim())
                                  .filter(item => item.length > 0);

                                if (items.length === 0) {
                                  return;
                                }

                                setSopData(prev => ({
                                  ...prev,
                                  housekeeping: [...prev.housekeeping, ...items]
                                }));
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
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            >
                              Add Single Item
                            </Button>
                          </Box>
                          {sopData.housekeeping.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <TextField
                                value={item}
                                onChange={(e) => updateItemInArray('housekeeping', index, e.target.value)}
                                fullWidth
                                size="small"
                                placeholder={`Item ${index + 1}`}
                              />
                              <IconButton
                                onClick={() => removeItemFromArray('housekeeping', index)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>

                {/* Hazards Section */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Hazards & Restrictions</Typography>
                      <IconButton onClick={() => toggleSection('hazards')}>
                        {expandedSections.hazards ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    <Collapse in={expandedSections.hazards}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        
                        {/* Potential Hazards */}
                        <Box>
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Potential Hazards</Typography>
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
                                  .split(/\r?\n+/)
                                  .map(item => item.trim())
                                  .filter(item => item.length > 0);

                                if (items.length === 0) {
                                  return;
                                }

                                setSopData(prev => ({
                                  ...prev,
                                  potentialHazards: [...prev.potentialHazards, ...items]
                                }));

                                if (validationErrors.potentialHazards) {
                                  setValidationErrors(prevErrors => {
                                    const newErrors = { ...prevErrors };
                                    delete newErrors.potentialHazards;
                                    return newErrors;
                                  });
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
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            >
                              Add Single Hazard
                            </Button>
                          </Box>
                          {sopData.potentialHazards.map((hazard, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <TextField
                                value={hazard}
                                onChange={(e) => updateItemInArray('potentialHazards', index, e.target.value)}
                                fullWidth
                                size="small"
                                placeholder={`Hazard ${index + 1}`}
                              />
                              <IconButton
                                onClick={() => removeItemFromArray('potentialHazards', index)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                          {validationErrors.potentialHazards && (
                            <FormHelperText error>{validationErrors.potentialHazards}</FormHelperText>
                          )}
                        </Box>

                        {/* Not Allowed */}
                        <Box>
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Not Allowed</Typography>
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
                                  .split(/\r?\n+/)
                                  .map(item => item.trim())
                                  .filter(item => item.length > 0);

                                if (items.length === 0) {
                                  return;
                                }

                                setSopData(prev => ({
                                  ...prev,
                                  notAllowed: [...prev.notAllowed, ...items]
                                }));
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
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            >
                              Add Single Item
                            </Button>
                          </Box>
                          {sopData.notAllowed.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <TextField
                                value={item}
                                onChange={(e) => updateItemInArray('notAllowed', index, e.target.value)}
                                fullWidth
                                size="small"
                                placeholder={`Restriction ${index + 1}`}
                              />
                              <IconButton
                                onClick={() => removeItemFromArray('notAllowed', index)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>

                {/* Review Information Section */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Review Information</Typography>
                      <IconButton onClick={() => toggleSection('review')}>
                        {expandedSections.review ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    <Collapse in={expandedSections.review}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          label="School Name"
                          value={sopData.schoolName}
                          onChange={(e) => setSopData(prev => ({ ...prev, schoolName: e.target.value }))}
                          fullWidth
                        />
                        <TextField
                          label="Date of Review"
                          type="date"
                          value={sopData.dateOfReview}
                          onChange={(e) => setSopData(prev => ({ ...prev, dateOfReview: e.target.value }))}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Reviewed By"
                          value={sopData.reviewedBy}
                          onChange={(e) => setSopData(prev => ({ ...prev, reviewedBy: e.target.value }))}
                          fullWidth
                        />
                        <TextField
                          label="Next Review Due"
                          type="date"
                          value={sopData.nextReviewDue}
                          onChange={(e) => setSopData(prev => ({ ...prev, nextReviewDue: e.target.value }))}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                {...buttonStyles.cancel}
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                {...buttonStyles.primary}
                onClick={() => {
                  if (validateSopData()) {
                    setEditDialogOpen(false);
                  } else {
                    setSnackbarMessage('Please fix validation errors before saving');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                  }
                }}
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
