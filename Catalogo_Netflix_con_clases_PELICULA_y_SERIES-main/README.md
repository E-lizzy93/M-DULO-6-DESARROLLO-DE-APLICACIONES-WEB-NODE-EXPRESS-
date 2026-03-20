# Catálogo Netflix — Clases + API REST

Igual que la actividad anterior pero usando clases `Pelicula` y `Serie` en un archivo separado.

## Tecnologías
- Node.js — Servidor y API REST (sin dependencias externas)

## Instalación y uso

```bash
node server.js
```

Luego abre http://localhost:3000 en tu navegador.

## Estructura
```
├── server.js          # Servidor principal y rutas
├── modelos.js         # Clases Pelicula y Serie
├── peliculas.txt      # Base de datos de películas
├── series.txt         # Base de datos de series
└── public/
    └── index.html     # Cliente web
```

## Endpoints API
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/catalogo?tipo=peliculas` | Lista todas las películas |
| GET | `/catalogo?tipo=series` | Lista todas las series |
| POST | `/catalogo?tipo=peliculas` | Agrega una película |
| POST | `/catalogo?tipo=series` | Agrega una serie |
| DELETE | `/catalogo?tipo=peliculas&nombre=The Matrix` | Elimina por nombre |
