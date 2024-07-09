import { Box, Button, Chip, Divider, Typography } from '@mui/material';
import { Scheduler } from '@aldabil/react-scheduler';
import { convertirAMPMa24Horas } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

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

  return (
    <div className='calendario'>
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
          return <BoxAppointment setOpen={setOpen} data={event} />;
        }}
      />
    </div>
  );
};

const BoxAppointment = ({ data, setOpen }) => {
  const [t] = useTranslation('global');

  const handleClick = () => {
    setOpen(data);
  };

  const isFreeSlot = data.clientName === 'NO APLICA';

  return (
    <Button
      sx={{
        p: 1,
        position: 'relative',
        color: 'black',
        bgcolor: isFreeSlot ? 'grey.300' : data.services[0]?.color,
        opacity: isFreeSlot ? 0.3 : 1,
        ':disabled': {
          cursor: 'not-allowed',
        },
        ':hover': {
          bgcolor: isFreeSlot ? 'grey.300' : data.services[0]?.color,
          filter: 'saturate(250%)',
        },
      }}
      variant="contained"
      disabled={isFreeSlot}
    >
      {isFreeSlot && (
        <Typography fontSize={16} color="text.secondary">
          LIBRE
        </Typography>
      )}

      <Box onDoubleClick={handleClick}>
        <Box display="flex" flexDirection="row" gap={1}>
          <Typography fontSize={11}>
            {t('inputLabel.initTime')}: {data.initTime}
          </Typography>
          <Typography fontSize={11}>
            {t('inputLabel.endTime')}: {data.finalTime}
          </Typography>
        </Box>

        <Typography my={1} fontSize={11}>
          <Box component="span" fontWeight="bold" fontSize={11}>
            {t('text.clientName')}: {isFreeSlot ? 'LIBRE' : data.clientName}
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
          >
            {t('text.serviceReq')}:
          </Typography>

          <Box display="flex" gap={1} flexWrap="wrap">
            {data.services.map((item, idx) => (
              <Chip
                sx={{ background: 'white' }}
                size="small"
                key={idx}
                label={item.serviceName}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Button>
  );
};

export default Calendar;
