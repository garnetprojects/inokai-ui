/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import ModalComponent from '../components/ModalComponent';
import TableComponent from '../components/TableComponent';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useInvalidate } from '../utils/Invalidate';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { getError } from '../utils/getError';

export const EmpleadosContext = createContext();

const EmpleadosPage = () => {
  const [t] = useTranslation('global');
  const [open, setOpen] = useState(false); // Simplificado a booleano
  const { dataBase, centerId } = useParams(); // Aquí agregamos centerId

  return (
    <EmpleadosContext.Provider value={{ open, setOpen }}>
      <Container>
        <Typography variant="h2" sx={{ textTransform: 'capitalize' }} mb={2}>
          {t('menu.employees')}
        </Typography>
        <Header dataBase={dataBase} centerId={centerId} />
        <TableBody dataBase={dataBase} />
      </Container>
    </EmpleadosContext.Provider>
  );
};

const Header = ({ dataBase, centerId }) => {
  const [t] = useTranslation('global');
  const { open, setOpen } = useContext(EmpleadosContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    DNI: '',
    password: '',
    services: [], // Debe ser un array de servicios
    specialities: [],
    profileImgUrl: null, // Para la imagen de perfil
  });

  const { invalidate } = useInvalidate();
  const [isEditMode, setIsEditMode] = useState(false); // Modo de edición o creación
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null); // ID del empleado en edición

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditMode) {
        // Editar empleado
        const url = `/users/edit-employee/${dataBase}/${currentEmployeeId}`;
        return await axios.put(url, data).then((response) => response.data);
      } else {
        // Crear nuevo empleado
        const url = `/users/create-employee/${dataBase}/${centerId}`;
        return await axios.post(url, data).then((response) => response.data);
      }
    },
    onSuccess: () => {
      invalidate(['empleados']);
      enqueueSnackbar(isEditMode ? 'Empleado editado correctamente' : 'Empleado creado correctamente', { variant: 'success' });
      setOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        DNI: '',
        password: '',
        services: [],
        specialities: [],
        profileImgUrl: null,
      });
      setIsEditMode(false);
      setCurrentEmployeeId(null);
    },
    onError: (err) => {
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Subir imagen
      const formData = new FormData();
      formData.append('file', file);

      axios
        .post(`/upload/profile-image/${dataBase}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((response) => {
          setFormData((prevData) => ({
            ...prevData,
            profileImgUrl: response.data.url, // Asumimos que la respuesta devuelve la URL de la imagen
          }));
        })
        .catch((error) => enqueueSnackbar(getError(error), { variant: 'error' }));
    }
  };

  useEffect(() => {
    if (open && currentEmployeeId) {
      // Si estamos en modo edición, cargar los datos del empleado
      axios.get(`/users/get-employee/${dataBase}/${currentEmployeeId}`).then((response) => {
        const employee = response.data;
        setFormData({
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          DNI: employee.DNI,
          password: '',
          services: employee.services || [],
          specialities: employee.specialities || [],
          profileImgUrl: employee.profileImgUrl || null,
        });
        setIsEditMode(true);
      });
    }
  }, [open, currentEmployeeId, dataBase]);

  return (
    <Box component="header" mb={5}>
      <Button
        variant="outlined"
        onClick={() => {
          setOpen(true);
          setIsEditMode(false); // Reseteamos a modo creación
        }}
        startIcon={<AddIcon />}
      >
        {t('buttons.create')}
      </Button>
      <ModalComponent open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit}>
          <Typography mt={3} variant="h4" sx={{ textTransform: 'capitalize' }}>
            {isEditMode ? t('buttons.edit') : t('buttons.create')}
          </Typography>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.name')}
                variant="standard"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                variant="standard"
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.dni')}
                name="DNI"
                type="text"
                value={formData.DNI}
                onChange={handleInputChange}
                required
                variant="standard"
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.password')}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                variant="standard"
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.phone')}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                variant="standard"
                fullWidth
              />
            </Grid>
            <Grid xs={12}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="upload-image"
              />
              <label htmlFor="upload-image">
                <Button component="span">{t('buttons.uploadImage')}</Button>
              </label>
              {formData.profileImgUrl && (
                <Box mt={2}>
                  <img
                    src={formData.profileImgUrl}
                    alt="Profile"
                    style={{ maxWidth: '100px', borderRadius: '50%' }}
                  />
                </Box>
              )}
            </Grid>
            <Grid xs={12}>
              <Button variant="contained" type="submit" fullWidth>
                {isEditMode ? t('buttons.edit') : t('buttons.create')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </ModalComponent>
    </Box>
  );
};

const TableBody = ({ dataBase }) => {
  const { data, isLoading, isError } = useQuery(
    ['empleados'],
    async () => {
      const response = await axios.get(`/users/get-all-employees/${dataBase}`);
      return response.data;
    }
  );

  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = (id) => {
    axios
      .delete(`/users/delete-employee/${dataBase}/${id}`)
      .then(() => {
        enqueueSnackbar('Empleado eliminado correctamente', { variant: 'success' });
        // Refrescar datos después de eliminar
        queryClient.invalidateQueries(['empleados']);
      })
      .catch((error) => enqueueSnackbar(getError(error), { variant: 'error' }));
  };

  if (isLoading) return <Skeleton variant="rectangular" height={400} />;
  if (isError || !data) return <Typography>Error al cargar datos</Typography>;

  return (
    <TableComponent
      data={data}
      handleDelete={handleDelete} // Pasamos la función de eliminar
    />
  );
};

export default EmpleadosPage;
