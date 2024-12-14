import { Box, Typography, Tooltip, Button } from '@mui/material';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

const EmployeeWeeklyView = ({ employee, data, setSelectedEmployee }) => {
  // Obtener la fecha de inicio de la semana (Lunes)
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });

  // Crear una matriz con los días de la semana (Lunes - Domingo)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Filtrar citas del empleado para la semana actual
  const employeeAppointments = data.appointments2.filter(
    (appointment) =>
      appointment.user_id === employee.user_id &&
      weekDays.some((day) =>
        isSameDay(new Date(appointment.date), new Date(day))
      )
  );

  // Agrupar citas por día
  const appointmentsByDay = weekDays.map((day) => ({
    date: day,
    appointments: employeeAppointments.filter((appointment) =>
      isSameDay(new Date(appointment.date), new Date(day))
    ),
  }));

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
                >
                  <Box
                    mb={1}
                    p={1}
                    bgcolor="lightblue"
                    borderRadius="4px"
                    boxShadow="0px 2px 4px rgba(0,0,0,0.1)"
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
    </Box>
  );
};

export default EmployeeWeeklyView;
