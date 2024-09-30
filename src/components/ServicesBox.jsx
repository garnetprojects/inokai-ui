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

  console.log(servicesQuery.isLoading);

  if (servicesQuery.isError)
    return <Typography>{getError(servicesQuery.error)}</Typography>;

  const handleSelectedOption = (data) => {
    if (selectedOption.findIndex((item) => item === data) == -1) {
      return setSelectedOption((prev) => [...prev, data]);
    }

    handleDelete(data);
  };
  return (
    <Box>
      {servicesQuery.isLoading && <CircularProgress size={20} />}
      {servicesQuery.data?.data.length === 0 && (
        <Typography>{t('messages.noservice')}</Typography>
      )}
      <Typography mt={1} variant="h6">
        Servicios
      </Typography>

      <Box gap={1} display={'flex'} flexWrap={'wrap'} maxHeight={200} overflow={'auto'} style={{resize: 'vertical'}}>
        {servicesQuery.data?.data
          .map((service) => {
            return (
              <Chip
                key={service._id}
                label={`${service.serviceName} - ${service.duration}`}
                // onDelete={() => handleDelete(name)}
                onClick={() => handleSelectedOption(`${service.serviceName} - ${service.duration}`)}
                disabled={disabled}
                variant={
                  selectedOption.findIndex((item) => item === `${service.serviceName} - ${service.duration}`) == -1
                    ? 'outlined'
                    : 'filled'
                }
              />
            );
          })}
      </Box>
    </Box>
  );
};

export default ServicesBox;
