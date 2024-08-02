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
  const [DD, MM, YY] = data.split('/')

  const fecha = {DD, MM, YY}

  const [num1, num2, num3] = format.split('/')

  return `${fecha[num1]}/${fecha[num2]}/${fecha[num3]}`
}


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
