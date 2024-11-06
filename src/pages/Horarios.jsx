import {
  Box,
  Button,
  CircularProgress,
  Container,
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
import { DatePicker } from '@mui/x-date-pickers';
import { useTranslation } from 'react-i18next';
import { fixCentersArray } from '../utils/fixArray';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import SelectComponent from '../components/SelectComponent';

const Horarios = () => {
  const [t] = useTranslation('global');
  const [fileData, setFileData] = useState([]);
  const [dateSelected, SetDateSelected] = useState('');
  const [centerId, setCenter] = useState('');
  const { dataBase } = useParams();
  const [loading, setLoading] = useState(false);

  // Función para convertir formato de tiempo de Excel a una cadena hh:mm:ss
  function excelTimeToString(excelTime) {
    const totalSeconds = Math.round(excelTime * 86400); // Convertir el decimal a segundos
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Formatear como hh:mm:ss
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Función para convertir formato de fecha de Excel a una cadena DD/MM/YYYY
  function excelDateToString(excelDate) {
    const date = new Date((excelDate - 25569) * 86400 * 1000); // Convertir desde número de Excel a milisegundos
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

 // Analizar CSV
if (fileExtension === 'csv') {
  Papa.parse(file, {
    complete: (result) => {
      const data = result.data;
      const keys = data[0];
      const parsedData = data.slice(1).map((row) =>
        row.reduce((obj, value, index) => {
          const columnName = keys[index];
          
          // Verificar si la columna es "Fecha" y si el valor es una cadena en formato DD/MM/YYYY
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
}

    // Analizar Excel (.xls, .xlsx)
    else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Primera hoja
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
        });

        const keys = sheet[0];
        const parsedData = sheet.slice(1).map((row) =>
          row.reduce((obj, value, index) => {
            const columnName = keys[index];
            
            // Verificar si la columna es Fecha y el valor es un número
            if (columnName === 'Fecha'){
                if(typeof value === 'number'){
                  obj[columnName] = excelDateToString(value);
                }else{
                // Si el valor es texto, asumir que está en DD/MM/YYYY y convertir a MM/DD/YYYY
                obj[columnName] = convertDateToUSFormat(value);
                }
            } 
            // Verificar si la columna es Hora_Entrada o Hora_Salida y si el valor es un número
            else if (
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

        console.log(dateSelected);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmit = async () => {
    let confirmContinue = true;

    if (fileData.length === 0)
      return enqueueSnackbar('No se están importando datos', {
        variant: 'error',
      });

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
            centerId: centerId
          },
        }
      );
      console.log(data);
      enqueueSnackbar('Se importó exitosamente', { variant: 'success' });
    } catch (err) {
      console.log(err);
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

      {/* Grid para agrupar DatePicker y SelectComponent */}
      <Grid container spacing={2}> {/* spacing={2} aplica 16px de separación entre los elementos */}
        
        {/* DatePicker */}
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

        {/* SelectComponent (Centro) */}
        <Grid item xs={12} md={6}>
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
            sx={{ mb: 2 }} // Espaciado inferior
          />
        </Grid>

      </Grid>

      {/* Input para subir archivos */}
      <TextField
        type="file"
        inputProps={{
          accept:
            '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
        }}
        onChange={handleFileChange}
        fullWidth
        variant="outlined"
        sx={{ my: 2 }} // Margen en el eje Y
      />

      {/* Botón de envío */}
      <Button
        disabled={loading}
        variant="contained"
        color="primary"
        onClick={handleSubmit}
      >
        {loading ? <CircularProgress size={25} /> : 'Importar Datos'}
      </Button>

      {/* Mostrar los datos importados */}
      {fileData.length > 0 && (
        <Box sx={{ mt: 4, maxHeight: 500, overflow: 'auto' }}>
          <pre>{JSON.stringify(fileData, null, 2)}</pre>
        </Box>
      )}
    </Container>
  );
};

export default Horarios;
