import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
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
  Chip,
  Divider,
  Card,
  CardContent,
  Grid,
  Tooltip
} from '@mui/material';
import { Layout } from '../../components/layout/Layout';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HearingIcon from '@mui/icons-material/Hearing';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import html2pdf from 'html2pdf.js';

const API_BASE = 'http://localhost:3001';

export interface SafetyIcon {
  id: string;
  name: string;
  category: string;
  filename: string;
  path: string;
  uploadDate: string;
}

export default function SopViewer() {
  const { colors, buttonStyles } = useThemedStyles();
  const { lessonId, sopId } = useParams<{ lessonId: string; sopId: string }>();
  const navigate = useNavigate();
  const [sop, setSop] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [safetyIcons, setSafetyIcons] = useState<SafetyIcon[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch SOP data
  useEffect(() => {
    if (sopId) {
      // Fetch SOP details
      fetch(`${API_BASE}/sop-documents`)
        .then(res => res.json())
        .then(data => {
          const foundSop = data.find((s: any) => s.id === sopId);
          if (foundSop) {
            setSop(foundSop);
          }
        })
        .catch(error => console.error('Error fetching SOP:', error));

      // Fetch lesson details
      if (lessonId) {
        fetch(`${API_BASE}/lessons`)
          .then(res => res.json())
          .then(data => {
            const foundLesson = data.find((l: any) => l.id.toString() === lessonId);
            if (foundLesson) {
              setLesson(foundLesson);
            }
          })
          .catch(error => console.error('Error fetching lesson:', error));
      }

      // Fetch safety icons
      fetch(`${API_BASE}/safety-icons`)
        .then(res => res.json())
        .then(data => setSafetyIcons(data))
        .catch(error => console.error('Error fetching safety icons:', error));
    }
  }, [sopId, lessonId]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const element = document.querySelector('.sop-viewer-document');
      if (!element) {
        throw new Error('Could not find SOP document element');
      }

      // Wait for images to load
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
        filename: `SOP_${sop?.sopData?.equipmentName || sop?.name || 'Document'}.pdf`,
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

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    navigate(`/lessons/${lessonId}/sop-builder?edit=${sopId}`);
  };

  if (!sop) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
          <Typography variant="h6" color="text.secondary">SOP not found</Typography>
        </Box>
      </Layout>
    );
  }

  const sopData = sop.sopData || {};

  return (
    <>
      {/* Print styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            .sop-viewer-document, .sop-viewer-document * {
              visibility: visible !important;
            }
            .sop-viewer-document {
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
          <Link component={RouterLink} underline="hover" color="inherit" to="/lessons" key="lessons" sx={{ fontWeight: 600, fontSize: 18 }}>Lessons</Link>,
          <Link component={RouterLink} underline="hover" color="inherit" to={`/lessons/${lessonId}`} key="lesson" sx={{ fontWeight: 600, fontSize: 18 }}>{lesson?.name || 'Lesson'}</Link>,
          <Typography color="text.primary" key="current" sx={{ fontWeight: 600, fontSize: 18 }}>SOP Viewer</Typography>
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
              <IconButton onClick={() => navigate(`/lessons/${lessonId}`)}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {sopData.title || sop.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Print SOP">
                <IconButton onClick={handlePrint}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit SOP">
                <IconButton onClick={handleEdit}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
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
              className="sop-viewer-document"
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
              {sopData.selectedPpeIcons && sopData.selectedPpeIcons.length > 0 && (
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
                    {sopData.selectedPpeIcons.map((iconId: string, index: number) => {
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
              )}

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
              {sopData.preOperationalChecks && sopData.preOperationalChecks.length > 0 && (
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
                    {sopData.preOperationalChecks.map((item: string, index: number) => (
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
              {sopData.operationalChecks && sopData.operationalChecks.length > 0 && (
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
                    {sopData.operationalChecks.map((item: string, index: number) => (
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
              {sopData.housekeeping && sopData.housekeeping.length > 0 && (
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
                    {sopData.housekeeping.map((item: string, index: number) => (
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
              {sopData.potentialHazards && sopData.potentialHazards.length > 0 && (
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
                      {sopData.potentialHazards.slice(0, Math.ceil(sopData.potentialHazards.length / 2)).map((hazard: string, index: number) => (
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
                      {sopData.potentialHazards.slice(Math.ceil(sopData.potentialHazards.length / 2)).map((hazard: string, index: number) => (
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
              {sopData.notAllowed && sopData.notAllowed.length > 0 && (
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
                    {sopData.notAllowed.map((item: string, index: number) => (
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
        </Box>
      </Layout>
    </>
  );
}
