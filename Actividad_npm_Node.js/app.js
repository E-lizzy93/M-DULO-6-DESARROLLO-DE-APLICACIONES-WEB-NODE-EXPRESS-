const chalk = require('chalk');
const dayjs = require('dayjs');

// Formateamos la fecha y hora actual con dayjs
const fechaActual = dayjs().format('DD/MM/YYYY HH:mm:ss');

// Mensaje de bienvenida en color verde
console.log(chalk.green('¡Bienvenido a mi aplicación Node.js!'));

// Mostramos la fecha en consola
console.log('Fecha y hora actual: ' + fechaActual);

// Mensaje adicional en color amarillo con la fecha
console.log(chalk.yellow('Hoy es: ' + fechaActual));

