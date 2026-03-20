# Portafolio M6 — E-commerce Backend REST

Backend REST con Node.js/Express para tienda online. Módulo 6

## ¿Qué hace la app?

Es una tienda online de ropa que conecta un frontend de una sola página (SPA) con un backend REST en Node.js/Express. El usuario puede navegar el catálogo de productos, agregarlos al carrito ajustando cantidades, y finalizar la compra con el botón "Comprar ahora".

Al comprar, el servidor:
1. Valida que haya stock suficiente para cada producto (si no, responde 409)
2. Descuenta automáticamente las unidades vendidas en `productos.json`
3. Calcula el desglose de la boleta: los precios incluyen IVA (19%), por lo que se extrae el monto neto y el IVA desde el total, sin modificar el precio que paga el cliente
4. Registra la venta con un ID único (UUID) y fecha en `ventas.json`
5. Retorna la venta completa al frontend para mostrar la confirmación

Las 3 vistas del frontend son:
- **Productos** → catálogo en grid de cards con stock visible
- **Carrito** → tabla con cantidades ajustables y desglose neto/IVA/total
- **Confirmación** → boleta con ID de venta, fecha y detalle de lo comprado

## Tecnologías
- **Node.js + Express** — Servidor y API REST
- **UUID** — IDs únicos para ventas
- **File System (fs)** — Persistencia en archivos JSON (sin base de datos)

## Instalación

```bash
npm install
```

## Ejecución

```bash
# Producción
npm start

# Desarrollo (con hot reload)
npm run dev
```

Luego abre http://localhost:3000 en tu navegador.

## Estructura

```
portafolio-m6/
├── server.js          # Servidor y API REST
├── package.json
├── README.md
├── data/
│   ├── productos.json # Base de datos de productos
│   └── ventas.json    # Registro de ventas
└── public/
    ├── index.html     # Frontend (3 vistas: Productos, Carrito, Confirmación)
    └── style.css      # Estilos
```

## Endpoints API

| Método | Ruta | Descripción | Código éxito |
|--------|------|-------------|--------------|
| GET | `/productos` | Listar todos los productos con stock | 200 |
| POST | `/producto` | Crear nuevo producto | 201 |
| PUT | `/producto` | Actualizar producto existente | 200 |
| DELETE | `/producto` | Eliminar producto por id | 200 |
| GET | `/ventas` | Listar todas las ventas | 200 |
| POST | `/venta` | Registrar venta y descontar stock | 201 |

## Códigos de estado HTTP

| Código | Situación |
|--------|-----------|
| 200 | Consulta / actualización exitosa |
| 201 | Creación exitosa (producto o venta) |
| 400 | Datos incompletos o inválidos |
| 404 | Producto no encontrado |
| 409 | Conflicto: nombre duplicado o stock insuficiente |
| 500 | Error interno del servidor |

## Lógica de IVA (Chile)

Los precios de venta en Chile incluyen IVA. El desglose en boleta se calcula así:

```
Total     = precio × cantidad        (lo que paga el cliente, no cambia)
Neto      = round(total / 1.19)      (precio sin IVA)
IVA (19%) = total - neto             (impuesto separado)
```
