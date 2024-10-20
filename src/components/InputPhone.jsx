import { MenuItem, TextField } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { phoneCountry } from '../utils/selectData';

const InputPhone = ({
  disabled,
  defaultValue,
  nameCountry,
  namePhone = 'phone',
  hidden = false,
}) => {
  const { t } = useTranslation('global');
  return (
    <Grid xs={12} md={6} display={'flex'} alignItems={'center'} gap={2}>
      {!hidden && (
        <TextField
          label={' '}
          name={nameCountry}
          disabled={disabled}
          variant="standard"
          select
          defaultValue={defaultValue?.prefijo || phoneCountry[0]}
        >
          {phoneCountry.map((num) => (
            <MenuItem value={num} key={num}>
              {num}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        label={t('inputLabel.phoneNumber')}
        name={namePhone}
        type="tel"
        variant="standard"
        defaultValue={defaultValue?.numero || ''}
        disabled={disabled}
        required
        style={{ flex: 1 }}
      />
    </Grid>
  );
};

export default InputPhone;