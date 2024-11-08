/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from 'react';
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
  const [t] = useTranslation('global');
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
  const [t] = useTranslation('global');
  const { open, setOpen } = useContext(EmpleadosContext);
  const [selectedOption, setSelectedOption] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [center, setCenter] = useState('');
  const [profileImgUrl, setProfileImgUrl] = useState(null);

  const centerId = open?.centerInfo?._id;
  const { invalidate } = useInvalidate();

  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (open?._id) {
        return await axios
          .put(`/users/edit-employee/${dataBase}/${open?._id}`, formData)
          .then((response) => response.data);
      }

      return await axios
        .post(`/users/create-employee/${dataBase}/${center}`, formData)
        .then((response) => response.data);
    },
    onSuccess: () => {
      invalidate(['empleados']);
      enqueueSnackbar('Acción realizada con éxito', { variant: 'success' });
      setOpen(false);
    },
    onError: (err) => {
      console.log(err);
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
      phone: e.target?.countryPhone?.value
        ? e.target?.countryPhone?.value + e.target.phone.value
        : e.target?.phone?.value,
      DNI: e.target.DNI.value,
      password: e.target?.password?.value,
      isAvailable: e.target?.isAvailable?.value,
      services,
      specialities,
    };

    if (!selectedOption.length || !services.length) {
      enqueueSnackbar('Todos los campos son requeridos', { variant: 'error' });
      return;
    }

    if (open?._id) {
      delete data.password;
      delete data.DNI;
    }

    try {
      let profileImgUrlData = null;
      if (profileImgUrl) {
        profileImgUrlData = await imageUpload(profileImgUrl, 'large-l-ino24');
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('DNI', data.DNI);
      formData.append('password', data.password || '');
      formData.append('isAvailable', data.isAvailable);
      formData.append('services', JSON.stringify(services));
      formData.append('specialities', JSON.stringify(specialities));

      if (profileImgUrlData) {
        formData.append('profileImgUrl', profileImgUrlData);
      } else if (profileImgUrl) {
        formData.append('profileImage', profileImgUrl[0]);
      }

      mutation.mutate(formData);
    } catch (error) {
      console.error('Error al manejar la imagen:', error);
      enqueueSnackbar('Error al subir la imagen', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (open?.services) {
      setSelectedOption(
        open?.services.map((item) => `${item.serviceName} - ${item.duration}`)
      );
    }

    if (open?.specialities) {
      setSpecialities(open?.specialities);
    }
  }, [open]);

  return (
    <Box component={'header'} mb={5}>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        startIcon={<AddIcon />}
      >
        {t('buttons.create')}
      </Button>
      <ModalComponent
        open={!!open}
        setOpen={setOpen}
        onClose={() => setSelectedOption([])}
      >
        <form action="" onSubmit={handleSubmit}>
          <Typography mt={3} variant="h4" sx={{ textTransform: 'capitalize' }}>
            {t('menu.employees')}
          </Typography>

          <Grid container spacing={5}>
            <Grid xs={12}>
              <ServicesBox
                setSelectedOption={setSelectedOption}
                selectedOption={selectedOption}
                disabled={mutation.isPending}
              />
            </Grid>
            <Grid xs={12}>
              <SpecialitiesBox
                selectedOption={specialities}
                setSelectedOption={setSpecialities}
                disabled={mutation.isPending}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.name')}
                variant="standard"
                sx={{ width: '100%' }}
                name="name"
                disabled={mutation.isPending}
                defaultValue={open?.name || ''}
                required
              />
            </Grid>

            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.email')}
                name="email"
                type="email"
                defaultValue={open?.email || ''}
                required
                variant="standard"
                sx={{ width: '100%' }}
                disabled={mutation.isPending}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.dni')}
                name="DNI"
                type="text"
                defaultValue={open?.DNI || ''}
                variant="standard"
                sx={{ width: '100%' }}
                required
                disabled={!!open?._id || mutation.isPending}
              />
            </Grid>

            {!open?._id && (
              <Grid xs={12} md={6}>
                <TextField
                  label={t('inputLabel.password')}
                  type="password"
                  variant="standard"
                  sx={{ width: '100%' }}
                  name="password"
                  defaultValue={open?.password || ''}
                  disabled={mutation.isPending}
                  required
                />
              </Grid>
            )}

            <InputPhone
              nameCountry={'countryPhone'}
              disabled={mutation.isPending}
              defaultValue={eliminarPrimerosCharSiCoinciden(
                open?.phone ?? '',
                phoneCountry
              )}
            />

            <Grid xs={12} md={6}>
              <SelectComponent
                fixArrayFn={fixCentersArray}
                params={`users/get-all-centers/${dataBase}`}
                label={t('title.center')}
                required={true}
                aditionalProperties={{
                  onChange: (e) => setCenter(e.target.value),
                  value: center || centerId || '',
                }}
                disabled={mutation.isPending}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.isAvailable')}
                name="isAvailable"
                variant="standard"
                fullWidth
                disabled={mutation.isPending}
                select
                defaultValue={open?.isAvailable || 'yes'}
              >
                <MenuItem value={'yes'}>{t('messages.yes')}</MenuItem>
                <MenuItem value={'no'}>{t('messages.no')}</MenuItem>
              </TextField>
            </Grid>

            <Grid xs={12}>
              <label htmlFor="profileImg" style={{ cursor: 'pointer' }}>
                <CloudUploadIcon />
                <input
                  type="file"
                  id="profileImg"
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={(e) => setProfileImgUrl(e.target.files)}
                />
                {profileImgUrl ? (
                  <span> {profileImgUrl[0]?.name} </span>
                ) : (
                  <span> {t('inputLabel.uploadProfileImage')} </span>
                )}
              </label>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? t('loading') : t('buttons.submit')}
            </Button>
          </Box>
        </form>
      </ModalComponent>
    </Box>
  );
};

const TableBody = ({ dataBase }) => {
  const { open, setOpen } = useContext(EmpleadosContext);

  const { data, isLoading } = useQuery({
    queryKey: ['empleados'],
    queryFn: async () =>
      await axios
        .get(`/users/get-all-employees/${dataBase}`)
        .then((response) => response.data),
  });

  return (
    <TableComponent
      isLoading={isLoading}
      rows={data}
      rowActions={(params) => <CellActionEmployee {...params} />}
    />
  );
};

export default EmpleadosPage;
