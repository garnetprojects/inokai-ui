import {
  Box,
  Button,
  CircularProgress,
  Container,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'; // Para manejar archivos Excel
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { getError } from '../utils/getError';
import LocationProvider from '../components/LocationProvider';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useTranslation } from 'react-i18next';
import { fixCentersArray, fixUserArray  } from '../utils/fixArray';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import SelectComponent from '../components/SelectComponent';
import { Close } from '@mui/icons-material';

const Horarios = () => {
  const [t] = useTranslation('global');
  const [fileData, setFileData] = useState([]);
  const [dateSelected, SetDateSelected] = useState('');
  const [centerId, setCenter] = useState('');
  const { dataBase } = useParams();
  const [loading, setLoading] = useState(false);

  // Estado para el modal de añadir manualmente
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualData, setManualData] = useState({
    date: null,
    employee: '',
    startTime: null,
    endTime: null,
  });

  const toggleManualModal = () => setManualModalOpen(!manualModalOpen);

  const handleManualChange = (field, value) => {
    setManualData((prev) => ({ ...prev, [field]: value }));
  };

  const handleManualSubmit = () => {
    const { date, employee, startTime, endTime } = manualData;
    alert(manualData);
    if (!date || !employee || !startTime || !endTime) {
      enqueueSnackbar('Por favor, completa todos los campos', {
        variant: 'warning',
      });
      return;
    }

    const manualEntry = {
      date: date.format('MM/DD/YYYY'),
      employee,
      startTime: startTime.format('HH:mm:ss'),
      endTime: endTime.format('HH:mm:ss'),
    };

    console.log('Datos ingresados manualmente:', JSON.stringify(manualEntry, null, 2));
    enqueueSnackbar('Entrada manual registrada', { variant: 'success' });
    toggleManualModal();
  };

  // Función para convertir formato de tiempo de Excel a una cadena hh:mm:ss
  function excelTimeToString(excelTime) {
    const totalSeconds = Math.round(excelTime * 86400); // Convertir el decimal a segundos
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Función para convertir formato de fecha de Excel a una cadena MM/DD/YYYY
  function excelDateToString(excelDate) {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  // Función para convertir cadena de fecha de DD/MM/YYYY a MM/DD/YYYY
  function convertDateToUSFormat(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${month}/${day}/${year}`;
  }

  // Función para manejar la carga del archivo
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
      const data = await axios.post(
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
      <Typography variant={'h2'} sx={{ textTransform: 'capitalize' }} mb={2}>
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
            required={true}
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

import { Close } from '@mui/icons-material';

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
      position: 'relative', // Para posicionar el botón de cierre
    }}
  >
    {/* Botón de cierre */}
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
      Reemplazar Horario
    </Typography>

    <LocationProvider>
      <Grid container spacing={3}>
        {/* Fecha */}
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
            params={`users/get-all-employees/${dataBase}`}
            label="Empleado"
            required={true}
            aditionalProperties={{
              onChange: (e) => handleManualChange(e.target.value.userInfo),
              value: manualData.employee,
            }}
            disabled={loading}
            sx={{ flexGrow: 1 }}
          />
        </Grid>

        {/* Hora de Entrada */}
        <Grid item xs={12} md={6}>
          <TimePicker
            label="Hora de Entrada"
            value={manualData.startTime}
            onChange={(value) => handleManualChange('startTime', value)}
            fullWidth
          />
        </Grid>

        {/* Hora de Salida */}
        <Grid item xs={12} md={6}>
          <TimePicker
            label="Hora de Salida"
            value={manualData.endTime}
            onChange={(value) => handleManualChange('endTime', value)}
            fullWidth
          />
        </Grid>
      </Grid>
    </LocationProvider>

    <Box sx={{ mt: 4 }}>
      <Button variant="contained" color="primary" fullWidth onClick={handleManualSubmit}>
        Hacer cambio
      </Button>
    </Box>
  </Box>
</Modal>

    </Container>
  );
};

export default Horarios;
