// Importamos las librerías necesarias
const express = require('express');
const mysql = require('mysql2');

// Creamos la aplicación Express
const app = express();

// Puerto del servidor
const puerto = 3000;


/*
Configuración de conexión a MySQL
*/
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'tu_password_aqui',
    database: 'conductores_db'
});


/*
Endpoint: obtener todos los conductores
Consulta la tabla conductores
*/
app.get('/conductores', (req, res) => {

    const sql = 'SELECT * FROM conductores';

    conexion.query(sql, (error, resultados) => {

        if (error) {
            res.status(500).send('Error al obtener conductores');
            return;
        }

        res.json(resultados);

    });

});


/*
Endpoint: obtener todos los automóviles
Consulta la tabla automoviles
*/
app.get('/automoviles', (req, res) => {

    const sql = 'SELECT * FROM automoviles';

    conexion.query(sql, (error, resultados) => {

        if (error) {
            res.status(500).send('Error al obtener automóviles');
            return;
        }

        res.json(resultados);

    });

});


/*
Endpoint: obtener automóviles de un conductor específico
Ejemplo: /automoviles/Francisco
*/
app.get('/automoviles/:nombre', (req, res) => {

    const nombre = req.params.nombre;

    const sql = 'SELECT * FROM automoviles WHERE nombre_conductor = ?';

    conexion.query(sql, [nombre], (error, resultados) => {

        if (error) {
            res.status(500).send('Error al buscar automóviles');
            return;
        }

        res.json(resultados);

    });

});


// Iniciamos el servidor
app.listen(puerto, () => {

    console.log(`Servidor ejecutándose en http://localhost:${puerto}`);

});

