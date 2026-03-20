const express        = require('express');
const path           = require('path');
const { promises: fs } = require('fs');
const { v4: uuidv4 } = require('uuid');

const app      = express();
const PORT     = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const FILE_PROD = path.join(DATA_DIR, 'productos.json');
const FILE_VENT = path.join(DATA_DIR, 'ventas.json');

// ── Middleware ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Helpers File System ───────────────────────────────────────────────────
const leerJson      = async (file) => JSON.parse(await fs.readFile(file, 'utf-8'));
const escribirJson  = async (file, data) => fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');

// ── GET /productos → listar todos los productos ───────────────────────────
app.get('/productos', async (req, res) => {
  try {
    const productos = await leerJson(FILE_PROD);
    res.status(200).json(productos);
  } catch {
    res.status(500).json({ error: 'Error al leer productos' });
  }
});

// ── POST /producto → crear nuevo producto ─────────────────────────────────
app.post('/producto', async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({ error: 'Datos incompletos: se requiere nombre, precio y stock' });
    }

    const productos = await leerJson(FILE_PROD);

    // Verificar que no exista un producto con el mismo nombre
    if (productos.find(p => p.nombre.toLowerCase() === nombre.toLowerCase())) {
      return res.status(409).json({ error: 'Ya existe un producto con ese nombre' });
    }

    const nuevo = { id: uuidv4(), nombre, precio: Number(precio), stock: Number(stock) };
    productos.push(nuevo);
    await escribirJson(FILE_PROD, productos);
    res.status(201).json(nuevo);
  } catch {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// ── PUT /producto → actualizar producto existente ─────────────────────────
app.put('/producto', async (req, res) => {
  try {
    const { id, nombre, precio, stock } = req.body;
    if (!id) return res.status(400).json({ error: 'Se requiere el id del producto' });

    const productos = await leerJson(FILE_PROD);
    const idx = productos.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    // Actualizar solo los campos enviados
    if (nombre !== undefined) productos[idx].nombre = nombre;
    if (precio !== undefined) productos[idx].precio = Number(precio);
    if (stock  !== undefined) productos[idx].stock  = Number(stock);

    await escribirJson(FILE_PROD, productos);
    res.status(200).json(productos[idx]);
  } catch {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// ── DELETE /producto → eliminar producto por id ───────────────────────────
app.delete('/producto', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Se requiere el id del producto' });

    const productos = await leerJson(FILE_PROD);
    const filtrados = productos.filter(p => p.id !== id);
    if (filtrados.length === productos.length) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await escribirJson(FILE_PROD, filtrados);
    res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ── GET /ventas → listar todas las ventas ────────────────────────────────
app.get('/ventas', async (req, res) => {
  try {
    const ventas = await leerJson(FILE_VENT);
    res.status(200).json(ventas);
  } catch {
    res.status(500).json({ error: 'Error al leer ventas' });
  }
});

// ── POST /venta → registrar venta y descontar stock ───────────────────────
// El carrito se envía en el body: [{ id, nombre, precio, cantidad }]
app.post('/venta', async (req, res) => {
  try {
    const items = req.body; // array de items del carrito

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    const productos = await leerJson(FILE_PROD);

    // Verificar stock suficiente para todos los items
    for (const item of items) {
      const producto = productos.find(p => p.id === item.id);
      if (!producto) {
        return res.status(404).json({ error: `Producto ${item.nombre} no encontrado` });
      }
      if (producto.stock < item.cantidad) {
        return res.status(409).json({
          error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`
        });
      }
    }

    // Descontar stock
    for (const item of items) {
      const idx = productos.findIndex(p => p.id === item.id);
      productos[idx].stock -= item.cantidad;
    }
    await escribirJson(FILE_PROD, productos);

    // Calcular montos (precios incluyen IVA — se desglosa en boleta)
    const total    = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const neto     = Math.round(total / 1.19);
    const iva      = total - neto;

    // Registrar venta con UUID
    const venta = {
      id:     uuidv4(),
      fecha:  new Date().toLocaleString('es-CL'),
      items:  items.map(i => ({
        id:       i.id,
        nombre:   i.nombre,
        cantidad: i.cantidad,
        precio:   i.precio,
        subtotal: i.precio * i.cantidad
      })),
      neto,
      iva,
      total
    };

    const ventas = await leerJson(FILE_VENT);
    ventas.push(venta);
    await escribirJson(FILE_VENT, ventas);

    res.status(201).json(venta);
  } catch {
    res.status(500).json({ error: 'Error al procesar la venta' });
  }
});

// ── Iniciar servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Tienda online corriendo en http://localhost:${PORT}`);
});
