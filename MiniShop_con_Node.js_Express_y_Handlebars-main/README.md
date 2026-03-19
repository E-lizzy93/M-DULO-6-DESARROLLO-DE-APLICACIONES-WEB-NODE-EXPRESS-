# MiniShop — Node.js + Express + Handlebars

Aplicación web de tienda ficticia con productos, formulario de contacto e información de la tienda.

## Tecnologías
- [Express](https://expressjs.com/) — Servidor web
- [Express-Handlebars](https://github.com/express-handlebars/express-handlebars) — Motor de plantillas

## Instalación y uso

```bash
npm install
npm start
```

Luego abre http://localhost:3000 en tu navegador.

## Estructura
```
├── app.js                        # Servidor principal y rutas
├── public/css/style.css          # Estilos
└── views/
    ├── layouts/main.handlebars   # Layout base
    ├── partials/                 # Navbar y footer reutilizables
    ├── home.handlebars           # Página principal con productos
    ├── about.handlebars          # Información de la tienda
    ├── contact.handlebars        # Formulario de contacto
    └── success.handlebars        # Confirmación de envío
```

## Rutas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Lista de productos |
| GET | `/about` | Información de la tienda |
| GET | `/contact` | Formulario de contacto |
| POST | `/contact` | Procesa el formulario |
