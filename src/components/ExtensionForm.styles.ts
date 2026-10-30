import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

export const Wrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  maxWidth: 400,
  margin: '80px auto',
});

export const Actions = styled(Box)({
  display: 'flex',
  gap: 12,
});