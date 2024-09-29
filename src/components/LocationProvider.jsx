import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React from 'react'
import { useTranslation } from 'react-i18next';

const LocationProvider = ({ children }) => {
  const [t, e] = useTranslation('global');
  console.log(e.language);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={e.language}>
      {children}
    </LocalizationProvider>
  );
};

export default LocationProvider