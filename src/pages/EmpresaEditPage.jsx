/* eslint-disable react/prop-types */
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { getError } from '../utils/getError';
import TableComponent from '../components/TableComponent';
import { CellActionCenter } from '../components/CellActionComponents';
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

const EmpresaEditPage = () => {
  const { nombreEmpresa } = useParams();
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ['empresa', nombreEmpresa],
    queryFn: async () =>
      await axios(`/users/get-empresa/${nombreEmpresa}`).then(
        (res) => res.data
      ),
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

  console.log(data);

  return (
    <Container>
      <Header data={data} nombreEmpresa={nombreEmpresa} />

      <Settings nombreEmpresa={nombreEmpresa} />

      <Centers data={data.centers} centerToEdit={{ nombreEmpresa }} />
    </Container>
  );
};

const Header = ({ data, nombreEmpresa }) => {
  const [t] = useTranslation('global');

  const { invalidate } = useInvalidate();

  const mutation = useMutation({
    mutationFn: async (dataUpd) =>
      await axios
        .put(`/users/edit-admin/${nombreEmpresa}/${data.users._id}`, dataUpd)
        .then((response) => response.data),
    onSuccess: (data) => {
      console.log(data);
      invalidate(['empresa', nombreEmpresa]);
      enqueueSnackbar('Se edito con exito', { variant: 'success' });
    },
    onError: (err) => {
      console.log(err);
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  console.log(data)

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataupd = {
      name: e.target.name.value,
      // password: e.target.password.value,
      email: e.target.email.value,
      DNI: e.target.DNI.value,
    };

    mutation.mutate(dataupd);
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
              disabled={mutation.isPending}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <TextField
              label={t('inputLabel.email')}
              name="email"
              type="email"
              variant="standard"
              defaultValue={data.users.email}
              disabled={mutation.isPending}
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
              disabled={mutation.isPending}
              sx={{ width: '100%' }}
            />
          </Grid>

          {/* <Grid xs={12} md={6}>
            <TextField
              label={t('inputLabel.password')}
              name="password"
              type="password"
              variant="standard"
              defaultValue={data.users.password}
              disabled={mutation.isPending}
              required
              sx={{ width: '100%' }}
            />
          </Grid> */}
        </Grid>

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
    queryFn: async () =>
      await axios(`/settings/get-settings/${nombreEmpresa}`).then(
        (res) => res.data
      ),
  });

  const [selectValue, setSelectValue] = useState('');
  const [urlLogo, setUrlLogo] = useState('');

  console.log(selectValue);

  const mutation = useMutation({
    mutationFn: async (dataBody) => {
      if (data?._id) {
        return await axios
          .put(
            `/settings/edit-settings/${nombreEmpresa}/${data?._id}`,
            dataBody
          )
          .then((res) => res.data);
      }

      return await axios
        .post(`/settings/crear-settings/${nombreEmpresa}`, dataBody)
        .then((res) => res.data);
    },
    onSuccess: (data) => {
      console.log(data, 'succed');
      invalidate(['settings']);
      enqueueSnackbar('Cambios Subidos', { variant: 'success' });
    },
    onError: (err) => {
      console.log(err);
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  useEffect(() => {
    setSelectValue(data?.status || 'active');
    setUrlLogo(data?.logo[0]?.cloudinary_url || '');
  }, [isLoading]);

  if (isLoading) return <CircularProgress />;

  if (isError) return <p>{getError(error)}</p>;

  console.log(data);
  const handleSubmit = (e) => {
    e.preventDefault();
    const confirmUpload = confirm(t('messages.confirmChanges'));

    if (!confirmUpload) return;

    const dataForm = new FormData(e.target);

    console.log('Ayuda');
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
              label={t('inputLabel.primaryColor')}
              name="primaryColor"
              type="color"
              variant="standard"
              required
              sx={{ width: '100%' }}
              defaultValue={data?.primaryColor || ''}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <SelectNoFetchComponent
              label={t('inputLabel.status')}
              required={true}
              aditionalProperties={{
                value: selectValue || '',
                name: 'status',
                onChange: (e) => setSelectValue(e.target.value),
              }}
              disabled={mutation.isPending}
              data={[
                {
                  value: 'active',
                  text: t('inputOptions.active'),
                },
                {
                  value: 'suspended',
                  text: t('inputOptions.suspend'),
                },
              ]}
            />
          </Grid>

          <Grid xs={12}>
            <Box mb={2}>
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
              >
                {t('buttons.chooseLogo')}

                <input
                  type="file"
                  hidden
                  name="uploadImages"
                  onChange={(e) =>
                    setUrlLogo(URL.createObjectURL(e.target.files[0]))
                  }
                />
              </Button>
            </Box>

            {urlLogo && (
              <>
                <Typography>{t('messages.logoPreview')}</Typography>

                <img
                  src={urlLogo}
                  alt="Logo"
                  decoding="async"
                  height={130}
                  width={250}
                />
                <img src={urlLogo} height={70} width={150} />
              </>
            )}
          </Grid>
        </Grid>

        <Button
          variant="contained"
          type="submit"
          disabled={mutation?.isPending}
        >
          {t('buttons.uploadSettings')}
        </Button>
      </form>

      <Divider sx={{ my: 3 }} />
    </>
  );
};

const Centers = ({ data, centerToEdit }) => {
  const [t] = useTranslation('global');
  const [open, setOpen] = useState(null);
  const { invalidate } = useInvalidate();

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (open._id) {
        await axios
          .put(
            `/users/edit-center/${centerToEdit.nombreEmpresa}/${open._id}`,
            data
          )
          .then((response) => response.data);
      } else {
        await axios
          .post(`/users/create-center/${centerToEdit.nombreEmpresa}`, data)
          .then((response) => response.data);
      }
    },

    onSuccess: (data) => {
      console.log(data);

      invalidate(['empresa', centerToEdit.nombreEmpresa]);

      enqueueSnackbar('Se logro con exito', { variant: 'success' });
      setOpen(null);
    },
    onError: (err) => {
      console.log(err);
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  const columns = [
    {
      header: t('inputLabel.name'),
      accessorKey: 'centerName',
    },
    {
      header: t('inputLabel.address'),
      accessorKey: 'address',
    },
    {
      header: t('inputLabel.action'),
      cell: (info) => (
        <CellActionCenter
          info={info.row.original}
          setOpen={setOpen}
          nombreEmpresa={centerToEdit.nombreEmpresa}
        />
      ),
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      centerName: e.target.centerName.value,
      address: e.target.address.value,
    };

    mutation.mutate(data);
  };

  return (
    <>
      <Typography variant={'h4'} sx={{ textTransform: 'capitalize' }} mb={2}>
        {t('title.center')}s{' '}
        <IconButton
          variant="contained"
          onClick={() => setOpen(true)}
          // disabled={mutation.isPending}
        >
          <AddIcon />
        </IconButton>
      </Typography>

      <ModalComponent open={!!open} setOpen={setOpen}>
        <form action="" onSubmit={handleSubmit}>
          <Typography mt={3} variant="h4">
            Centros
          </Typography>

          {/* <Grid container spacing={5}> */}
          <Grid container spacing={5}>
            <Grid xs={12} md={6}>
              <TextField
                label="Nombre de centro"
                name={`centerName`}
                required
                variant="standard"
                sx={{ width: '100%' }}
                defaultValue={open?.centerName || ''}
                // disabled={mutation.isPending}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Direccion"
                name={`address`}
                type="text"
                required
                variant="standard"
                sx={{ width: '100%' }}
                defaultValue={open?.address || ''}

                // disabled={mutation.isPending}
              />
            </Grid>
          </Grid>
          {/* </Grid> */}

          <Button
            type="submit"
            variant="contained"
            sx={{ width: '100%', mt: 2 }}
            disabled={mutation.isPending}
          >
            Crear
          </Button>
        </form>
      </ModalComponent>

      <TableComponent data={data} columns={columns} />
    </>
  );
};

export default EmpresaEditPage;
