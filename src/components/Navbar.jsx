import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useContext, useState } from 'react';
import { UserContext } from '../context';
import useRouteDB from '../utils/RouteDB';
import { useTranslation } from 'react-i18next';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoApp from './LogoApp';

const Navbar = () => {
  const { dispatch, state } = useContext(UserContext);
  const { params } = useRouteDB();
  const [t, i18n] = useTranslation('global');

  const settings = [
    // { text: t('menu.profile') },
    // { text: t('menu.account') },
    // { text: t('menu.dashboard') },
    {
      text: t('menu.logout'),
      action: () => {
        dispatch({ type: 'LOG_OUT' });
      },
    },
  ];

  const pages = [];

  if (state.userInfo?.role === 'ownerAdmin') {
    pages.push({ text: t('menu.companies'), to: '/empresas' });
  }

  if (state.userInfo?.role === 'admin') {
    pages.push({ text: t('menu.employees'), to: '/empleados' });
    pages.push({ text: t('title.schedules'), to: '/horarios' });
  }

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box
              component={Link}
              to={params('/home')}
              color={'white'}
              sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
            >
              <LogoApp version="sm" />
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
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
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem
                    LinkComponent={Link}
                    to={params(page.to)}
                    key={page.to}
                    onClick={handleCloseNavMenu}
                  >
                    <Typography textAlign="center">{page.text}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Box
              component={Link}
              to={params('/home')}
              sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, mr: 1 }}
            >
              <LogoApp version="sm" />
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.to}
                  to={params(page.to)}
                  LinkComponent={Link}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.text}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 1 }}>
                  {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" /> */}
                  <AccountCircleIcon sx={{ fontSize: 30, color: '#fff' }} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting.text} onClick={setting.action}>
                    <Typography
                      textAlign="center"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {setting.text}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default Navbar;
