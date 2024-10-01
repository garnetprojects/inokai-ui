import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import MultipleSelectComponent from './MultipleSelectComponent';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getError } from '../utils/getError';
import { useTranslation } from 'react-i18next';

const ServicesBox = ({ disabled, setSelectedOption, selectedOption }) => {
  const { dataBase } = useParams();
  const [t] = useTranslation('global');

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: () => axios(`/appointment/get-services/${dataBase}`),
  });

  const handleDelete = (name) => {
    setSelectedOption((prev) => prev.filter((item) => item !== name));
  };

  if (servicesQuery.isError)
    return <Typography>{getError(servicesQuery.error)}</Typography>;

  const handleSelectedOption = (data) => {
    if (selectedOption.findIndex((item) => item === data) === -1) {
      return setSelectedOption((prev) => [...prev, data]);
    }
    handleDelete(data);
  };

  const services = servicesQuery.data?.data || [];

  // Ordenar los servicios: los seleccionados primero
  const sortedServices = [
    ...services.filter((service) =>
      selectedOption.includes(`${service.serviceName} - ${service.duration}`)
    ), // Seleccionados primero
    ...services.filter(
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
      </Box>
    </Box>
  );
};

export default ServicesBox;
