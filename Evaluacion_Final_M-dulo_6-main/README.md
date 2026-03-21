# Evaluación 4 — Registro Civil de Mascotas

Sistema web del Ministerio de las Mascotas del Gobierno de Chile. Permite registrar, consultar y eliminar mascotas con su especie y RUT del dueño.

## ¿Qué hace?

Cada mascota registrada recibe un **ID único compuesto** con el formato:

```
REG-00001-12345678-9
  │       └─ RUT del dueño
  └─ número correlativo autoincremental
```

Esto permite identificar de forma única cada registro y saber a qué dueño pertenece solo con el ID.

**Lógica de negocio:**
- Un mismo dueño (RUT) no puede tener dos mascotas con el mismo nombre
- Al eliminar por RUT → se eliminan todas las mascotas de ese dueño
- Al eliminar por nombre → solo se elimina esa mascota, el dueño sigue registrado con las demás

## Tecnologías
- **Node.js + Express** — Backend y API REST
- **File System (fs.promises)** — Persistencia en `data/mascotas.json`
- **Axios (CDN)** — Peticiones HTTP desde el frontend

## Instalación y uso

```bash
npm install
npm start
```

Para desarrollo con reinicio automático:
```bash
npm run dev
```

Luego abre http://localhost:3000

## Estructura del proyecto

```
evaluacion4/
├── server.js
├── package.json
├── README.md
├── data/
│   └── mascotas.json
└── public/
    ├── style.css
    ├── index.html       → Menú principal
    ├── mascotas.html    → Listado completo
    ├── registrar.html   → Registrar nueva mascota
    ├── buscar.html      → Buscar por nombre, RUT o especie
    └── eliminar.html    → Eliminar por nombre o RUT
```

## Endpoints API

| Método | Ruta | Parámetro | Descripción |
|--------|------|-----------|-------------|
| GET | `/mascotas` | — | Retorna todas las mascotas |
| GET | `/mascotas` | `?nombre=X` | Retorna mascota por nombre |
| GET | `/mascotas` | `?rut=X` | Retorna mascotas por RUT del dueño |
| GET | `/mascotas` | `?especie=X` | Retorna mascotas por especie |
| POST | `/mascotas` | body: `{nombre, especie, rut}` | Registra nueva mascota |
| DELETE | `/mascotas` | `?nombre=X` | Elimina mascota por nombre |
| DELETE | `/mascotas` | `?rut=X` | Elimina todas las mascotas del RUT |

## Estructura de una mascota en el JSON

```json
{
  "id":      "REG-00001-12345678-9",
  "nombre":  "Firulais",
  "especie": "perro",
  "rut":     "12345678-9"
}
```

## Códigos HTTP

| Código | Situación |
|--------|-----------|
| 200 | Consulta / eliminación exitosa |
| 201 | Mascota registrada correctamente |
| 400 | Campos faltantes |
| 404 | Mascota o RUT no encontrado |
| 409 | El dueño ya tiene una mascota con ese nombre |
| 500 | Error interno del servidor |

## 🚀 Desafío opcional

Como mejora al sistema, se propone agregar la **fecha de nacimiento** de la mascota:

- Agregar campo `fechaNacimiento` (formato `YYYY-MM-DD`) al registrar
- Calcular y mostrar la **edad en años** al listar
- Validar que la fecha no sea futura
- Filtrar mascotas por rango de edad (ej: `?edadMin=1&edadMax=5`)

Esto permitiría tener un registro más completo y realizar estadísticas como promedio de edad por especie.
