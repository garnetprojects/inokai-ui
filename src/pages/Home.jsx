/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@mui/material';

import { useInvalidate } from '../utils/Invalidate';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Unstable_Grid2';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import ModalComponent from '../components/ModalComponent';
import SelectComponent from '../components/SelectComponent';
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from '@mui/x-date-pickers';
import { Navigate, useParams } from 'react-router-dom';
import { fixCentersArray, fixUserArray } from '../utils/fixArray';
import Calendar from '../components/Calendar';
import {
  defaultTime,
  eliminarPrimerosCharSiCoinciden,
  fechaEnTiempoPresente,
  formatDate,
  formatDatePicker,
  formatDateToMongo,
  returnHour,
} from '../utils/helpers';
import { useSnackbar } from 'notistack';
import { getError } from '../utils/getError';
import dayjs from 'dayjs';
import { UserContext } from '../context/UserProvider';
import ServicesBox from '../components/ServicesBox';

import 'dayjs/locale/es';
import 'dayjs/locale/en';
import SearchModal from '../components/SearchModal';
import LocationProvider from '../components/LocationProvider';
import InputPhone from '../components/InputPhone';
import { phoneCountry } from '../utils/selectData';

const Home = () => {
  const [filterDate, setFilterDate] = useState('');
  const [filterCenter, setFilterCenter] = useState('');
  const { dataBase } = useParams();
  const [open, setOpen] = useState(null);

  const appointmentQuery = useQuery({
    queryKey: ['appointments', filterDate, filterCenter],
    queryFn: async () =>
      await axios(`/appointment/get-all-appointments/${dataBase}`, {
        params: {
          filterDate: filterDate || formatDate(),
          filterCenter,
        },
      }).then((req) => req.data),
  });
  const [t] = useTranslation('global');

  if (dataBase === 'ownerAdmin')
    return <Navigate to={`/${dataBase || ''}/empresas`} />;

  // if (appointmentQuery.isLoading) return <p>Cargando</p>;

  if (appointmentQuery.isError) return <p>Ocurrio algo</p>;

  console.log(appointmentQuery.data);

  return (
    <Box>
      <Container maxWidth="xl">
        <Box
          display={'flex'}
          alignItems={'start'}
          justifyContent={'space-between'}
        >
          <Box>
            <Typography
              variant={'h2'}
              sx={{ textTransform: 'capitalize' }}
              mb={2}
            >
              {t('title.calender')}
            </Typography>
            <Header
              appointmentData={appointmentQuery.data}
              dataBase={dataBase}
              open={open}
              setOpen={setOpen}
              filterCenter={filterCenter}
              setFilterCenter={setFilterCenter}
            />
          </Box>
          <LocationProvider>
            {/* <StaticDatePicker
              onAccept={(data) => setFilterDate(formatDate(data.$d))}
            /> */}

            <DatePicker
              onChange={(data) => setFilterDate(formatDate(data.$d))}
              name="date"
              required
              on
              // format={formatDatePicker}
              // disabled={mutation.isPending || canEdit}
            />
          </LocationProvider>
        </Box>
      </Container>

      <Container
        sx={{
          width: '98vw',
        }}
        maxWidth="xl"
      >
        {appointmentQuery.isFetching && <CircularProgress />}

        {!appointmentQuery.isFetching && (
          <Calendar
            data={appointmentQuery.data}
            setOpen={setOpen}
            selectedDate={filterDate}
          />
        )}
      </Container>
    </Box>
  );
};

const Header = ({
  dataBase,
  open,
  setOpen,
  setFilterCenter,
  filterCenter,
  appointmentData,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { invalidate } = useInvalidate();
  const [user, setUser] = useState('');
  const [selectedOption, setSelectedOption] = useState([]);
  const [t, i18] = useTranslation('global');
  const {
    state: { userInfo },
  } = useContext(UserContext);

  const canEdit = !fechaEnTiempoPresente(open?.date, open?.initTime);

  console.log(canEdit);

  const mutation = useMutation({
    mutationFn: async (data) => {
      // if (data === 'delete') {
      //   return await axios
      //     .delete(`/appointment/delete-appointment/${dataBase}/${open?._id}`)
      //     .then((res) => res.data);
      // }

      if (data === 'cancel') {
        return await axios
          .delete(`/appointment/cancel-appointment/${dataBase}/${open?._id}`)
          .then((res) => res.data);
      }

      if (open?._id) {
        return await axios
          .put(`/appointment/edit-appointment/${dataBase}/${open?._id}`, data)
          .then((res) => res.data);
      }

      return await axios
        .post(`/appointment/create-appointment/${dataBase}/${user}`, data)
        .then((res) => res.data);
    },
    onSuccess: (data) => {
      console.log(data);
      invalidate(['appointments']);
      setSelectedOption([]);
      setOpen(null);
      enqueueSnackbar(data.message, { variant: 'success' });
    },

    onError: (err) => {
      console.log(err);
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(user);

    const services = selectedOption.map((item) => {
      const [serviceName, duration] = item.split(' - ');

      return { serviceName, duration };
    });

    const data = {
      clientName: e.target?.clientName?.value,
      clientPhone: e.target.countryPhone.value
        ? e.target.countryPhone.value + e.target?.clientPhone?.value
        : e.target?.clientPhone?.value,
      initTime: e.target?.initTime?.value,
      finalTime: e.target?.finalTime?.value,
      remarks: e.target?.remarks.value,
      date:
        i18.language === 'en'
          ? e.target?.date?.value
          : formatDateToMongo(e.target?.date?.value, 'MM/DD/YY'),
      services,
    };

    if (open?._id) {
      data.userInfo = user;
    }

    console.log(data);
    // return;

    if (
      [
        data.clientName,
        data.clientPhone,
        data.initTime,
        data.finalTime,
        data.date,
      ].includes('') ||
      !selectedOption.length ||
      !services.length
    ) {
      enqueueSnackbar('Todos campos requeridos', { variant: 'error' });
      return;
    }

    console.log(returnHour(data.initTime));

    if (returnHour(data.initTime) < 9 || returnHour(data.initTime) > 22) {
      return enqueueSnackbar(
        'No puedes crear una horario de inicio antes de 9:00 o despues de 22:00',
        { variant: 'error' }
      );
    }

    if (returnHour(data.finalTime) < 9 || returnHour(data.finalTime) > 22) {
      return enqueueSnackbar(
        'No puedes crear una horario de fin antes de 9:00 o despues de 22:00',
        { variant: 'error' }
      );
    }

    if (!validarHorario(data.initTime, data.finalTime)) {
      return enqueueSnackbar('Hora fin no puede ser antes de hora inicio', {
        variant: 'error',
      });
    }

    console.log('llego aqui');
    // return;
    // return
    mutation.mutate(data);
  };

  function validarHorario(horaInicio, horaFin) {
    // Crear objetos de fecha para la hora de inicio y la hora de fin
    const fechaInicio = new Date('2024-04-26 ' + horaInicio);
    const fechaFin = new Date('2024-04-26 ' + horaFin);

    // Comparar las fechas
    if (fechaFin > fechaInicio) {
      return true;
    } else {
      return false;
    }
  }

  const handleCancel = () => {
    const confirmCancel = confirm(t('messages.cancelAppointment'));

    if (!confirmCancel) return;

    mutation.mutate('cancel');
  };

  useEffect(() => {
    if (open?.userInfo?._id) {
      setUser(open?.userInfo?._id);
    }

    if (open?.services) {
      setSelectedOption(
        open?.services.map((item) => `${item.serviceName} - ${item.duration}`)
      );
    }
  }, [open]);

  console.log(appointmentData, 'datos');

  return (
    <Box component={'header'}>
      <Box gap={2} mb={2}>
        {userInfo.role === 'admin' && (
          <Box mb={2}>
            <SelectComponent
              fixArrayFn={fixCentersArray}
              params={`users/get-all-centers/${dataBase}`}
              label={t('title.center')}
              required={true}
              aditionalProperties={{
                onChange: (e) => setFilterCenter(e.target.value),
                sx: { maxWidth: '300px' },
                value: filterCenter,
              }}
              disabled={mutation.isPending || canEdit}
            />
          </Box>
        )}

        {userInfo.role !== 'admin' && (
          <Button
            variant="outlined"
            onClick={() => setOpen(true)}
            startIcon={<AddIcon />}
            style={{ margin: '7px' }} // Añadir el margen aquí
          >
            {t('buttons.create')}
          </Button>
        )}

        <SearchModal />
      </Box>

      <ModalComponent
        onClose={() => {
          setSelectedOption([]);
          setOpen(null);
        }}
        open={!!open}
        setOpen={setOpen}
      >
        <form action="" onSubmit={handleSubmit}>
          <Typography mt={3} variant="h4" textTransform={'capitalize'}>
            {t('title.appointment')}
          </Typography>

          <Grid container spacing={5}>
            <Grid xs={12}>
              <ServicesBox
                setSelectedOption={setSelectedOption}
                selectedOption={selectedOption}
                disabled={mutation.isPending || canEdit}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.clientName')}
                required
                variant="standard"
                name="clientName"
                sx={{ width: '100%' }}
                disabled={mutation.isPending || canEdit}
                defaultValue={open?.clientName}
              />
            </Grid>

            {/* <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.clientPhone')}
                name="clientPhone"
                required
                variant="standard"
                sx={{ width: '100%' }}
                disabled={mutation.isPending || canEdit}
                defaultValue={open?.clientPhone}
              />
            </Grid> */}

            <InputPhone
              namePhone="clientPhone"
              nameCountry={'countryPhone'}
              defaultValue={eliminarPrimerosCharSiCoinciden(
                open?.clientPhone ?? '',
                phoneCountry
              )}
              disabled={mutation.isPending || canEdit}
            />
          </Grid>

          <Grid container spacing={5}>
            <Grid xs={12} md={6}>
              <SelectComponent
                appointmentData={appointmentData?.appointments2}
                disabled={mutation.isPending || canEdit}
                fixArrayFn={fixUserArray}
                params={`appointment/get-all-employees/${dataBase}`}
                label={t('menu.employees')}
                required={true}
                aditionalProperties={{
                  onChange: (e) => setUser(e.target.value),
                  value: user,
                  name: 'userInfo',
                }}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <LocationProvider>
                <DatePicker
                  sx={{ width: '100%' }}
                  name="date"
                  required
                  disabled={mutation.isPending || canEdit}
                  defaultValue={open?.date && dayjs(open?.date)}
                  // format={formatDatePicker}
                />
              </LocationProvider>
            </Grid>
            <Grid xs={6}>
              <LocationProvider>
                <TimePicker
                  label={t('inputLabel.initTime')}
                  sx={{ width: '100%' }}
                  name="initTime"
                  required
                  defaultValue={
                    open?.initTime && dayjs(defaultTime(open?.initTime))
                  }
                  ampm={false}
                  disabled={mutation.isPending || canEdit}
                />
              </LocationProvider>
            </Grid>
            <Grid xs={6}>
              <LocationProvider>
                <TimePicker
                  label={t('inputLabel.endTime')}
                  sx={{ width: '100%' }}
                  required
                  name="finalTime"
                  defaultValue={
                    open?.finalTime && dayjs(defaultTime(open?.finalTime))
                  }
                  ampm={false}
                  disabled={mutation.isPending || canEdit}
                />
              </LocationProvider>
            </Grid>

            <Grid xs={12}>
              <TextField
                label={t('inputLabel.remarks')}
                name="remarks"
                variant="standard"
                defaultValue={open?.remarks || ''}
                sx={{ width: '100%' }}
                disabled={mutation.isPending || canEdit}
                multiline
                fullWidth
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending || canEdit}
            sx={{ width: '100%', mt: 5 }}
          >
            {open?._id ? t('buttons.edit') : t('buttons.create')}
          </Button>

          {open?._id && (
            <Button
              variant="contained"
              color="error"
              disabled={mutation.isPending}
              sx={{ width: '100%', mt: 3 }}
              onClick={handleCancel}
            >
              {t('buttons.cancelAppointment')}
            </Button>
          )}
        </form>
      </ModalComponent>
    </Box>
  );
};

export default Home;