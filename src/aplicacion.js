const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser"); 

const app = express();

/* ===============================
   SEGURIDAD
   =============================== */
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true 
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/* ===============================
   RUTAS
   =============================== */
const estadoRutas = require("./rutas/estado.rutas");
const authRutas = require("./rutas/auth.rutas");
const projectRutas = require("./rutas/projects.rutas");

app.use("/api", estadoRutas);
app.use("/api/auth", authRutas);
app.use("/api", projectRutas);

/* ===============================
   MANEJO DE ERRORES
   =============================== */
app.use((err, req, res, next) => {

  // Error de tamaño de archivo
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "El archivo supera el límite de 5MB"
    });
  }

  console.error("ERROR GLOBAL:", err);

  res.status(500).json({
    error: err.message || "Error interno del servidor"
  });
});

module.exports = app;