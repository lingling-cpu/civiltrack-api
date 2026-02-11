const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

/* Middlewares */
app.use(express.json());

/* Rutas */
const estadoRutas = require("./rutas/estado.rutas");
app.use("/api", estadoRutas);

module.exports = app;

