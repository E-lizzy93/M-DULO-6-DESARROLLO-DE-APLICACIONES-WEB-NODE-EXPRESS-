# Catálogo Netflix — Node.js API REST

Aplicación web con servidor REST y cliente web para gestionar un catálogo de películas y series.

## Tecnologías
- Node.js — Servidor web y API REST (sin dependencias externas)

## Instalación y uso

```bash
node server.js
```

Luego abre http://localhost:3000 en tu navegador.

## Estructura
```
├── server.js          # Servidor y API REST
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

## Formato de datos

**Películas** (`peliculas.txt`):
```
Nombre,Director,Año
```

**Series** (`series.txt`):
```
Nombre,Año,Temporadas
```
