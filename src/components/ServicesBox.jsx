import { Box, Chip, Typography } from '@mui/material';
import MultipleSelectComponent from './MultipleSelectComponent';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getError } from '../utils/getError';

const ServicesBox = ({ disabled, setSelectedOption, selectedOption }) => {
  const { dataBase } = useParams();

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

  return (
    <Box>
      <MultipleSelectComponent
        options={
          servicesQuery.data?.data.map((item) => ({
            value: `${item.serviceName} - ${item.duration}`,
            label: `${item.serviceName} - ${item.duration}`,
          })) || []
        }
        setSelectedOption={setSelectedOption}
        selectedOption={selectedOption}
        disabled={servicesQuery.isLoading || disabled}
      />

      <Box
        my={1}
        py={2}
        gap={1}
        paddingX={3}
        bgcolor={'#eee'}
        display={'flex'}
        flexWrap={'wrap'}
      >
        {selectedOption.map((name) => {
          const [type, minutes, color] = name.split('-');

          return (
            <Chip
              key={name}
              label={name}
              onDelete={() => handleDelete(name)}
              disabled={disabled}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default ServicesBox;
