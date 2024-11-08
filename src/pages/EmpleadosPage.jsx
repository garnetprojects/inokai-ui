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
        <Typography variant="h2" sx={{ textTransform: 'capitalize' }} mb={2}>
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
    mutationFn: async (data) => {
      const url = open?._id
        ? `/users/edit-employee/${dataBase}/${open?._id}`
        : `/users/create-employee/${dataBase}/${center}`;
      const method = open?._id ? 'put' : 'post';

      return await axios({ method, url, data }).then((response) => response.data);
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

  const handleSubmit = (e) => {
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

    if (profileImgUrl) {
      data.profileImgUrl = imageUpload(profileImgUrl, 'large-l-ino24');
    }

    mutation.mutate(data);
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
    <Box component="header" mb={5}>
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
        <form onSubmit={handleSubmit}>
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
                defaultValue={open?.name || ''}
                required
                disabled={mutation.isPending}
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
                  required
                  defaultValue={open?.password || ''}
                  disabled={mutation.isPending}
                />
              </Grid>
            )}
            <InputPhone
              nameCountry="countryPhone"
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
                required
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
                <MenuItem value="yes">{t('messages.yes')}</MenuItem>
                <MenuItem value="no">{t('messages.no')}</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Box xs={12} display="flex" gap={5} mt={3}>
            <HandleLogo
              profileImgUrl={profileImgUrl}
              setProfileImgUrl={setProfileImgUrl}
              textBtn={`${t('buttons.chooseLogo')}`}
              cloudinary_url={open?.profileImgUrl || null}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            sx={{ width: '100%', mt: 5 }}
            disabled={mutation.isPending}
          >
            {open?._id ? t('buttons.edit') : t('buttons.create')}
          </Button>
        </form>
      </ModalComponent>
    </Box>
  );
};

const HandleLogo = ({ profile
