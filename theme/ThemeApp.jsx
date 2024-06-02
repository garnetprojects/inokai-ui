import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useContext } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { UserContext } from '../src/context';
import { useEffect } from 'react';

const ThemeApp = () => {
  const { dispatch } = useContext(UserContext);
  const { dataBase } = useParams();

  const { data } = useQuery({
    queryKey: ['settingEmpresa', dataBase],
    queryFn: async () =>
      await axios(`/settings/get-settings/${dataBase}`).then((res) => res.data),
  });

  console.log(data);

  const theme = createTheme({
    palette: {
      primary: {
        main: data?.primaryColor || '#1976D2',
      },
    },
  });

  useEffect(() => {
    if (data?.status === 'suspended') {
      dispatch({ type: 'LOG_OUT' });
    }
  }, [data?.status]);

  return (
    <ThemeProvider theme={theme}>
      <Outlet />
    </ThemeProvider>
  );
};

export default ThemeApp;
