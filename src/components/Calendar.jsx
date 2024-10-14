import { useState, memo, useRef } from 'react';
import { Scheduler } from '@aldabil/react-scheduler';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { bringAvailibity, convertirAMPMa24Horas } from '../utils/helpers';

function combinarFechaYHora(fecha, hora) {
  const [month, day, year] = fecha.split('/');
  const [hour, minute] = hora.split(':');
  return new Date(year, month - 1, day, hour, minute); // mes se indexa desde 0
}

const Calendar = ({ data, setOpen, selectedDate }) => {
  const [isOpen, setIsOpen] = useState(false);  // Controla si el modal está abierto
  const [appointmentData, setAppointmentData] = useState(null);  // Datos de la cita
  const scrollableRef = useRef(null);
  const hiddenScrollRef = useRef(null);

  // Formatea las citas existentes
  const formatedDate = data?.appointments2?.map((item) => ({
    ...item,
    start: combinarFechaYHora(item.date, convertirAMPMa24Horas(item.initTime)),
    end: combinarFechaYHora(item.date, convertirAMPMa24Horas(item.finalTime)),
    event_id: item._id,
  }));

  const handleScroll = () => {
    if (scrollableRef.current && hiddenScrollRef.current) {
      hiddenScrollRef.current.scrollLeft = scrollableRef.current.scrollLeft;
    }
  };

  // Función para manejar el doble clic en el calendario vacío
  const handleDoubleClickOutsideEvent = (event) => {
    const currentDate = new Date();  // Captura la fecha actual o puedes capturar la fecha donde clicas
    const endDate = new Date(currentDate.getTime() + 60 * 60 * 1000); // Añade 1 hora

    setAppointmentData({
      start: currentDate,
      end: endDate,
      resourceId: null,  // No hay recurso en este caso
      resourceName: 'N/A',
      view: 'day',
      duration: 60,
    });

    setIsOpen(true);  // Abre el modal
  };

  return (
    <Box position={'relative'}>
      <Box
        ref={hiddenScrollRef}
        position={'sticky'}
        top={0}
        zIndex={1000}
        display={'flex'}
        maxWidth={'100%'}
        overflow={'hidden'}
      >
        {data.usersInAppointments.map((user) => {
          let availibity = bringAvailibity(user.user_id, data?.appointments2);
          return (
            <Box key={user._id} bgcolor={'white'} flex={'1'}>
              {/* Muestra el nombre y disponibilidad */}
              <Box display={'flex'} mx={'auto'} border={'1px solid #e0e0e0'} py={1} px={'10px'}>
                <Box mx={1} textTransform={'uppercase'}>
                  {user.name}
                </Box>
                <Box display={'flex'} flexDirection={'column'}>
                  <p>{availibity.from ? availibity.from : ''} {availibity.to ? `a ${availibity.to}` : ''}</p>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* El área que captura el doble clic */}
      <div className="calendario" ref={scrollableRef} onScroll={handleScroll}>
        <Box onDoubleClick={handleDoubleClickOutsideEvent}>
          <Scheduler
            height={3000}
            resourceViewMode="default"
            view="day"
            disableViewNavigator
            disableViewer
            hourFormat="24"
            events={formatedDate || []}
            resources={data?.usersInAppointments || []}
            selectedDate={selectedDate ? new Date(selectedDate) : new Date()}
            day={{
              startHour: 9,
              endHour: 23,
              cellRenderer: () => <></>, // Sin celdas custom
              navigation: false,
            }}
            resourceFields={{
              idField: 'user_id',
              textField: 'name',
              avatarField: 'name',
            }}
            eventRenderer={({ event }) => (
              <BoxAppointment
                setOpen={setOpen}
                data={event}
                appointments={data?.appointments2}
              />
            )}
          />
        </Box>
      </div>

      {/* Modal para crear nueva cita */}
      {isOpen && (
        <YourModalComponent
          open={isOpen}
          onClose={() => setIsOpen(false)}  // Cierra el modal
          appointmentData={appointmentData}  // Pasa los datos de la cita
        />
      )}
    </Box>
  );
};

// Componente del modal que se abre al hacer doble clic en el calendario
const YourModalComponent = ({ open, onClose, appointmentData }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Crear nueva cita</DialogTitle>
      <DialogContent>
        {/* Mostrar datos de la cita */}
        <p>Fecha de inicio: {appointmentData?.start.toLocaleString()}</p>
        <p>Fecha de fin: {appointmentData?.end.toLocaleString()}</p>
        <p>Duración: {appointmentData?.duration} minutos</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={() => { /* Lógica para crear la cita */ }}>Crear Cita</Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente para cada evento en el calendario
const BoxAppointment = ({ data, setOpen }) => {
  const handleClick = () => {
    setOpen(data); // Manejar clic en un evento existente
  };

  return (
    <Box onClick={handleClick}>
      <p>{data.clientName}</p>
      <p>{data.initTime} - {data.finalTime}</p>
    </Box>
  );
};

export default memo(Calendar);
