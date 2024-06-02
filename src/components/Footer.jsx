import { Box, Container } from '@mui/material';
import ChangeLngBtn from './ChangeLngBtn';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white' }} py={2}>
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>yNokAI</Box> <ChangeLngBtn />
      </Container>
    </Box>
  );
};

export default Footer;
