/* eslint-disable react/prop-types */

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
  console.log(data);
  // console.log(finalTimeAgrupadas);
  const formatedDate = data?.appointments2?.map((item) => ({
    ...item,
    start: combinarFechaYHora(item.date, convertirAMPMa24Horas(item.initTime)),
    end: combinarFechaYHora(item.date, convertirAMPMa24Horas(item.finalTime)),
    event_id: item._id,
  }));

  console.log(selectedDate);

  return (
    <>
      {/* <Box position={'sticky'} top={10} zIndex={'100000'} p={10}>
        FUNCIONA
      </Box> */}
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
          subTextField: 'email',
          avatarField: 'name',
          // colorField: 'color',
        }}
        eventRenderer={({ event }) => {
          return <BoxAppointment setOpen={setOpen} data={event} />;
        }}
      />
    </>
  );
};

const BoxAppointment = ({ data, setOpen }) => {
  // console.log(data);
  const [t] = useTranslation('global');

  const handleClick = () => {
    // if (!fechaEnTiempoPresente(data.date, data?.initTime)) return;
    setOpen(data);
  };

  // console.log(data?.isCancel);
  // console.log(fechaEnTiempoPresente(data.date));

  return (
    <Button
      sx={{
        p: 1,
        position: 'relative',
        color: 'black',
        bgcolor: data.services[0]?.color,
        ':disabled': {
          cursor: 'not-allowed',
        },
        ':hover': {
          bgcolor: data.services[0]?.color,
          filter: 'saturate(250%)'
        },
      }}
      variant="contained"
      // disabled={!fechaEnTiempoPresente(data.date, data?.initTime)}
    >
      {data?.isCancel && (
        <Box
          component={'span'}
          position={'absolute'}
          top={0}
          left={0}
          height={4}
          width={'100%'}
          bgcolor={'red'}
        ></Box>
      )}

      <Box
        onDoubleClick={handleClick}
        // sx={{ minWidth: 120 }}
      >
        <Box display={'flex'} columnGap={2} flexWrap={'wrap'}>
          <Typography fontSize={13}>{t('inputLabel.initTime')}: {data.initTime}</Typography>
          <Typography fontSize={13}>{t('inputLabel.endTime')}: {data.finalTime}</Typography>
        </Box>
        {/* <Divider sx={{ my: 1 }} /> */}
        <Typography my={1} fontSize={12}>
          <Box component={'span'} fontWeight={'bold'} fontSize={13}>
            {t('text.clientName')}:{' '}
          </Box>
          {data.clientName}
        </Typography>
        {/* <Typography>
          
          <Box component={'span'} fontWeight={'bold'}>
            Telfono Cliente:
          </Box>
          {data.clientPhone}
        </Typography> */}
        <Divider sx={{ my: 0.5 }} />
        <Box>
          <Typography
            component={'span'}
            fontWeight={'bold'}
            display={'block'}
            mb={1}
            fontSize={13}
          >
            {t('text.serviceReq')}:
          </Typography>

          <Box display={'flex'} gap={1} flexWrap={'wrap'}>
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
