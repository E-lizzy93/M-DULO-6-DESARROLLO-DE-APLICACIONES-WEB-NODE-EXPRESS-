const express          = require('express');
const path             = require('path');
const { promises: fs } = require('fs');

const app     = express();
const PORT    = 3000;
const ARCHIVO = path.join(__dirname, 'data', 'mascotas.json');

// ── Middleware ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Helpers File System ───────────────────────────────────────────────────
const leerMascotas    = async ()      => JSON.parse(await fs.readFile(ARCHIVO, 'utf-8'));
const guardarMascotas = async (datos) => fs.writeFile(ARCHIVO, JSON.stringify(datos, null, 2), 'utf-8');

// Genera ID compuesto: REG-00001-12345678-9
function generarId(mascotas, rut) {
  const nums = mascotas
    .map(m => parseInt(m.id?.split('-')[1]))
    .filter(n => !isNaN(n));
  const siguiente = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `REG-${String(siguiente).padStart(5, '0')}-${rut}`;
}

// ── GET /mascotas → todas | ?nombre=X | ?rut=X ───────────────────────────
app.get('/mascotas', async (req, res) => {
  try {
    const mascotas        = await leerMascotas();
    const { nombre, rut } = req.query;

    if (nombre) {
      const mascota = mascotas.find(m => m.nombre.toLowerCase() === nombre.toLowerCase());
      if (!mascota) return res.status(404).json({ error: `No se encontró mascota con nombre "${nombre}"` });
      return res.status(200).json(mascota);
    }

    if (rut) {
      const resultado = mascotas.filter(m => m.rut === rut);
      if (resultado.length === 0) return res.status(404).json({ error: `No hay mascotas registradas para el RUT ${rut}` });
      return res.status(200).json(resultado);
    }

    const { especie } = req.query;
    if (especie) {
      const resultado = mascotas.filter(m => m.especie.toLowerCase() === especie.toLowerCase());
      if (resultado.length === 0) return res.status(404).json({ error: `No hay mascotas de especie "${especie}" registradas` });
      return res.status(200).json(resultado);
    }

    res.status(200).json(mascotas);

  } catch {
    res.status(500).json({ error: 'Error al leer el archivo de mascotas' });
  }
});

// ── POST /mascotas → registrar nueva mascota ──────────────────────────────
app.post('/mascotas', async (req, res) => {
  try {
    const { nombre, especie, rut } = req.body;

    if (!nombre || !especie || !rut) {
      return res.status(400).json({ error: 'Se requiere nombre, especie y rut' });
    }

    const mascotas = await leerMascotas();

    // Validar: mismo dueño no puede tener dos mascotas con el mismo nombre
    const yaExiste = mascotas.find(
      m => m.rut === rut && m.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (yaExiste) {
      return res.status(409).json({
        error: `El dueño con RUT ${rut} ya tiene una mascota llamada "${nombre}" (ID: ${yaExiste.id})`
      });
    }

    const nuevaMascota = { id: generarId(mascotas, rut), nombre, especie, rut };
    mascotas.push(nuevaMascota);
    await guardarMascotas(mascotas);

    res.status(201).json({ mensaje: 'Mascota registrada correctamente', mascota: nuevaMascota });

  } catch {
    res.status(500).json({ error: 'Error al registrar la mascota' });
  }
});

// ── DELETE /mascotas?nombre=X → elimina mascota (dueño sigue existiendo) ──
// ── DELETE /mascotas?rut=X   → elimina dueño y todas sus mascotas ─────────
app.delete('/mascotas', async (req, res) => {
  try {
    const { nombre, rut } = req.query;

    if (!nombre && !rut) {
      return res.status(400).json({ error: 'Se requiere parámetro nombre o rut' });
    }

    const mascotas = await leerMascotas();

    if (nombre) {
      const filtradas = mascotas.filter(m => m.nombre.toLowerCase() !== nombre.toLowerCase());
      if (filtradas.length === mascotas.length) {
        return res.status(404).json({ error: `No se encontró mascota con nombre "${nombre}"` });
      }
      await guardarMascotas(filtradas);
      return res.status(200).json({ mensaje: `Mascota "${nombre}" eliminada. El dueño sigue registrado con sus otras mascotas.` });
    }

    if (rut) {
      const filtradas  = mascotas.filter(m => m.rut !== rut);
      const eliminadas = mascotas.length - filtradas.length;
      if (eliminadas === 0) {
        return res.status(404).json({ error: `No hay mascotas registradas para el RUT ${rut}` });
      }
      await guardarMascotas(filtradas);
      return res.status(200).json({
        mensaje: `${eliminadas} mascota(s) eliminada(s). El RUT ${rut} ya no tiene mascotas registradas.`
      });
    }

  } catch {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

// ── Iniciar servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🐾 Registro Civil de Mascotas corriendo en http://localhost:${PORT}`);
});
