const http = require('http');

const PORT = 3000;

// Nombres de los días en español
const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Función que genera una palabra aleatoria entre 3 y 10 letras
function generarPalabraAleatoria() {
  const letras = 'abcdefghijklmnopqrstuvwxyz';
  const longitud = Math.floor(Math.random() * 8) + 3; // entre 3 y 10
  let palabra = '';
  for (let i = 0; i < longitud; i++) {
    palabra += letras[Math.floor(Math.random() * letras.length)];
  }
  return palabra;
}

// Función que genera un número aleatorio entre 10 y 50.000
function generarNumeroAleatorio() {
  return Math.floor(Math.random() * 50000) + 10; // entre 10 y 50000
}

// Creamos el servidor
const server = http.createServer((req, res) => {

  // ── ENDPOINT PRINCIPAL: GET / ──────────────────────────────────────────────
  if (req.url === '/' && req.method === 'GET') {
    const ahora = new Date();

    const dia        = dias[ahora.getDay()];
    const numeroDia  = ahora.getDate();
    const mes        = ahora.getMonth() + 1; // getMonth() empieza en 0
    const anio       = ahora.getFullYear();
    const hora       = ahora.getHours();
    const minutos    = ahora.getMinutes();
    const segundos   = ahora.getSeconds();

    const html = `
      <html>
        <body>
          <h1>Fecha y Hora del Servidor</h1>
          <ul>
            <li><strong>Día:</strong> ${dia}</li>
            <li><strong>Número día:</strong> ${numeroDia}</li>
            <li><strong>Mes:</strong> ${mes}</li>
            <li><strong>Año:</strong> ${anio}</li>
            <li><strong>Hora:</strong> ${hora}</li>
            <li><strong>Minutos:</strong> ${minutos}</li>
            <li><strong>Segundos:</strong> ${segundos}</li>
          </ul>
        </body>
      </html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);

  // ── ENDPOINT SECUNDARIO: /random-data ─────────────────────────────────────
  } else if (req.url === '/random-data') {

    // GET → palabra aleatoria
    if (req.method === 'GET') {
      const palabra = generarPalabraAleatoria();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`<html><body><p>${palabra}</p></body></html>`);

    // PUT → número aleatorio
    } else if (req.method === 'PUT') {
      const numero = generarNumeroAleatorio();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`<html><body><p>${numero}</p></body></html>`);

    // Cualquier otro método → mensaje de texto plano
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`Aún no estoy preparado para responder al método ${req.method}`);
    }

  // ── RUTA NO ENCONTRADA ─────────────────────────────────────────────────────
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Ruta no encontrada');
  }

});

// Iniciamos el servidor en el puerto 3000
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


