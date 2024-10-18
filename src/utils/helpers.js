export const formatDatePicker = 'DD/MM/YYYY';

export function formatDate(fechaString) {
  // Si no se proporciona ninguna fecha, usar la fecha actual
  if (!fechaString) {
    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Ajustar el mes
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    return `${mes}/${dia}/${año}`;
  }

  // Crear un objeto Date a partir de la cadena de fecha
  const fecha = new Date(fechaString);

  // Convertir la fecha a UTC para evitar problemas de zona horaria
  fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());

  // Obtener los componentes de la fecha
  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0'); // Ajustar el mes
  const año = fecha.getUTCFullYear();

  // Devolver la fecha formateada
  return `${mes}/${dia}/${año}`;
}

export function formatDateToMongo(data = '', format) {
  const [DD, MM, YY] = data.split('/');

  const fecha = { DD, MM, YY };

  const [num1, num2, num3] = format.split('/');

  return `${fecha[num1]}/${fecha[num2]}/${fecha[num3]}`;
}

export const imageUpload = (urlLogo, typeImg) => {
  const dataModified = urlLogo[0];

  const [name, type] = dataModified.name.split('.');
  const typeImage = `image/${type}`;

  const blob = dataModified.slice(0, dataModified.size, typeImage);
  const newFile = new File([blob], `${typeImg}-${dataModified.name}`, {
    type: typeImage,
  });

  return newFile;
};

export function convertirAMPMa24Horas(tiempo) {
  // Dividir la cadena en horas, minutos y AM/PM
  var partes = tiempo.split(' ');
  var horaMinutos = partes[0].split(':');
  var horas = parseInt(horaMinutos[0]);
  var minutos = parseInt(horaMinutos[1]);
  var ampm = partes[1];

  // Convertir a formato de 24 horas
  if (ampm === 'PM' && horas < 12) {
    horas = horas + 12;
  } else if (ampm === 'AM' && horas === 12) {
    horas = 0;
  }

  // Formatear las horas y minutos
  var horasFormateadas = horas < 10 ? '0' + horas : horas;
  var minutosFormateados = minutos < 10 ? '0' + minutos : minutos;

  // Devolver en formato de 24 horas
  return horasFormateadas + ':' + minutosFormateados;
}

export function estaEnRango(horaActual, horaInicio, horaFinal) {
  // Convertir las horas a números enteros para facilitar la comparación
  const horaActualNumero = parseInt(horaActual, 10);
  const horaInicioNumero = parseInt(horaInicio, 10);
  const horaFinalNumero = parseInt(horaFinal, 10);

  // Comprobar si la hora actual está dentro del rango
  if (
    horaActualNumero >= horaInicioNumero &&
    horaActualNumero <= horaFinalNumero
  ) {
    return true;
  } else {
    return false;
  }
}

export function returnHour(time) {
  const [timeFormated] = convertirAMPMa24Horas(time).split(':');

  return timeFormated;
}

export const defaultTime = (time) => {
  if (!time) return;

  const valueFrom = new Date();

  const [hour, minutes] = convertirAMPMa24Horas(time).split(':');

  valueFrom.setHours(hour);
  valueFrom.setMinutes(minutes);
  console.log({ hour, minutes });

  return valueFrom;
};

export function fechaEnTiempoPresente(fecha, horaInicio) {
  var fechaActual = new Date();
  if (!fecha || !horaInicio) return true;

  // Convertir la fecha actual a formato MM/DD/YYYY
  var mesActual = fechaActual.getMonth() + 1; // Se suma 1 porque en JavaScript los meses van de 0 a 11
  var diaActual = fechaActual.getDate();
  var añoActual = fechaActual.getFullYear();
  var fechaActualFormateada =
    mesActual.toString().padStart(2, '0') +
    '/' +
    diaActual.toString().padStart(2, '0') +
    '/' +
    añoActual;

  // Convertir la hora de inicio a formato HH:MM
  var [horaInicioHH, horaInicioMM] = horaInicio.split(':').map(Number);

  // Obtener la hora actual
  var horaActual = fechaActual.getHours();
  var minutoActual = fechaActual.getMinutes();

  // Comparar la fecha dada con la fecha actual
  if (Date.parse(fecha) < Date.parse(fechaActualFormateada)) {
    return false;
  } else if (Date.parse(fecha) === Date.parse(fechaActualFormateada)) {
    // Si la fecha es la misma, comparar la hora
    if (
      horaInicioHH < horaActual ||
      (horaInicioHH === horaActual && horaInicioMM <= minutoActual)
    ) {
      return false;
    }
  }

  return true;
}

export function restarHoras(horaInicio, horaFin) {
  // Verificar si alguna de las horas es undefined
  if (horaInicio === undefined || horaFin === undefined) {
    return;
  }

  // Extraer las horas y AM/PM de las cadenas de entrada
  var partesInicio = horaInicio.split(' ');
  var partesFin = horaFin.split(' ');

  var horaInicioNumerica = parseInt(partesInicio[0].split(':')[0]);
  var horaFinNumerica = parseInt(partesFin[0].split(':')[0]);

  var amPmInicio = partesInicio[1];
  var amPmFin = partesFin[1];

  // Convertir horas PM a formato de 24 horas
  if (amPmInicio === 'PM' && horaInicioNumerica !== 12) {
    horaInicioNumerica += 12;
  }
  if (amPmFin === 'PM' && horaFinNumerica !== 12) {
    horaFinNumerica += 12;
  }

  // Restar las horas
  var diferenciaHoras = horaFinNumerica - horaInicioNumerica;

  // Manejar la diferencia de 12 horas
  if (diferenciaHoras < 0) {
    diferenciaHoras += 12;
  }

  console.log(diferenciaHoras);
  return diferenciaHoras + 1;
}

export const bringAvailibity = (idUser, data) => {
  console.log({ idUser, data });

  // Filtramos las citas del usuario que sean "Fuera de horario"
  const userAppointments = (data ?? [])
  .filter(
    (appoint) =>
      appoint.userInfo._id === idUser &&
      appoint.clientName === 'Fuera de horario'
  )
  .sort((a, b) => {
    const aInitTime = Date.parse(a.initTime); // Convierte a timestamp
    const bInitTime = Date.parse(b.initTime); // Convierte a timestamp
    return aInitTime - bInitTime; // Ordena por hora de inicio
  });
  console.log({ idUser, data, userAppointments });

  let times = { from: null, to: null };

  // Casos según la cantidad de citas fuera de horario
  if (userAppointments.length === 2) {
    // Si hay dos citas (una por la mañana y otra por la tarde)
    times.from = userAppointments[0].finalTime.slice(0, -3); // Hora de finalización de la primera cita
    times.to = userAppointments[1].initTime.slice(0, -3);    // Hora de inicio de la segunda cita
  } else if (userAppointments.length === 1) {
    // Si hay una sola cita
    const singleAppointment = userAppointments[0];
    const appointmentStartHour = singleAppointment.initTime.slice(0, -3);
    const appointmentEndHour = singleAppointment.finalTime.slice(0, -3);

    // Verificamos si la cita es por la mañana o por la tarde
    if (appointmentStartHour == "10:00") {
      // Cita por la mañana
      times.from = appointmentEndHour;  // Hora de finalización de la cita por la mañana
      times.to = "22:00";               // Fin del horario de trabajo
    } else {
      // Cita por la tarde
      times.from = "10:00";             // Inicio del horario de trabajo
      times.to = appointmentStartHour;  // Hora de inicio de la cita por la tarde
    }
  } else {
    // Si no hay citas, se devuelve un horario por defecto o vacío
    times.from = "10:00"; // Horario por defecto de entrada
    times.to = "22:00";   // Horario por defecto de salida
  }

  return times;
};

export function eliminarPrimerosCharSiCoinciden(cadena, listaSubstr) {
  let prefijo = '';

  for (let substr of listaSubstr) {
    if (cadena.startsWith(substr)) {
      prefijo = substr;
      cadena = cadena.slice(substr.length);
      break; // Solo queremos eliminar una coincidencia al inicio
    }
  }

  return {
    prefijo: prefijo,
    numero: cadena,
  };
}