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

const Horarios = () => {
  const [t] = useTranslation('global');
  // const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [dateSelected, SetDateSelected] = useState('');
  const [center, setCenter] = useState('');
  const { dataBase } = useParams();
  const [loading, setLoading] = useState(false);

  // Manejar la carga del archivo
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
              obj[keys[index]] = value;
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
            obj[keys[index]] = value;
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
      return enqueueSnackbar('No se estan importando datos', {
        variant: 'error',
      });

    if (!dateSelected) {
      confirmContinue = confirm(
        'No se ha detectado un mes para eliminar, seguro que deseas continuar?'
      );
    }
    if (!center) {
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
          },
        }
      );
      console.log(data);
      enqueueSnackbar('Se importo exitosamente', { variant: 'success' });
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
      <LocationProvider>
        <DatePicker
          label={t('inputLabel.monthToDelete')}
          views={['month', 'year']}
          onChange={(e) =>
            SetDateSelected(`${e.get('month') + 1}/1/${e.get('year')}`)
          }
        />
      </LocationProvider>
      <Grid xs={12} md={6}>
              <SelectComponent
                fixArrayFn={fixCentersArray}
                params={`users/get-all-centers/${dataBase}`}
                label={t('title.center')}
                required={true}
                aditionalProperties={{
                  onChange: (e) => setCenter(e.target.value),
                  value: center || centerId || '',
                }}
                disabled={mutation.isPending}
              />
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

      {/* Mostrar los datos */}
      {fileData.length > 0 && (
        <Box sx={{ mt: 4, maxHeight: 500, overflow: 'auto' }}>
          <pre>{JSON.stringify(fileData, null, 2)}</pre>
        </Box>
      )}
    </Container>
  );
};

export default Horarios;
