/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import ModalComponent from '../components/ModalComponent';
import TableComponent from '../components/TableComponent';

import {
  Box,
  Button,
  Container,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Unstable_Grid2';
import axios from 'axios';
import { CellActionEmployee } from '../components/CellActionComponents';
import { useInvalidate } from '../utils/Invalidate';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import SelectComponent from '../components/SelectComponent';
import { fixCentersArray } from '../utils/fixArray';
import ServicesBox from '../components/ServicesBox';
import { enqueueSnackbar } from 'notistack';
import { getError } from '../utils/getError';
import SpecialitiesBox from '../components/SpecialitiesBox';
import InputPhone from '../components/InputPhone';
import { eliminarPrimerosCharSiCoinciden } from '../utils/helpers';
import { phoneCountry } from '../utils/selectData';
import { imageUpload } from '../utils/helpers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export const EmpleadosContext = createContext();

const EmpleadosPage = () => {
  const { t } = useTranslation('global');
  const [open, setOpen] = useState(null);
  const { dataBase } = useParams();

  return (
    <EmpleadosContext.Provider value={{ open, setOpen }}>
      <Container>
        <Typography variant={'h2'} sx={{ textTransform: 'capitalize' }} mb={2}>
          {t('menu.employees')}
        </Typography>

        <Header dataBase={dataBase} />
        <TableBody dataBase={dataBase} />
      </Container>
    </EmpleadosContext.Provider>
  );
};

const Header = ({ dataBase }) => {
  const { t } = useTranslation('global');
  const { open, setOpen } = useContext(EmpleadosContext);
  const [selectedOption, setSelectedOption] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [center, setCenter] = useState('');
  const [profileImgUrl, setProfileImgUrl] = useState(null);

  const { invalidate } = useInvalidate();

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (open?._id) {
        return await axios.put(`/users/edit-employee/${dataBase}/${open._id}`, data);
      }
      return await axios.post(`/users/create-employee/${dataBase}/${center}`, data);
    },
    onSuccess: () => {
      invalidate(['empleados']);
      enqueueSnackbar('Acción lograda con éxito', { variant: 'success' });
      setOpen(false);
    },
    onError: (err) => {
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const services = selectedOption.map((item) => {
      const [serviceName, duration] = item.split(' - ');
      return { serviceName, duration };
    });

    const data = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.countryPhone?.value + e.target.phone.value,
      DNI: e.target.DNI.value,
      password: e.target.password?.value,
      isAvailable: e.target.isAvailable?.value,
      services,
      specialities,
      profileImgUrl: profileImgUrl ? await imageUpload(profileImgUrl[0], 'large-l-ino24') : open?.profileImgUrl,
    };

    if (!selectedOption.length || !services.length) {
      enqueueSnackbar('Todos los campos son requeridos', { variant: 'error' });
      return;
    }

    if (open?._id) {
      delete data.password;
      delete data.DNI;
    }

    mutation.mutate(data);
  };

  useEffect(() => {
    if (open?.services) {
      setSelectedOption(open.services.map((item) => `${item.serviceName} - ${item.duration}`));
    }
    if (open?.specialities) {
      setSpecialities(open.specialities);
    }
  }, [open]);

  return (
    <Box component="header" mb={5}>
      <Button variant="outlined" onClick={() => setOpen(true)} startIcon={<AddIcon />}>
        {t('buttons.create')}
      </Button>
      <ModalComponent open={!!open} setOpen={setOpen}>
        <form onSubmit={handleSubmit}>
          <Typography mt={3} variant="h4" sx={{ textTransform: 'capitalize' }}>
            {t('menu.employees')}
          </Typography>

          <Grid container spacing={5}>
            <Grid xs={12}>
              <ServicesBox setSelectedOption={setSelectedOption} selectedOption={selectedOption} disabled={mutation.isPending} />
            </Grid>
            <Grid xs={12}>
              <SpecialitiesBox selectedOption={specialities} setSelectedOption={setSpecialities} disabled={mutation.isPending} />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label={t('inputLabel.name')} variant="standard" fullWidth name="name" defaultValue={open?.name || ''} required />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label={t('inputLabel.email')} type="email" variant="standard" fullWidth name="email" defaultValue={open?.email || ''} required />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label={t('inputLabel.dni')} name="DNI" variant="standard" fullWidth defaultValue={open?.DNI || ''} disabled={!!open?._id} required />
            </Grid>
            {!open?._id && (
              <Grid xs={12} md={6}>
                <TextField label={t('inputLabel.password')} type="password" variant="standard" fullWidth name="password" required />
              </Grid>
            )}
            <InputPhone nameCountry="countryPhone" defaultValue={eliminarPrimerosCharSiCoinciden(open?.phone ?? '', phoneCountry)} />
            <Grid xs={12} md={6}>
              <SelectComponent fixArrayFn={fixCentersArray} params={`users/get-all-centers/${dataBase}`} label={t('title.center')} onChange={(e) => setCenter(e.target.value)} value={center} />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label={t('inputLabel.isAvailable')} name="isAvailable" variant="standard" fullWidth select defaultValue={open?.isAvailable || 'yes'}>
                <MenuItem value="yes">{t('messages.yes')}</MenuItem>
                <MenuItem value="no">{t('messages.no')}</MenuItem>
              </TextField>
            </Grid>
            <Box xs={12} display="flex" gap={5} mt={3}>
              <HandleLogo profileImgUrl={profileImgUrl} setProfileImgUrl={setProfileImgUrl} textBtn={t('buttons.chooseLogo')} cloudinary_url={open?.profileImgUrl || null} />
            </Box>
          </Grid>
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 5 }} disabled={mutation.isPending}>
            {open?._id ? t('buttons.edit') : t('buttons.create')}
          </Button>
        </form>
      </ModalComponent>
    </Box>
  );
};

const TableBody = ({ dataBase }) => {
  const { t } = useTranslation('global');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['empleados'],
    queryFn: async () => {
      const { data } = await axios.get(`/users/get-employees/${dataBase}`);
      return data;
    },
  });

  if (isLoading) return <Skeleton variant="rounded" width="100%" height={60} sx={{ my: 2 }} />;
  if (isError) return <Typography textAlign="center" variant="h3">{t('error.noEmployees')}</Typography>;

  return (
    <TableComponent
      rows={data}
      columns={[
        { key: 'name', header: 'Nombre' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Teléfono' },
        { key: 'DNI', header: 'DNI' },
        { key: 'isAvailable', header: 'Disponible' },
        { key: 'actions', header: 'Acciones', render: (row) => <CellActionEmployee nombreEmpresa={dataBase} info={row.original} /> },
      ]}
    />
  );
};

const HandleLogo = ({ profileImgUrl, setProfileImgUrl, textBtn, cloudinary_url }) => {
  return (
    <Box display="flex" flexDirection="column" gap={1} width="100%">
      <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />}>
        {textBtn}
        <input type="file" accept="image/*" hidden onChange={(e) => setProfileImgUrl(e.target.files)} />
      </Button>
      {(profileImgUrl || cloudinary_url) && <img src={profileImgUrl ? URL.createObjectURL(profileImgUrl[0]) : cloudinary_url} alt="preview" style={{ maxHeight: '100px' }} />}
    </Box>
  );
};

export default EmpleadosPage;
