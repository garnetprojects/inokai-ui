import { Box, Chip, CircularProgress, Typography, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getError } from '../utils/getError';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const ServicesBox = ({ disabled, setSelectedOption, selectedOption }) => {
  const { dataBase } = useParams();
  const [t] = useTranslation('global');
  const [searchTerm, setSearchTerm] = useState(''); // Estado para la barra de búsqueda

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: () => axios(`/appointment/get-services/${dataBase}`),
  });

  const handleDelete = (name) => {
    setSelectedOption((prev) => prev.filter((item) => item !== name));
  };

  const handleSelectedOption = (data) => {
    if (selectedOption.findIndex((item) => item === data) === -1) {
      return setSelectedOption((prev) => [...prev, data]);
    }
    handleDelete(data);
  };

  const services = servicesQuery.data?.data || [];

  // Filtrar servicios por el término de búsqueda
  const filteredServices = services.filter((service) =>
    `${service.serviceName} - ${service.duration}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Ordenar los servicios: los seleccionados primero
  const sortedServices = [
    ...filteredServices.filter((service) =>
      selectedOption.includes(`${service.serviceName} - ${service.duration}`)
    ), // Seleccionados primero
    ...filteredServices.filter(
      (service) =>
        !selectedOption.includes(`${service.serviceName} - ${service.duration}`)
    ), // No seleccionados después
  ];

  return (
    <Box>
      {servicesQuery.isLoading && <CircularProgress size={20} />}
      {services.length === 0 && (
        <Typography>{t('messages.noservice')}</Typography>
      )}
      <Typography mt={1} variant="h6">
        Servicios
      </Typography>

      {/* Barra de búsqueda */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <TextField
          placeholder={t('inputLabel.search')}
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '33%' }} // La barra ocupa 1/3 del ancho
        />
      </Box>

      <Box gap={1} display={'flex'} flexWrap={'wrap'} maxHeight={200} overflow={'auto'} style={{ resize: 'vertical' }}>
        {sortedServices.map((service) => (
          <Chip
            key={service._id}
            label={`${service.serviceName} - ${service.duration}`}
            onClick={() =>
              handleSelectedOption(`${service.serviceName} - ${service.duration}`)
            }
            disabled={disabled}
            variant={
              selectedOption.includes(
                `${service.serviceName} - ${service.duration}`
              )
                ? 'filled'
                : 'outlined'
            }
          />
        ))}

        {/* Mensaje si no hay resultados */}
        {sortedServices.length === 0 && (
          <Typography variant="body2" color="textSecondary" textAlign="center">
            {t('inputLabel.noResults')}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ServicesBox;
