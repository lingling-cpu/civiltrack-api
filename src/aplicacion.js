const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* Rutas */
const estadoRutas = require("./rutas/estado.rutas");
const authRutas = require("./rutas/auth.rutas");
const projectRutas = require("./rutas/projects.rutas");

app.use("/api", estadoRutas);
app.use("/api/auth", authRutas);
app.use("/api", projectRutas);

module.exports = app;

