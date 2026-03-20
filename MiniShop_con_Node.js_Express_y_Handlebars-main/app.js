const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuración de Handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  helpers: {
    // Helper que convierte texto a mayúsculas
    mayusculas: (texto) => texto.toUpperCase()
  }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Archivos estáticos (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Leer datos de formularios POST
app.use(express.urlencoded({ extended: false }));

// Datos de la tienda
const tienda*= {
  nombre: 'MiniShop',
  bienvenida: '¡Encuentra los mejores productos al mejor precio!'
};

const productos = [
  { 
  nombre: "Camiseta Básica", 
  precio: 15, 
  disponible: true, 
  imagen: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600"
  },
  { 
  nombre: "Pantalón Jeans", 
  precio: 30, 
  disponible: false, 
  imagen: "https://images.unsplash.com/photo-1583005008627-cf9c4e1a9d6d?w=600"
  },
  { 
  nombre: "Zapatos Deportivos", 
  precio: 50, 
  disponible: true, 
  imagen: "https://images.unsplash.com/photo-1528701800489-20be8c01c1a3?w=600"
  },
  { 
  nombre: "Chaqueta de Cuero", 
  precio: 80, 
  disponible: true, 
  imagen: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"
  },
  { 
  nombre: "Gorra Clásica", 
  precio: 12, 
  disponible: true, 
  imagen: "https://images.unsplash.com/photo-1526170375885-bf2f5f0f3e3a?w=600"
  },
  { 
  nombre: "Bolso de Mano", 
  precio: 45, 
  disponible: false, 
  imagen: "https://images.unsplash.com/photo-1526170375885-43f5d6d4f00f?w=600"
  },
  { 
  nombre: "Reloj Digital", 
  precio: 60, 
  disponible: true, 
  imagen: "https://images.unsplash.com/photo-1526170375885-6c60d6f0f47f?w=600"
  },
  { 
  nombre: "Bufanda de Lana", 
  precio: 18, 
  disponible: true, 
  imagen: "https://images.unsplash.com/photo-1526170375885-6b73d6d0f0aa?w=600"
  },
  { 
  nombre: "Sudadera Hoodie", 
  precio: 35, 
  disponible: false, 
  imagen: "https://images.unsplash.com/photo-1526170375885-9f25d6f0f077?w=600"
  },
  { 
  nombre: "Gafas de Sol", 
  precio: 25, 
  disponible: true, 
  imagen: "https://images.unsplash.com/photo-1526170375885-fc40d6f0f0cc?w=600"
  }
];


// RUTAS

// GET / → Página principal con productos
app.get('/', (req, res) => {
  res.render('home', {
    nombreTienda: tienda.nombre,
    bienvenida: tienda.bienvenida,
    productos: productos
  });
});

// GET /about → Información de la tienda
app.get('/about', (req, res) => {
  res.render('about', { nombreTienda: tienda.nombre });
});

// GET /contact → Formulario de contacto
app.get('/contact', (req, res) => {
  res.render('contact', { nombreTienda: tienda.nombre });
});

// POST /contact → Procesar formulario y mostrar confirmación
app.post('/contact', (req, res) => {
  const { nombre } = req.body;
  res.render('success', { nombre: nombre });
});

// Métodos no permitidos en rutas válidas
app.all('/', (req, res) => res.status(405).send('Método no permitido'));
app.all('/about', (req, res) => res.status(405).send('Método no permitido'));
app.all('/contact', (req, res) => res.status(405).send('Método no permitido'));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`MiniShop corriendo en http://localhost:${PORT}`);
});
