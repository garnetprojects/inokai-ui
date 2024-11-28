import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Tooltip,
    Typography,
  } from '@mui/material';
  import { memo, useState } from 'react';
  import { Scheduler } from '@aldabil/react-scheduler';
  import { convertirAMPMa24Horas } from '../utils/helpers';
  import { useTranslation } from 'react-i18next';
  
  function combinarFechaYHora(fecha, hora) {
    const [month, day, year] = fecha.split('/');
    const [hour, minute] = hora.split(':');
    return new Date(year, month - 1, day, hour, minute);
  }
  
  const EmployeeWeeklyView = ({ employee, data, setSelectedEmployee }) => {
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState(new Date());
  
    // Filtrar las citas para el empleado seleccionado
    const employeeAppointments = data.appointments2.filter(
      (appointment) => appointment.user_id === employee.user_id
    );
  
    // Formatear las citas para el componente Scheduler
    const formatedAppointments = employeeAppointments.map((item) => ({
      ...item,
      start: combinarFechaYHora(item.date, convertirAMPMa24Horas(item.initTime)),
      end: combinarFechaYHora(item.date, convertirAMPMa24Horas(item.finalTime)),
      event_id: item._id,
    }));
  
    // Cambiar fecha seleccionada hacia adelante o atrás
    const handleNavigation = (direction) => {
      const daysToAdd = direction === 'next' ? 7 : -7;
      setSelectedDate((prev) => new Date(prev.setDate(prev.getDate() + daysToAdd)));
    };
  
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button onClick={() => setSelectedEmployee(null)}>{t('Back to Main View')}</Button>
          <Typography variant="h6">{`${t('Employee Schedule')}: ${employee.name}`}</Typography>
          <Box>
            <Button onClick={() => handleNavigation('prev')}>{t('Previous Week')}</Button>
            <Button onClick={() => handleNavigation('next')}>{t('Next Week')}</Button>
          </Box>
        </Box>
  
        <Scheduler
          height={600}
          events={formatedAppointments}
          selectedDate={selectedDate}
          view="week"
          week={{
            weekDays: [0, 1, 2, 3, 4, 5, 6], // Mostrar los 7 días de la semana
            startHour: 10,
            endHour: 22,
            navigation: true,
            cellRenderer: () => <></>,
          }}
          hourFormat="24"
          eventRenderer={({ event }) => (
            <Box
              sx={{
                bgcolor: 'lightblue',
                p: 1,
                borderRadius: 1,
                border: '1px solid #ccc',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {event.clientName}
              </Typography>
              <Typography variant="caption">{`${event.initTime} - ${event.finalTime}`}</Typography>
              <Divider sx={{ my: 0.5 }} />
              {event.services.map((service, idx) => (
                <Chip
                  key={idx}
                  label={service.serviceName}
                  size="small"
                  sx={{ bgcolor: service.color, color: 'white', mr: 0.5 }}
                />
              ))}
            </Box>
          )}
        />
      </Box>
    );
  };
  
  export default memo(EmployeeWeeklyView);
  