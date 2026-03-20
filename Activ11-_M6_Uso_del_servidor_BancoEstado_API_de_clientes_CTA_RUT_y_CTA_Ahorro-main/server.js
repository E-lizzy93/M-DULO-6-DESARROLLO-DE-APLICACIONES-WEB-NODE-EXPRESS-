const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT         = 3000;
const ARCHIVO_JSON = path.join(__dirname, 'clientes.json');
const SALDO_MINIMO = 1000;

// ── Helpers ───────────────────────────────────────────────────────────────

function leerClientes(callback) {
  fs.readFile(ARCHIVO_JSON, 'utf8', (err, data) => {
    if (err) return callback(err, null);
    try { callback(null, JSON.parse(data)); }
    catch (e) { callback(new Error('JSON inválido'), null); }
  });
}

function guardarClientes(clientes, callback) {
  fs.writeFile(ARCHIVO_JSON, JSON.stringify(clientes, null, 2), 'utf8', callback);
}

function leerBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try { callback(null, JSON.parse(body)); }
    catch (e) { callback(new Error('JSON inválido'), null); }
  });
}

function responderJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function servirEstatico(res, archivo) {
  const ext   = path.extname(archivo);
  const tipos = { '.html': 'text/html', '.css': 'text/css' };
  fs.readFile(archivo, (err, data) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': tipos[ext] || 'text/plain' });
    res.end(data);
  });
}

// ID autoincremental para clientes
function generarId(clientes) {
  return clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1;
}

// Número cuenta RUT = RUT sin dígito verificador
function generarNumeroCuentaRut(rut) {
  return rut.split('-')[0].trim();
}

// Número cuenta ahorro autoincremental
function generarNumeroCuentaAhorro(clientes) {
  const nums = clientes
    .flatMap(c => c.cuentasAhorro)
    .map(a => parseInt(a.numero.replace('CAH-', '')))
    .filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `CAH-${String(max + 1).padStart(4, '0')}`;
}

// ── Servidor ──────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {

  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  const ruta   = urlObj.pathname;

  // Archivos estáticos
  if (ruta === '/' || ruta === '/index.html') {
    return servirEstatico(res, path.join(__dirname, 'public', 'index.html'));
  }
  if (ruta === '/style.css') {
    return servirEstatico(res, path.join(__dirname, 'public', 'style.css'));
  }
  if (!ruta.startsWith('/api')) {
    return responderJSON(res, 404, { error: 'Ruta no encontrada' });
  }

  // ── GET /api/clientes → listar todos ──────────────────────────────────
  if (ruta === '/api/clientes' && req.method === 'GET') {
    leerClientes((err, clientes) => {
      if (err) return responderJSON(res, 500, { error: 'Error al leer datos' });
      responderJSON(res, 200, clientes);
    });

  // ── GET /api/clientes/rut → solo clientes con cuenta RUT ──────────────
  } else if (ruta === '/api/clientes/rut' && req.method === 'GET') {
    leerClientes((err, clientes) => {
      if (err) return responderJSON(res, 500, { error: 'Error al leer datos' });
      responderJSON(res, 200, clientes.filter(c => c.cuentaRut));
    });

  // ── GET /api/clientes/buscar?rut=12345678-9 → buscar por RUT ──────────
  } else if (ruta === '/api/clientes/buscar' && req.method === 'GET') {
    const rutBuscar = urlObj.searchParams.get('rut');
    leerClientes((err, clientes) => {
      if (err) return responderJSON(res, 500, { error: 'Error al leer datos' });
      const cliente = clientes.find(c => c.rut === rutBuscar);
      if (!cliente) return responderJSON(res, 404, { error: 'No existe cliente con ese RUT' });
      responderJSON(res, 200, cliente);
    });

  // ── POST /api/clientes → crear cliente con cuenta RUT ─────────────────
  } else if (ruta === '/api/clientes' && req.method === 'POST') {
    leerBody(req, (err, datos) => {
      if (err) return responderJSON(res, 400, { error: 'JSON inválido' });

      leerClientes((err, clientes) => {
        if (err) return responderJSON(res, 500, { error: 'Error al leer datos' });

        if (!datos.nombre || !datos.rut || datos.saldoRut === undefined) {
          return responderJSON(res, 400, { error: 'Se requiere nombre, rut y saldoRut' });
        }

        // Verificar que el RUT no exista
        if (clientes.find(c => c.rut === datos.rut)) {
          return responderJSON(res, 400, { error: `El RUT ${datos.rut} ya tiene una cuenta registrada` });
        }

        const numeroCuentaRut = generarNumeroCuentaRut(datos.rut);
        const saldoAhorro     = datos.saldoAhorro || 0;

        const nuevoCliente = {
          id: generarId(clientes),
          rut: datos.rut,
          nombre: datos.nombre,
          cuentaRut: { numero: numeroCuentaRut, saldo: datos.saldoRut },
          cuentasAhorro: []
        };

        // Si quiere abrir cuenta ahorro también
        if (datos.abrirAhorro) {
          if (datos.saldoRut < SALDO_MINIMO) {
            return responderJSON(res, 400, {
              error: `Saldo insuficiente. Mínimo $${SALDO_MINIMO.toLocaleString()} en cuenta RUT para abrir cuenta ahorro`
            });
          }
          const numeroAhorro = generarNumeroCuentaAhorro(clientes);
          // Descontar saldo de cuenta RUT
          nuevoCliente.cuentaRut.saldo -= saldoAhorro;
          nuevoCliente.cuentasAhorro.push({ numero: numeroAhorro, saldo: saldoAhorro });
        }

        clientes.push(nuevoCliente);
        guardarClientes(clientes, (err) => {
          if (err) return responderJSON(res, 500, { error: 'Error al guardar' });
          responderJSON(res, 201, { mensaje: 'Cliente creado correctamente', cliente: nuevoCliente });
        });
      });
    });

  // ── POST /api/clientes/:id/ahorro → abrir cuenta ahorro ───────────────
  } else if (ruta.match(/^\/api\/clientes\/\d+\/ahorro$/) && req.method === 'POST') {
    const id = parseInt(ruta.split('/')[3]);

    leerBody(req, (err, datos) => {
      if (err) return responderJSON(res, 400, { error: 'JSON inválido' });

      leerClientes((err, clientes) => {
        if (err) return responderJSON(res, 500, { error: 'Error al leer datos' });

        const cliente = clientes.find(c => c.id === id);
        if (!cliente) return responderJSON(res, 404, { error: 'Cliente no encontrado' });
        if (!cliente.cuentaRut) return responderJSON(res, 400, { error: 'El cliente debe tener cuenta RUT primero' });
        if (cliente.cuentaRut.saldo < SALDO_MINIMO) {
          return responderJSON(res, 400, {
            error: `Saldo insuficiente. Mínimo $${SALDO_MINIMO.toLocaleString()} en cuenta RUT`
          });
        }

        const saldoAhorro  = datos.saldo || 0;
        const numeroAhorro = generarNumeroCuentaAhorro(clientes);

        // Descontar saldo de cuenta RUT
        cliente.cuentaRut.saldo -= saldoAhorro;
        cliente.cuentasAhorro.push({ numero: numeroAhorro, saldo: saldoAhorro });

        guardarClientes(clientes, (err) => {
          if (err) return responderJSON(res, 500, { error: 'Error al guardar' });
          responderJSON(res, 201, { mensaje: `Cuenta ${numeroAhorro} abierta correctamente`, cliente });
        });
      });
    });

  // ── DELETE /api/clientes/:id → cerrar cuenta principal ────────────────
  } else if (ruta.match(/^\/api\/clientes\/\d+$/) && req.method === 'DELETE') {
    const id = parseInt(ruta.split('/')[3]);

    leerClientes((err, clientes) => {
      if (err) return responderJSON(res, 500, { error: 'Error al leer datos' });

      const cliente = clientes.find(c => c.id === id);
      if (!cliente) return responderJSON(res, 404, { error: 'Cliente no encontrado' });

      // Calcular saldo total para informar al ejecutivo
      const saldoRut    = cliente.cuentaRut ? cliente.cuentaRut.saldo : 0;
      const saldoAhorro = cliente.cuentasAhorro.reduce((acc, a) => acc + a.saldo, 0);
      const saldoTotal  = saldoRut + saldoAhorro;

      const filtrados = clientes.filter(c => c.id !== id);
      guardarClientes(filtrados, (err) => {
        if (err) return responderJSON(res, 500, { error: 'Error al guardar' });
        responderJSON(res, 200, {
          mensaje: `Cliente ${cliente.nombre} eliminado. Informar retiro de $${saldoTotal.toLocaleString()}`,
          saldoTotal
        });
      });
    });

  // ── DELETE /api/clientes/:id/ahorro/:num → cerrar cuenta ahorro ────────
  } else if (ruta.match(/^\/api\/clientes\/\d+\/ahorro\/.+$/) && req.method === 'DELETE') {
    const partes    = ruta.split('/');
    const id        = parseInt(partes[3]);
    const numAhorro = decodeURIComponent(partes[5]);

    leerClientes((err, clientes) => {
      if (err) return responderJSON(res, 500, { error: 'Error al leer datos' });

      const cliente = clientes.find(c => c.id === id);
      if (!cliente) return responderJSON(res, 404, { error: 'Cliente no encontrado' });

      const cuentaCerrar = cliente.cuentasAhorro.find(a => a.numero === numAhorro);
      if (!cuentaCerrar) return responderJSON(res, 404, { error: 'Cuenta ahorro no encontrada' });

      // Transferir saldo automáticamente a cuenta RUT
      const saldoTransferido = cuentaCerrar.saldo;
      cliente.cuentaRut.saldo += saldoTransferido;
      cliente.cuentasAhorro = cliente.cuentasAhorro.filter(a => a.numero !== numAhorro);

      guardarClientes(clientes, (err) => {
        if (err) return responderJSON(res, 500, { error: 'Error al guardar' });
        responderJSON(res, 200, {
          mensaje: `Cuenta ${numAhorro} cerrada. $${saldoTransferido.toLocaleString()} transferidos a cuenta RUT`,
          cliente
        });
      });
    });

  } else if (ruta.startsWith('/api')) {
    responderJSON(res, 405, { error: `Método ${req.method} no permitido` });
  } else {
    responderJSON(res, 404, { error: 'Ruta no encontrada' });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor BancoEstado corriendo en http://localhost:${PORT}`);
});
