/* eslint-disable react/prop-types */
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { bringAvailibity } from '../utils/helpers';

const SelectComponent = ({
  label,
  params,
  fixArrayFn = () => [],
  aditionalProperties = {},
  disabled,
  required,
  maxWidth,
  appointmentData,
}) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [label],
    queryFn: async () => await axios(params).then((res) => res.data),
    enabled: !!label,
  });

  if (isError) return <p>Ocurrio algo</p>;

  console.log(appointmentData);

  return (
    <FormControl disabled={isLoading} fullWidth style={{ maxWidth }}>
      <InputLabel required={required} id={label}>
        {label}
      </InputLabel>
      <Select
        disabled={disabled || isLoading}
        required={required}
        labelId={label}
        label={label}
        {...aditionalProperties}
      >
        {fixArrayFn(data || []).map((item, idx) => {
          const hourWork = bringAvailibity(item.value, appointmentData);

          return (
            <MenuItem value={item.value} key={idx}>
              {item.text} <br/> {hourWork?.from && hourWork?.from} {hourWork?.to && `a ${hourWork?.to}`}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export const SelectNoFetchComponent = ({
  label,
  aditionalProperties = {},
  disabled,
  required,
  data,
}) => {
  return (
    <FormControl disabled={disabled} fullWidth>
      <InputLabel required={required} id={label}>
        {label}
      </InputLabel>
      <Select labelId={label} label={label} {...aditionalProperties}>
        {data?.map((item, idx) => (
          <MenuItem value={item.value} key={idx}>
            {item.text}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectComponent;
