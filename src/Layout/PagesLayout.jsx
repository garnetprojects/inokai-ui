import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { Box } from '@mui/material';

const PagesLayout = () => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        minHeight: '100svh',
      }}
    >
      <Navbar />
      <Box component={'main'} my={5}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default PagesLayout;
