import { SearchOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useContext, useState } from 'react';
import ModalComponent from './ModalComponent';
import SelectComponent from './SelectComponent';
import { fixCentersArray } from '../utils/fixArray';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserProvider';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const SearchModal = ({ setSelectedDate, setOpenEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterCenter, setFilterCenter] = useState('');
  const [isAllCenters, setIsAllCenters] = useState(false); // Nuevo estado para el checkbox
  const [highlightedAppointment, setHighlightedAppointment] = useState(null); // Nuevo estado para la cita resaltada

  const [searchParams, setSearchParams] = useSearchParams();
  const { dataBase } = useParams();
  const [t, i18] = useTranslation('global');
  const { state } = useContext(UserContext);
  const centerInfo = state.userInfo.centerId;

  const mutate = useMutation({
    mutationFn: (params) =>
      axios(`/appointment/filter/${dataBase}`, { params }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = {
      clientName: e.target.name.value,
      clientPhone: e.target.phone.value,
      centerInfo: isAllCenters ? '' : centerInfo, // Ignora el centro si isAllCenters está activo
    };

    mutate.mutate(params);
  };

  const handleSelectAppointment = (appointment) => {
    setIsOpen(false);
    // setOpenEdit(appointment);
    console.log(appointment);
    setSearchParams({
      filterDate: appointment.date,
      appointmentID: appointment._id,
      centerID: appointment.centerInfo,
    });
  };

  const handleMouseEnter = (appointment) => {
    setHighlightedAppointment(appointment); // Resaltar cita al pasar el mouse
  };

  const handleMouseLeave = () => {
    setHighlightedAppointment(null); // Quitar resaltado al salir del mouse
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<SearchOutlined />}
        onClick={() => setIsOpen(true)}
      >
        Buscar
      </Button>

      <ModalComponent open={isOpen} setOpen={setIsOpen}>
        <Box component={'form'} pt={5} onSubmit={handleSubmit}>
          <Box display={'flex'} gap={2}>
            {state.userInfo.role === 'admin' && (
              <SelectComponent
                fixArrayFn={fixCentersArray}
                params={`users/get-all-centers/${dataBase}`}
                label={t('title.center')}
                required={!isAllCenters} // Deshabilita si el checkbox está activo
                disabled={mutate.isPending || isAllCenters}
                maxWidth={'250px'}
                aditionalProperties={{
                  onChange: (e) => setFilterCenter(e.target.value),
                  value: filterCenter,
                }}
              />
            )}
            <TextField
              id="outlined-basic"
              label="Nombre de cliente"
              variant="filled"
              disabled={mutate.isPending}
              name="name"
            />
            <TextField
              id="outlined-basic"
              label="Telefono"
              variant="filled"
              disabled={mutate.isPending}
              name="phone"
            />

            {/* Checkbox para TODOS LOS CENTROS */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAllCenters}
                  onChange={() => setIsAllCenters(!isAllCenters)}
                  color="primary"
                />
              }
              label="TODOS LOS CENTROS"
            />

            <Box>
              <IconButton
                aria-label="delete"
                size="large"
                type="submit"
                disabled={mutate.isPending}
              >
                <SearchOutlined fontSize="inherit" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Box maxHeight={500} overflow={'auto'} mt={2}>
          {mutate.isPending && <CircularProgress />}

          {mutate.data &&
            mutate.data?.data.map((item) => (
              <Box
                key={item._id}
                onClick={() => handleSelectAppointment(item)}
                onMouseEnter={() => handleMouseEnter(item)} // Resalta al pasar el mouse
                onMouseLeave={handleMouseLeave} // Quita el resaltado al salir
                style={{
                  cursor: 'pointer',
                  backgroundColor:
                    highlightedAppointment?._id === item._id
                      ? 'rgba(0, 0, 255, 0.1)' // Color de fondo para el resaltado
                      : 'transparent',
                }}
              >
                <CardContent>
                  <Typography gutterBottom component="div">
                    Nombre: {item.clientName}
                  </Typography>
                  <Typography gutterBottom component="div">
                    Telefono: {item.clientPhone}
                  </Typography>
                  <Typography gutterBottom component="div">
                    Fecha: {item.date}
                  </Typography>
                  <Typography gutterBottom component="div">
                    Hora: {item.initTime} - {item.finalTime}
                  </Typography>
                  <Typography gutterBottom component="div">
                    Observaciones: {item.remarks}
                  </Typography>

                  <Typography gutterBottom component="div">
                    Servicios:
                  </Typography>
                  <Box ml={1}>
                    {item.services.map((service) => (
                      <Chip
                        label={`${service.serviceName} - ${service.duration}`}
                        key={service.serviceName}
                      />
                    ))}
                  </Box>
                </CardContent>
                <Divider />
              </Box>
            ))}
        </Box>
      </ModalComponent>
    </>
  );
};

export default SearchModal;
