const http = require('http');
const fs   = require('fs');
const path = require('path');

// Importamos las clases desde el archivo separado
const Pelicula = require('./models/Pelicula');
const Serie     = require('./models/Serie');

const PORT              = 3000;
const ARCHIVO_PELICULAS = path.join(__dirname, 'peliculas.txt');
const ARCHIVO_SERIES    = path.join(__dirname, 'series.txt');

// Leer archivo y convertir cada línea en objeto Pelicula o Serie
function leerArchivo(archivo, tipo, callback) {
  fs.readFile(archivo, 'utf8', (err, data) => {
    if (err) return callback(err, null);

    const lineas = data.split('\n').filter(l => l.trim() !== '');
    const items  = lineas.map(linea =>
      tipo === 'peliculas' ? Pelicula.desdeLinea(linea) : Serie.desdeLinea(linea)
    );

    callback(null, items);
  });
}

// Escribir array de objetos de vuelta al archivo .txt
function escribirArchivo(archivo, items, callback) {
  const lineas = items.map(item => item.toLineaTexto());
  fs.writeFile(archivo, lineas.join('\n'), 'utf8', callback);
}

// Leer el body del request (para POST)
function leerBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try { callback(null, JSON.parse(body)); }
    catch (e) { callback(new Error('JSON inválido'), null); }
  });
}

// Enviar respuesta JSON
function responderJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

// ── Servidor ──────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {

  // Parsear URL y parámetros
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  const ruta   = urlObj.pathname;
  const tipo   = urlObj.searchParams.get('tipo');
  const nombre = urlObj.searchParams.get('nombre');

  // ── Servir archivos estáticos (CSS) ──────────────────────────────────────
  if (ruta.startsWith("/") && ruta.endsWith(".css")) {
    fs.readFile(path.join(__dirname, "public", ruta), (err, data) => {
      if (err) { res.writeHead(404); return res.end("No encontrado"); }
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(data);
    });
    return;
  }

  // ── Servir cliente web en / ────────────────────────────────────────────
  if (ruta === '/' && req.method === 'GET') {
    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
      if (err) { res.writeHead(500); return res.end('Error al cargar index.html'); }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // ── Solo atendemos /catalogo ───────────────────────────────────────────
  if (ruta !== '/catalogo') {
    return responderJSON(res, 404, { error: 'Ruta no encontrada' });
  }

  const archivo = tipo === 'series' ? ARCHIVO_SERIES : ARCHIVO_PELICULAS;

  // ── GET: listar películas o series ─────────────────────────────────────
  if (req.method === 'GET') {
    if (!tipo) return responderJSON(res, 400, { error: 'Falta ?tipo=peliculas o ?tipo=series' });

    leerArchivo(archivo, tipo, (err, items) => {
      if (err) return responderJSON(res, 500, { error: 'Error al leer el archivo' });
      responderJSON(res, 200, items);
    });

  // ── POST: agregar película o serie ─────────────────────────────────────
  } else if (req.method === 'POST') {
    if (!tipo) return responderJSON(res, 400, { error: 'Falta ?tipo=peliculas o ?tipo=series' });

    leerBody(req, (err, datos) => {
      if (err) return responderJSON(res, 400, { error: 'Body JSON inválido' });

      // Crear instancia de la clase correspondiente
      const nuevoItem = tipo === 'peliculas'
        ? new Pelicula(datos.nombre, datos.director, datos.anio)
        : new Serie(datos.nombre, datos.anio, datos.temporadas);

      leerArchivo(archivo, tipo, (err, items) => {
        if (err) return responderJSON(res, 500, { error: 'Error al leer el archivo' });

        items.push(nuevoItem);

        escribirArchivo(archivo, items, (err) => {
          if (err) return responderJSON(res, 500, { error: 'Error al guardar' });
          responderJSON(res, 201, { mensaje: 'Agregado correctamente', item: nuevoItem });
        });
      });
    });

  // ── DELETE: eliminar por nombre ────────────────────────────────────────
  } else if (req.method === 'DELETE') {
    if (!tipo || !nombre) return responderJSON(res, 400, { error: 'Faltan ?tipo y ?nombre' });

    leerArchivo(archivo, tipo, (err, items) => {
      if (err) return responderJSON(res, 500, { error: 'Error al leer el archivo' });

      const filtrados = items.filter(item => item.nombre.toLowerCase() !== nombre.toLowerCase());

      if (filtrados.length === items.length) {
        return responderJSON(res, 404, { error: `No se encontró: ${nombre}` });
      }

      escribirArchivo(archivo, filtrados, (err) => {
        if (err) return responderJSON(res, 500, { error: 'Error al guardar' });
        responderJSON(res, 200, { mensaje: `"${nombre}" eliminado correctamente` });
      });
    });

  // ── Método no permitido ────────────────────────────────────────────────
  } else {
    responderJSON(res, 405, { error: `Método ${req.method} no permitido` });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


