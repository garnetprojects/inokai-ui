import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 300,
    },
  },
};

export default function MultipleSelectComponent({
  options = [],
  selectedOption,
  setSelectedOption,
  disabled,
}) {
  const [t] = useTranslation('global');
  const [searchTerm, setSearchTerm] = useState(''); // Estado para la barra de búsqueda

  // Función para manejar el cambio en las selecciones
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedOption(
      typeof value === 'string' ? value.split(',') : value
    );
  };

  // Función para manejar el cambio en la barra de búsqueda
  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  // Filtrar las opciones según el término de búsqueda
  const filteredOptions = options.filter((item) =>
    item.label.toLowerCase().includes(searchTerm)
  );

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-checkbox-label">
          {t('inputLabel.service')}s
        </InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={selectedOption}
          onChange={handleChange}
          input={<OutlinedInput label="Servicios" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
          disabled={disabled}
        >
          <MenuItem disabled>
            <TextField
              size="small"
              placeholder={t('inputLabel.search')}
              onChange={handleSearch}
              value={searchTerm}
              fullWidth
            />
          </MenuItem>
          {filteredOptions.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              <Checkbox checked={selectedOption.indexOf(item.value) > -1} />
              <ListItemText primary={item.label} />
            </MenuItem>
          ))}
          {filteredOptions.length === 0 && (
            <MenuItem disabled>
              <ListItemText primary={t('inputLabel.noResults')} />
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </div>
  );
}
