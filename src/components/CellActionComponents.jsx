/* eslint-disable react/prop-types */
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useContext, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useInvalidate } from '../utils/Invalidate';
import { Link } from 'react-router-dom';
import useRouteDB from '../utils/RouteDB';
import { EmpleadosContext } from '../pages/EmpleadosPage';
import { enqueueSnackbar } from 'notistack';
import { getError } from '../utils/getError';
import { useTranslation } from 'react-i18next';

export const CellActionComponents = ({ info }) => {
  const [t] = useTranslation('global');
  const { invalidate } = useInvalidate();
  const { params } = useRouteDB();

  console.log(info);
  const { isPending, mutate } = useMutation({
    mutationFn: async () =>
      await axios
        .delete(`/users/databases/${info?.dbName}`)
        .then((res) => res.data),
    onSuccess: () => {
      invalidate(['empresas']);
      enqueueSnackbar('Se elimino con exito', { variant: 'error' });
    },
    onError: (err) => {
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleDelete = () => {
    const confirmDelete = confirm(t('messages.confirmDelete'));

    if (!confirmDelete) return;

    mutate();
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
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="menu-lng"
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
          display: 'block',
          textTransform: 'capitalize',
        }}
      >
        <MenuItem
          component={Link}
          to={params(`/empresas/${info.dbName}`)}
          disabled={isPending}
        >
          <Typography textAlign="center">{t('buttons.edit')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleDelete} disabled={isPending}>
          <Typography textAlign="center">{t('buttons.delete')}</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export const CellActionCenter = ({ info, setOpen, nombreEmpresa }) => {
  const [t] = useTranslation('global');
  const { invalidate } = useInvalidate();

  const { isPending, mutate } = useMutation({
    mutationFn: async () =>
      await axios
        .delete(`/users/delete-center/${nombreEmpresa}/${info._id}`)
        .then((res) => res.data),
    onSuccess: () => {
      invalidate(['empresa', nombreEmpresa]);
      enqueueSnackbar('Se elimino con exito', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleDelete = () => {
    const confirmDelete = confirm(t('messages.confirmDelete'));

    if (!confirmDelete) return;

    mutate();
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
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="menu-lng"
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
          display: 'block',
          textTransform: 'capitalize',
        }}
      >
        <MenuItem
          component={Link}
          disabled={isPending}
          onClick={() => setOpen(info)}
        >
          <Typography textAlign="center">{t('buttons.edit')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleDelete} disabled={isPending}>
          <Typography textAlign="center">{t('buttons.delete')}</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export const CellActionService = ({ info, setOpen, nombreEmpresa }) => {
  const [t] = useTranslation('global');
  const { invalidate } = useInvalidate();

  const { isPending, mutate } = useMutation({
    mutationFn: async () =>
      await axios
        .delete(`/users/delete-center/${nombreEmpresa}/${info._id}`)
        .then((res) => res.data),
    onSuccess: () => {
      invalidate(['empresa', nombreEmpresa]);
      enqueueSnackbar('Se elimino con exito', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleDelete = () => {
    const confirmDelete = confirm(t('messages.confirmDelete'));

    if (!confirmDelete) return;

    mutate();
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
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="menu-lng"
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
          display: 'block',
          textTransform: 'capitalize',
        }}
      >
        <MenuItem
          component={Link}
          disabled={isPending}
          onClick={() => setOpen(info)}
        >
          <Typography textAlign="center">{t('buttons.edit')}</Typography>
        </MenuItem>
        {/* <MenuItem onClick={handleDelete} disabled={isPending}>
          <Typography textAlign="center">{t('buttons.delete')}</Typography>
        </MenuItem> */}
      </Menu>
    </Box>
  );
};

export const CellActionEmployee = ({ info, nombreEmpresa }) => {
  const { invalidate } = useInvalidate();
  const { setOpen } = useContext(EmpleadosContext);
  const [t] = useTranslation('global');

  console.log(info);
  const { isPending, mutate } = useMutation({
    mutationFn: async () =>
      await axios
        .delete(`/users/delete-employee/${nombreEmpresa}/${info._id}`)
        .then((res) => res.data),
    onSuccess: () => {
      invalidate(['empleados']);
      enqueueSnackbar('Se elimino correctamente', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleDelete = () => {
    const confirmDelete = confirm(t('messages.confirmDelete'));

    if (!confirmDelete) return;

    mutate();
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
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="menu-lng"
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
          display: 'block',
        }}
      >
        <MenuItem
          component={Link}
          disabled={isPending}
          onClick={() => setOpen(info)}
        >
          <Typography textAlign="center">{t('buttons.edit')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleDelete} disabled={isPending}>
          <Typography textAlign="center">{t('buttons.delete')}</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};
