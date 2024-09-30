import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import MultipleSelectComponent from './MultipleSelectComponent';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getError } from '../utils/getError';
import { useTranslation } from 'react-i18next';

const SpecialitiesBox = ({ disabled, setSelectedOption, selectedOption, propBase }) => {
  const { dataBase } = useParams();
  const [t] = useTranslation('global');

  const servicesQuery = useQuery({
    queryKey: ['specialities'],
    queryFn: () => axios(`/appointment/get-specialities/${propBase || dataBase}`),
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
      <Typography variant="h6" textTransform={'capitalize'}>
        {t('title.specialities')}
      </Typography>

      <Box gap={1} display={'flex'} flexWrap={'wrap'} maxHeight={200} overflow={'auto'} style={{resize: 'vertical'}}>
        {servicesQuery.data?.data.map((item) => {
          console.log(selectedOption);

          return (
            <Chip
              key={item._id}
              label={item.specialityName}
              // onDelete={() => handleDelete(name)}
              onClick={() => handleSelectedOption(item._id)}
              disabled={disabled}
              variant={
                selectedOption.findIndex((data) => data === item._id) == -1
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

export default SpecialitiesBox;
