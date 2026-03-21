const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser"); 

const app = express();

/* Seguridad */
app.use(helmet());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true 
}));

app.use(express.json({ limit: "10kb" }));

app.use(cookieParser());

/* Rutas */
const estadoRutas = require("./rutas/estado.rutas");
const authRutas = require("./rutas/auth.rutas");
const projectRutas = require("./rutas/projects.rutas");

app.use("/api", estadoRutas);
app.use("/api/auth", authRutas);
app.use("/api", projectRutas);

module.exports = app;

