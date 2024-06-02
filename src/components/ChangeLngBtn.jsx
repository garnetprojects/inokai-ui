import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import TranslateIcon from '@mui/icons-material/Translate';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import eu from '../assets/eu.svg';
import sp from '../assets/sp.svg';

const ChangeLngBtn = () => {
  const [t, i18n] = useTranslation('global');
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleChangeLanguage = (lang) => {
    localStorage.setItem('lng', lang);
    i18n.changeLanguage(lang);
    handleCloseNavMenu();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-lng"
        aria-haspopup="true"
        onClick={handleOpenNavMenu}
        color="inherit"
      >
        <TranslateIcon />
      </IconButton>
      <Menu
        id="menu-lng"
        anchorEl={anchorElNav}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorElNav)}
        onClose={handleCloseNavMenu}
        sx={{
          display: 'block',
        }}
      >
        <MenuItem onClick={() => handleChangeLanguage('en')}>
          <Typography textAlign="center">
            <img src={eu} height={20} />
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChangeLanguage('es')}>
          <Typography textAlign="center">
            <img src={sp} height={20} />
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ChangeLngBtn;
