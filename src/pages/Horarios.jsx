import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Modal,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { getError } from '../utils/getError';
import LocationProvider from '../components/LocationProvider';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useTranslation } from 'react-i18next';
import { fixCentersArray, fixUserArray } from '../utils/fixArray';
import Grid from '@mui/material/Unstable_Grid2';
import SelectComponent from '../components/SelectComponent';
import { Close } from '@mui/icons-material';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const Horarios = () => {
  const [t] = useTranslation('global');
  const [fileData, setFileData] = useState([]);
  const [dateSelected, SetDateSelected] = useState('');
  const [centerId, setCenter] = useState('');
  const { dataBase } = useParams();
  const [loading, setLoading] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  
  const [manualData, setManualData] = useState({
    date: null,
    employee: '',
    startTime: null,
    endTime: null,
    type: '', // Nuevo campo para los checkboxes
  });

  const toggleManualModal = () => setManualModalOpen(!manualModalOpen);

 // Manejo de cambios en los campos del formulario

  const handleManualChange = (field, value) => {
    setManualData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    setManualData((prev) => ({
      ...prev,
      type: checked ? value : '', // Asignar el tipo si está seleccionado, limpiarlo si no
      startTime: checked ? dayjs('10:00', 'HH:mm') : null, // Hora predeterminada o nula
      endTime: checked ? dayjs('22:00', 'HH:mm') : null,
    }));
  };

  const isAnyCheckboxChecked = !!manualData.type; // Verificar si algún checkbox está seleccionado

  const handleManualSubmit = async () => {
    const { date, employee, startTime, endTime, type } = manualData;

    if (!date || !employee || (!startTime && !endTime && !type)) {
      enqueueSnackbar('Por favor, completa todos los campos', { variant: 'warning' });
      return;
    }

    const manualEntry = {
      date: date.format('MM/DD/YYYY'),
      employee,
      startTime: isAnyCheckboxChecked ? '10:00:00' : startTime.format('HH:mm:ss'),
      endTime: isAnyCheckboxChecked ? '22:00:00' : endTime.format('HH:mm:ss'),
      type: type || null,
    };

    try {
      const response = await axios.post(
        `/appointment/horario-manual/${dataBase}`,
        manualEntry
      );
      enqueueSnackbar('Entrada manual registrada', { variant: 'success' });
      console.log('Respuesta del servidor:', response.data);
      toggleManualModal(); // Cerrar modal tras un éxito
    } catch (error) {
      console.error('Error al registrar la entrada manual:', error);
      enqueueSnackbar('Error al registrar la entrada manual', { variant: 'error' });
    }
  };

const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
const [exchangeData, setExchangeData] = useState({
  employee1: '',
  employee2: '',
  date1: null,
  date2: null,
});

const toggleExchangeModal = () => setExchangeModalOpen(!exchangeModalOpen);

const handleExchangeChange = (field, value) => {
  setExchangeData((prev) => ({ ...prev, [field]: value }));
};

const handleExchangeSubmit = async () => {
  const { employee1, employee2, date1, date2 } = exchangeData;

  if (!employee1 || !employee2 || !date1 || !date2) {
    enqueueSnackbar('Por favor, completa todos los campos', {
      variant: 'warning',
    });
    return;
  }

  const exchangePayload = {
    employee1,
    employee2,
    date1: date1.format('MM/DD/YYYY'),
    date2: date2.format('MM/DD/YYYY'),
  };

  try {
    console.log('Enviando datos de intercambio:', JSON.stringify(exchangePayload, null, 2));
    
    const response = await axios.post(
      `/appointment/intercambio-horarios/${dataBase}`,
      exchangePayload
    );

    enqueueSnackbar('Intercambio realizado correctamente', { variant: 'success' });
    console.log('Respuesta del servidor:', response.data);

    toggleExchangeModal(); // Cierra el modal después de un intercambio exitoso
  } catch (error) {
    console.error('Error al realizar el intercambio:', error);
    enqueueSnackbar('Error al realizar el intercambio', { variant: 'error' });
  }
};


  function excelTimeToString(excelTime) {
    const totalSeconds = Math.round(excelTime * 86400);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function excelDateToString(excelDate) {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  function convertDateToUSFormat(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${month}/${day}/${year}`;
  }

  const handleFileChange = (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    const fileExtension = file.name.split('.').pop();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        complete: (result) => {
          const data = result.data;
          const keys = data[0];
          const parsedData = data.slice(1).map((row) =>
            row.reduce((obj, value, index) => {
              const columnName = keys[index];
              if (columnName === 'Fecha' && typeof value === 'string' && value.includes('/')) {
                obj[columnName] = convertDateToUSFormat(value);
              } else {
                obj[columnName] = value;
              }
              return obj;
            }, {})
          );
          setFileData(parsedData);
        },
        header: false,
      });
    } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        const keys = sheet[0];
        const parsedData = sheet.slice(1).map((row) =>
          row.reduce((obj, value, index) => {
            const columnName = keys[index];
            if (columnName === 'Fecha') {
              if (typeof value === 'number') {
                obj[columnName] = excelDateToString(value);
              } else {
                obj[columnName] = convertDateToUSFormat(value);
              }
            } else if (
              (columnName === 'Hora_Entrada' || columnName === 'Hora_Salida') &&
              typeof value === 'number'
            ) {
              obj[columnName] = excelTimeToString(value);
            } else {
              obj[columnName] = value;
            }
            return obj;
          }, {})
        );
        setFileData(parsedData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmit = async () => {
    let confirmContinue = true;

    if (fileData.length === 0)
      return enqueueSnackbar('No se están importando datos', { variant: 'error' });

    if (!dateSelected) {
      confirmContinue = confirm(
        'No se ha detectado un mes para eliminar, ¿seguro que deseas continuar?'
      );
    }
    if (!centerId) {
      confirmContinue = confirm(
        'No se ha detectado un centro. Por favor selecciona el centro.'
      );
    }

    if (!confirmContinue) return;

    setLoading(true);
    try {
      await axios.post(
        `/appointment/generar-horarios/${dataBase}`,
        fileData,
        {
          params: {
            dateToDelete: dateSelected,
            centerId: centerId,
          },
        }
      );
      enqueueSnackbar('Se importó exitosamente', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h2" sx={{ textTransform: 'capitalize' }} mb={2}>
        {t('title.schedules')}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <LocationProvider>
            <DatePicker
              label={t('inputLabel.monthToDelete')}
              views={['month', 'year']}
              onChange={(e) =>
                SetDateSelected(`${e.get('month') + 1}/1/${e.get('year')}`)
              }
            />
          </LocationProvider>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
          <SelectComponent
            fixArrayFn={fixCentersArray}
            params={`users/get-all-centers/${dataBase}`}
            label={t('title.center')}
            required
            aditionalProperties={{
              onChange: (e) => setCenter(e.target.value),
              value: centerId || '',
            }}
            disabled={loading}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={toggleManualModal}
            sx={{ ml: 2 }}
          >
            Añadir Manualmente
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={toggleExchangeModal}
            sx={{ ml: 2 }}
          >
            Intercambio de Horarios
          </Button>
        </Grid>
      </Grid>

      <TextField
        type="file"
        inputProps={{
          accept:
            '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
        }}
        onChange={handleFileChange}
        fullWidth
        variant="outlined"
        sx={{ my: 2 }}
      />

      <Button
        disabled={loading}
        variant="contained"
        color="primary"
        onClick={handleSubmit}
      >
        {loading ? <CircularProgress size={25} /> : 'Importar Datos'}
      </Button>

      {fileData.length > 0 && (
        <Box sx={{ mt: 4, maxHeight: 500, overflow: 'auto' }}>
          <pre>{JSON.stringify(fileData, null, 2)}</pre>
        </Box>
      )}
 <LocalizationProvider dateAdapter={AdapterDayjs}>
<Modal open={manualModalOpen} onClose={toggleManualModal}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 6,
          maxWidth: 800,
          width: '100%',
          borderRadius: 4,
        }}
      >
        <IconButton
          onClick={toggleManualModal}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
          }}
        >
          <Close />
        </IconButton>

        <Typography variant="h5" mb={3}>
          Añadir Manualmente
        </Typography>
        <LocationProvider>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha"
              value={manualData.date}
              onChange={(value) => handleManualChange('date', value)}
              fullWidth
            />
          </Grid>

          {/* Empleado */}
          <Grid item xs={12} md={6}>
                    <SelectComponent
                      fixArrayFn={fixUserArray}
                      params={`appointment/get-all-employees/${dataBase}`}
                      label="Empleado"
                      aditionalProperties={{
                        onChange: (e) => handleManualChange('employee', e.target.value),
                        value: exchangeData.employee,
                      }}
                      required={true}
                    />
                  </Grid>

          <Grid item xs={12}>
            {/* Checkboxes */}
            {['Libre', 'Baja', 'Vacaciones', 'Año Nuevo', 'Reyes', 'Festivo'].map((label) => (
              <FormControlLabel
                key={label}
                control={
                  <Checkbox
                    value={label}
                    checked={manualData.type === label}
                    onChange={handleCheckboxChange}
                  />
                }
                label={label}
              />
            ))}
          </Grid>

          <Grid item xs={6}>
            <TimePicker
              label="Hora de Entrada"
              value={manualData.startTime}
              onChange={(value) => handleManualChange('startTime', value)}
              disabled={isAnyCheckboxChecked} // Desactivar si hay un checkbox seleccionado
              ampm={false}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TimePicker
              label="Hora de Salida"
              value={manualData.endTime}
              onChange={(value) => handleManualChange('endTime', value)}
              disabled={isAnyCheckboxChecked} // Desactivar si hay un checkbox seleccionado
              ampm={false}
              fullWidth
            />
          </Grid>
        </Grid>
        </LocationProvider>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleManualSubmit}
          >
            Registrar Entrada
          </Button>
        </Box>
      </Box>
    </Modal>
    </LocalizationProvider>


<Modal open={exchangeModalOpen} onClose={toggleExchangeModal}>
  <Box
    sx={{
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 6,
      maxWidth: 800,
      width: '100%',
      borderRadius: 4,
      position: 'relative', // Para posicionar el botón de cierre
    }}
  >
    {/* Botón de cierre */}
    <IconButton
      onClick={toggleExchangeModal}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
      }}
    >
      <Close />
    </IconButton>

    <Typography variant="h5" mb={3}>
      Intercambiar Horarios
    </Typography>

    <LocationProvider>
      <Grid container spacing={3}>
        {/* Empleado 1 */}
        <Grid item xs={12} md={6}>
          <SelectComponent
            fixArrayFn={fixUserArray}
            params={`appointment/get-all-employees/${dataBase}`}
            label="Empleado 1"
            aditionalProperties={{
              onChange: (e) => handleExchangeChange('employee1', e.target.value),
              value: exchangeData.employee1,
            }}
            required={true}
          />
        </Grid>

        {/* Empleado 2 */}
        <Grid item xs={12} md={6}>
          <SelectComponent
            fixArrayFn={fixUserArray}
            params={`appointment/get-all-employees/${dataBase}`}
            label="Empleado 2"
            aditionalProperties={{
              onChange: (e) => handleExchangeChange('employee2', e.target.value),
              value: exchangeData.employee2,
            }}
            required={true}
          />
        </Grid>

        {/* Fecha 1 */}
        <Grid item xs={12} md={6}>
          <DatePicker
            label="Fecha 1"
            value={exchangeData.date1}
            onChange={(value) => handleExchangeChange('date1', value)}
            fullWidth
          />
        </Grid>

        {/* Fecha 2 */}
        <Grid item xs={12} md={6}>
          <DatePicker
            label="Fecha 2"
            value={exchangeData.date2}
            onChange={(value) => handleExchangeChange('date2', value)}
            fullWidth
          />
        </Grid>
      </Grid>
    </LocationProvider>

    <Box sx={{ mt: 4 }}>
      <Button variant="contained" color="primary" fullWidth onClick={handleExchangeSubmit}>
        Intercambiar
      </Button>
    </Box>
  </Box>
</Modal>
    </Container>
  );
};

export default Horarios;
