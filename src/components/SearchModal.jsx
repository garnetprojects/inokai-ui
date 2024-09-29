import { SearchOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useContext, useState } from 'react';
import ModalComponent from './ModalComponent';
import SelectComponent from './SelectComponent';
import { fixCentersArray } from '../utils/fixArray';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserProvider';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const SearchModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterCenter, setFilterCenter] = useState('');

  const { dataBase } = useParams();
  const [t, i18] = useTranslation('global');
  const { state } = useContext(UserContext);

  const mutate = useMutation({
    mutationFn: (params) =>
      axios(`/appointment/filter/${dataBase}`, { params }),
  });

  console.log(mutate.data?.data);

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = {
      clientName: e.target.name.value,
      clientPhone: e.target.phone.value,
      centerInfo: filterCenter,
    };

    console.log(params);
    // return

    mutate.mutate(params);
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
                required={true}
                disabled={mutate.isPending}
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
              <Box key={item._id}>
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
                    observaciones: {item.remarks}
                  </Typography>

                  <Typography gutterBottom component="div">
                    Servicios:
                  </Typography>
                  <Box ml={1}>
                    {item.services.map((item) => (
                      <Chip
                        label={`${item.serviceName} - ${item.duration}`}
                        key={item.serviceName}
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
