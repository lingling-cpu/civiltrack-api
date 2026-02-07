const express = require('express');
const rutasEstado = require('./rutas/estado.rutas');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API CivilTrack funcionando');
});

// rutas
app.use('/api', rutasEstado);

module.exports = app;

