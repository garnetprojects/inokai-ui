import {
  Box,
  Button,
  Container,
  FormControl,
  Input,
  InputLabel,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useContext } from 'react';
import { UserContext } from '../context/UserProvider';
import { getError } from '../utils/getError';
import { useSnackbar } from 'notistack';
import LogoApp from '../components/LogoApp';

const LogIn = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { dispatch } = useContext(UserContext);
  const [t, i18n] = useTranslation('global');
  const { dataBase } = useParams();

  console.log(dataBase);

  const mutation = useMutation({
    mutationFn: async (data) =>
      await axios
        .post(`/users/login/${dataBase}`, data)
        .then((response) => response.data),
    onSuccess: (data) => {
      console.log(data);
      dispatch({ type: 'LOG_IN', payload: data });
    },
    onError: (err) => {
      console.log(err);
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      email: e.target.mail.value,
      password: e.target.password.value,
    };

    console.log(data);
    mutation.mutate(data);
    console.log('data');
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: '1fr auto',
        minHeight: '100svh',
      }}
    >
      <Container
        sx={{
          py: '20px',
          alignSelf: 'center',
        }}
        maxWidth="sm"
      >
        <Box>
          <Box textAlign={'center'}>
            <LogoApp />
          </Box>
          <form action="" onSubmit={handleSubmit}>
            <FormControl sx={{ width: '100%', mt: '10px' }}>
              <InputLabel htmlFor="my-input">
                {t('inputLabel.email')}
              </InputLabel>
              <Input
                id="my-input"
                name="mail"
                type="email"
                required={true}
                disabled={mutation.isPending}
              />
            </FormControl>
            <FormControl sx={{ width: '100%', mt: 5 }}>
              <InputLabel htmlFor="password">
                {t('inputLabel.password')}
              </InputLabel>
              <Input
                id="password"
                name="password"
                type="password"
                required={true}
                disabled={mutation.isPending}
              />
            </FormControl>

            <Button
              disabled={mutation.isPending}
              type="submit"
              variant="contained"
              sx={{ width: '100%', mt: 5 }}
            >
              {t('buttons.logIn')}
            </Button>
          </form>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default LogIn;
