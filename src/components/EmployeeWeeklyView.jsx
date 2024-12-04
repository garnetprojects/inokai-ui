import { Box, Typography, Tooltip, Button, CircularProgress } from '@mui/material';
import { format, startOfWeek, addDays } from 'date-fns';
import { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeWeeklyView = ({ employee, setSelectedEmployee, fetchUrl, setOpen }) => {
  // Obtener la fecha de inicio de la semana (Lunes)
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });

  // Crear una matriz con los días de la semana (Lunes - Domingo)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const [appointmentsByDay, setAppointmentsByDay] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para cargar citas por día
  const fetchAppointmentsForDay = async (day) => {
    try {
      const response = await axios.get(`${fetchUrl}/appointments`, {
        params: {
          user_id: employee.user_id,
          date: format(day, 'yyyy-MM-dd'), // Formato de la fecha para la API
        },
      });
      return {
        date: day,
        appointments: response.data, // Asumimos que la API devuelve un array de citas
      };
    } catch (error) {
      console.error(`Error fetching appointments for ${format(day, 'yyyy-MM-dd')}:`, error);
      return {
        date: day,
        appointments: [],
      };
    }
  };

  useEffect(() => {
    const fetchAllAppointments = async () => {
      setLoading(true);
      try {
        const appointments = await Promise.all(
          weekDays.map((day) => fetchAppointmentsForDay(day))
        );
        setAppointmentsByDay(appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAppointments();
  }, [employee, weekDays]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Botón para regresar */}
      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setSelectedEmployee(null)}
        >
          Volver al Calendario
        </Button>
      </Box>

      {/* Encabezado de la semana */}
      <Box display="flex" borderBottom="1px solid #e0e0e0" pb={1} mb={1}>
        {weekDays.map((day, idx) => (
          <Box key={idx} flex="1" textAlign="center">
            <Typography variant="subtitle1">
              {format(day, 'EEEE')} {/* Día de la semana */}
            </Typography>
            <Typography variant="subtitle2">
              {format(day, 'dd/MM/yyyy')} {/* Fecha */}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Citas por día */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex="1">
          <CircularProgress />
        </Box>
      ) : (
        <Box display="flex" flex="1" overflow="auto">
          {appointmentsByDay.map((dayData, idx) => (
            <Box
              key={idx}
              flex="1"
              borderRight={idx < 6 ? '1px solid #e0e0e0' : 'none'}
              px={1}
            >
              {dayData.appointments.length > 0 ? (
                dayData.appointments.map((appointment, apptIdx) => (
                  <Tooltip
                    key={apptIdx}
                    title={`${appointment.clientName} (${appointment.initTime} - ${appointment.finalTime})`}
                    arrow
                  >
                    <Box
                      mb={1}
                      p={1}
                      bgcolor="lightblue"
                      borderRadius="4px"
                      boxShadow="0px 2px 4px rgba(0,0,0,0.1)"
                      onDoubleClick={() => setOpen(appointment)} // Abrir modal de edición
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {appointment.clientName}
                      </Typography>
                      <Typography variant="body2">
                        {appointment.initTime} - {appointment.finalTime}
                      </Typography>
                      <Typography variant="caption">
                        {appointment.remarks}
                      </Typography>
                    </Box>
                  </Tooltip>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  No hay citas
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EmployeeWeeklyView;
