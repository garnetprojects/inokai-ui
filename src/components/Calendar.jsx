import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Tooltip,
  Typography,
} from '@mui/material';
import { Scheduler } from '@aldabil/react-scheduler';
import { bringAvailibity, convertirAMPMa24Horas } from '../utils/helpers';
import { useTranslation } from 'react-i18next';
import { memo, useCallback, useRef } from 'react';

function combinarFechaYHora(fecha, hora) {
  const [month, day, year] = fecha.split('/');
  const [hour, minute] = hora.split(':');
  return new Date(year, month - 1, day, hour, minute); // mes se indexa desde 0
}

const Calendar = ({ data, setOpen, selectedDate }) => {
  const formatedDate = data?.appointments2?.map((item) => ({
    ...item,
    start: combinarFechaYHora(item.date, convertirAMPMa24Horas(item.initTime)),
    end: combinarFechaYHora(item.date, convertirAMPMa24Horas(item.finalTime)),
    event_id: item._id,
  }));

  const scrollableRef = useRef(null);
  const hiddenScrollRef = useRef(null);

  const handleScroll = () => {
    if (scrollableRef.current && hiddenScrollRef.current) {
      // Sincronizar el scroll horizontal
      hiddenScrollRef.current.scrollLeft = scrollableRef.current.scrollLeft;
    }
  };

  return (
    <Box position={'relative'}>
      <Box
        className="probando-aqui"
        ref={hiddenScrollRef}
        position={'sticky'}
        top={0}
        // position={'absolute'}
        zIndex={1000}
        display={'flex'}
        maxWidth={'100%'}
        overflow={'hidden'}
        // width={'100%'}
      >
        {data.usersInAppointments.map((user) => {
          let availibity = bringAvailibity(user.user_id, data?.appointments2);

          return (
            <Tooltip
              title={`${availibity.from ? availibity.from : ''}  ${
                availibity.to ? `a ${availibity.to}` : ''
              }`}
              arrow
              key={user.user_id}
            >
              <Box bgcolor={'white'} flex={'1'} className="boxPerfil">
                <Box
                  display={'flex'}
                  mx={'auto'}
                  border={'1px solid #e0e0e0'}
                  py={1}
                  px={'10px'}
                  flexDirection={'row'} // Keep horizontal for avatar + text
                >
                  <Box mx={1} textTransform={'uppercase'}>
                    <Avatar>{user.name[0]}</Avatar>
                  </Box>

                  <Box display={'flex'} flexDirection={'column'}>
                    {' '}
                    {/* Stack typography vertically */}
                    <Typography variant="body2" whiteSpace={'nowrap'}>
                      {user.name}
                    </Typography>
                    {!(
                      availibity.from === '10:00' && availibity.to === '22:00'
                    ) && (
                      <Typography variant="body2" whiteSpace={'nowrap'}>
                        {`${availibity.from ? availibity.from : ''}  ${
                          availibity.to ? `a ${availibity.to}` : ''
                        }`}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      <div className="calendario" ref={scrollableRef} onScroll={handleScroll}>
        <Scheduler
          height={3000}
          resourceViewMode="default"
          // resourceViewMode="tabs"
          view="day"
          disableViewNavigator
          disableViewer
          hourFormat="24"
          events={formatedDate || []}
          resources={data?.usersInAppointments || []}
          selectedDate={selectedDate ? new Date(selectedDate) : new Date()}
          day={{
            startHour: 10,
            endHour: 22,
            cellRenderer: () => <></>,
            navigation: false,
          }}
          resourceFields={{
            idField: 'user_id',
            textField: 'name',
            subTextField: '',
            avatarField: 'name',
          }}
          eventRenderer={({ event }) => {
            return (
              <BoxAppointment
                setOpen={setOpen}
                data={event}
                appointments={data?.appointments2}
              />
            );
          }}
        />
      </div>
    </Box>
  );
};

const BoxAppointment = ({ data, setOpen, appointments }) => {
  const [t] = useTranslation('global');

  const handleClick = () => {
    setOpen(data);
  };

  const isFreeSlot =
    data.clientName === 'NO APLICA' ||
    data.clientName === 'Fuera de horario' ||
    data.clientName === 'Vacaciones' ||
    data.clientName === 'Baja' ||
    data.clientName === 'Libre' ||
    data.clientName === 'Año Nuevo' ||
    data.clientName === 'Festivo';
  const serviceColor =
    !isFreeSlot && data.services.length > 0
      ? data.services[0].color
      : 'grey.300';

  // Crear el texto para el tooltip con los servicios
  const servicesTooltip = data.services
    .map((item) => item.serviceName)
    .join(', ');

  return (
    <Tooltip title={servicesTooltip} arrow>
      <Button
        sx={{
          p: 1,
          position: 'relative',
          color: 'black',
          bgcolor: serviceColor,
          opacity: 1,
          ':disabled': {
            cursor: 'not-allowed',
          },
          ':hover': {
            bgcolor: serviceColor,
            filter: 'saturate(250%)',
          },
        }}
        variant="contained"
        disabled={isFreeSlot}
      >
        {isFreeSlot && (
          <Typography fontSize={11} color="text.secondary">
            {t('')}
          </Typography>
        )}

        <Box onDoubleClick={handleClick}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography fontSize={11}>
              {t('inputLabel.initTime')}: {data.initTime}
              {t(' - ')}
              {t('inputLabel.endTime')}: {data.finalTime}
            </Typography>
          </Box>

          <Typography my={1} fontSize={11}>
            <Box component="span" fontWeight="bold" fontSize={11}>
              {data.clientName}
            </Box>
          </Typography>

          <Divider sx={{ my: 0.5 }} />

          <Box>
            <Typography
              component="span"
              fontWeight="bold"
              display="block"
              mb={1}
              fontSize={11}
            ></Typography>

            <Box display="flex" gap={0.5} flexWrap="wrap">
              {data.services.map((item, idx) => (
                <Chip
                  sx={{
                    background: item.color,
                    fontSize: '0.75rem',
                    height: '20px',
                    padding: '0 5px',
                    color: 'white',
                  }}
                  size="small"
                  key={idx}
                  label={item.serviceName}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Button>
    </Tooltip>
  );
};

export default memo(Calendar);