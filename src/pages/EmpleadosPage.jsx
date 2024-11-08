/* eslint-disable react/prop-types */
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, Button, CircularProgress, Container, Divider, IconButton, TextField, Typography, Grid } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { getError } from '../utils/getError';
import TableComponent from '../components/TableComponent';
import { CellActionCenter, CellActionService } from '../components/CellActionComponents';
import { useInvalidate } from '../utils/Invalidate';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ModalComponent from '../components/ModalComponent';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { SelectNoFetchComponent } from '../components/SelectComponent';
import { enqueueSnackbar } from 'notistack';
import { urlBD } from '../utils/urlBD';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useTranslation } from 'react-i18next';
import { imageUpload } from '../utils/helpers';
import SpecialitiesBox from '../components/SpecialitiesBox';
import HandleLogo from '../components/HandleLogo'; // Importa el componente HandleLogo

const EmpresaEditPage = () => {
  const { nombreEmpresa } = useParams();
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ['empresa', nombreEmpresa],
    queryFn: async () => await axios(`/users/get-empresa/${nombreEmpresa}`).then((res) => res.data),
  });

  if (isLoading)
    return (
      <Container>
        <CircularProgress />
      </Container>
    );

  if (isError)
    return (
      <Container>
        <p>{getError(error)}</p>
      </Container>
    );

  return (
    <Container>
      <Header data={data} nombreEmpresa={nombreEmpresa} />
      <Settings nombreEmpresa={nombreEmpresa} />
      <Centers data={data.centers} centerToEdit={{ nombreEmpresa }} />
      <Services data={data.services} centerToEdit={{ nombreEmpresa }} />
    </Container>
  );
};

const Header = ({ data, nombreEmpresa }) => {
  const [t] = useTranslation('global');
  const { invalidate } = useInvalidate();
  
  const [profileImgUrl, setProfileImgUrl] = useState(null); // Estado para la URL de la imagen de perfil

  const mutation = useMutation({
    mutationFn: async (dataUpd) =>
      await axios.put(`/users/edit-admin/${nombreEmpresa}/${data.users._id}`, dataUpd).then((response) => response.data),
    onSuccess: (data) => {
      invalidate(['empresa', nombreEmpresa]);
      enqueueSnackbar('Se editó con éxito', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataupd = {
      name: e.target.name.value,
      email: e.target.email.value,
      DNI: e.target.DNI.value,
    };

    // Si hay una imagen seleccionada, agregarla a los datos a enviar
    if (profileImgUrl) {
      dataupd.profileImgUrl = imageUpload(profileImgUrl, 'large-l-ino24');
    }

    mutation.mutate(dataupd); // Enviar los datos, incluyendo la URL de la imagen si se seleccionó una
  };

  return (
    <>
      <Button LinkComponent={Link} to={-1} startIcon={<ArrowBackIosNewIcon />}>
        {t('buttons.back')}
      </Button>

      <Typography variant={'h2'} sx={{ textTransform: 'capitalize' }} mb={2}>
        {t('title.company')}:{' '}
        <Box component={'span'} fontWeight={'300'}>
          {nombreEmpresa}
        </Box>
      </Typography>

      <Typography sx={{ textTransform: 'lowercase' }}>
        {urlBD(nombreEmpresa)}{' '}
        <IconButton
          onClick={() => {
            navigator.clipboard.writeText(urlBD(nombreEmpresa));
            enqueueSnackbar('Copied', { variant: 'success' });
          }}
        >
          <ContentCopyIcon />
        </IconButton>
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Typography variant={'h4'} sx={{ textTransform: 'capitalize' }} mb={2}>
        {t('title.manager')}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} mb={1}>
          <Grid xs={12} md={6}>
            <TextField
              label={t('inputLabel.name')}
              name="name"
              variant="standard"
              sx={{ width: '100%' }}
              required
              defaultValue={data.users.name}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <TextField
              label={t('inputLabel.email')}
              name="email"
              type="email"
              variant="standard"
              defaultValue={data.users.email}
              required
              sx={{ width: '100%' }}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <TextField
              label={t('inputLabel.dni')}
              type="text"
              name="DNI"
              required
              variant="standard"
              defaultValue={data.users.DNI}
              sx={{ width: '100%' }}
            />
          </Grid>
        </Grid>

        {/* Componente HandleLogo para manejar la imagen de perfil */}
        <HandleLogo
          urlLogo={profileImgUrl}
          setUrlLogo={setProfileImgUrl}
          textBtn={`${t('buttons.chooseLogo')} 1`}
          cloudinary_url={data?.profileImgUrl || null} // Usa la URL existente si ya tiene una imagen
        />

        <Button variant="contained" type="submit" disabled={mutation.isPending}>
          {t('buttons.edit')}
        </Button>
      </form>

      <Divider sx={{ my: 3 }} />
    </>
  );
};

const Settings = ({ nombreEmpresa }) => {
  const [t] = useTranslation('global');
  const { invalidate } = useInvalidate();
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ['settings', nombreEmpresa],
    queryFn: async () => await axios(`/settings/get-settings/${nombreEmpresa}`).then((res) => res.data),
  });

  const [selectValue, setSelectValue] = useState('');
  const [urlLogo, setUrlLogo] = useState(null);
  const [urlLogo2, setUrlLogo2] = useState(null);

  const mutation = useMutation({
    mutationFn: async (dataBody) => {
      if (data?._id) {
        return await axios
          .put(`/settings/edit-settings/${nombreEmpresa}/${data?._id}`, dataBody)
          .then((res) => res.data);
      }

      return await axios
        .post(`/settings/crear-settings/${nombreEmpresa}`, dataBody)
        .then((res) => res.data);
    },
    onSuccess: (data) => {
      invalidate(['settings']);
      enqueueSnackbar('Cambios Subidos', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  useEffect(() => {
    setSelectValue(data?.status || 'active');
  }, [isLoading]);

  if (isLoading) return <CircularProgress />;

  if (isError) return <p>{getError(error)}</p>;

  const handleSubmit = (e) => {
    e.preventDefault();
    const confirmUpload = confirm(t('messages.confirmChanges'));

    if (!confirmUpload) return;

    const dataForm = new FormData(e.target);

    if (urlLogo) {
      dataForm.append('uploadImages', imageUpload(urlLogo, 'large-l-ino24'));
    }

    if (urlLogo2) {
      dataForm.append('uploadImages', imageUpload(urlLogo2, 'small-l-ino24'));
    }

    mutation.mutate(dataForm);
  };

  return (
    <>
      <Typography variant={'h4'} sx={{ textTransform: 'capitalize' }} mb={2}>
        {t('title.setting')}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} mb={1}>
          <Grid xs={12} md={6}>
            <TextField
              label={t('inputLabel.address')}
              name="companyAddress"
              variant="standard"
              sx={{ width: '100%' }}
              defaultValue={data?.companyAddress}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              label={t('inputLabel.companyId')}
              name="companyId"
              variant="standard"
              sx={{ width: '100%' }}
              defaultValue={data?.companyId}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <TextField
              label={t('inputLabel.phone')}
              name="companyPhone"
              variant="standard"
              sx={{ width: '100%' }}
              defaultValue={data?.companyPhone}
            />
          </Grid>
        </Grid>
        {/* Agrega la imagen del logo */}
        <HandleLogo
          urlLogo={urlLogo}
          setUrlLogo={setUrlLogo}
          textBtn={`${t('buttons.chooseLogo')} 1`}
          cloudinary_url={data?.companyLogo || null}
        />
        {/* Agrega otra imagen de logo si es necesario */}
        <HandleLogo
          urlLogo={urlLogo2}
          setUrlLogo={setUrlLogo2}
          textBtn={`${t('buttons.chooseLogo')} 2`}
          cloudinary_url={data?.companyLogo2 || null}
        />
        <Button variant="contained" type="submit" disabled={mutation.isPending}>
          {t('buttons.edit')}
        </Button>
      </form>
    </>
  );
};

export default EmpresaEditPage;
