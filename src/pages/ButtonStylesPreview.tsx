import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper,
  Stack,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { buttonStyles } from '../styles/buttonStyles';

const ButtonPreview = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Button Styles Preview
      </Typography>
      
      {/* Primary Buttons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Primary Buttons</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button {...buttonStyles.primary}>Default</Button>
          <Button {...buttonStyles.primary} disabled>Disabled</Button>
          <Button {...buttonStyles.primary} startIcon={<AddIcon />}>With Icon</Button>
        </Stack>
      </Paper>

      {/* Secondary Buttons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Secondary Buttons</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button {...buttonStyles.secondary}>Default</Button>
          <Button {...buttonStyles.secondary} disabled>Disabled</Button>
          <Button {...buttonStyles.secondary} startIcon={<AddIcon />}>With Icon</Button>
        </Stack>
      </Paper>

      {/* Cancel Buttons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Cancel Buttons</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button {...buttonStyles.cancel}>Default</Button>
          <Button {...buttonStyles.cancel} disabled>Disabled</Button>
          <Button {...buttonStyles.cancel} startIcon={<AddIcon />}>With Icon</Button>
        </Stack>
      </Paper>

      {/* Danger Buttons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Danger Buttons</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button {...buttonStyles.danger}>Default</Button>
          <Button {...buttonStyles.danger} disabled>Disabled</Button>
          <Button {...buttonStyles.danger} startIcon={<DeleteIcon />}>With Icon</Button>
        </Stack>
      </Paper>

      {/* Usage Examples */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Usage Examples</Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>Dialog Actions</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button {...buttonStyles.cancel}>Cancel</Button>
              <Button {...buttonStyles.primary}>Save Changes</Button>
            </Stack>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle1" gutterBottom>List Actions</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button {...buttonStyles.primary} startIcon={<AddIcon />}>Add New</Button>
              <Button {...buttonStyles.danger} startIcon={<DeleteIcon />}>Delete Selected</Button>
            </Stack>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle1" gutterBottom>Form Actions</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button {...buttonStyles.secondary}>Reset</Button>
              <Button {...buttonStyles.primary}>Submit</Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ButtonPreview; 