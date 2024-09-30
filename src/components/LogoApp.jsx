/* eslint-disable react/prop-types */
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import AdbIcon from '@mui/icons-material/Adb';
import useRouteDB from '../utils/RouteDB';

const LogoApp = ({ version = '' }) => {
  const { dataBase } = useParams();
  const { params } = useRouteDB();

  const { data } = useQuery({
    queryKey: ['settingEmpresa', dataBase],
    queryFn: async () =>
      await axios(`/settings/get-settings/${dataBase}`).then((res) => res.data),
  });

  console.log(data, 'aqui en logo');

  const urlLogo = data?.logo?.[0]?.cloudinary_url;
  const urlLogoSm = data?.smallLogo?.[0]?.cloudinary_url;

  if (version === 'sm')
    return (
      <>
        {urlLogo || urlLogoSm ? (
          <Box py={1}>
            <img
              src={urlLogoSm || urlLogo}
              alt="Logo"
              decoding="async"
              height={50}
              width={150}
            />
          </Box>
        ) : (
          <>
            <AdbIcon />
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              COMQ
            </Typography>
          </>
        )}
      </>
    );

  return (
    <>
      {urlLogo && (
        <img
          src={urlLogo}
          alt="Logo"
          decoding="async"
          style={{ height: 'auto', width: '250px' }}
        />
      )}

      {!urlLogo && <Typography variant="h1">COMQ</Typography>}
    </>
  );
};

export default LogoApp;
