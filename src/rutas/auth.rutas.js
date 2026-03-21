const rateLimit = require("express-rate-limit");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

// VALIDADOR
const { body, validationResult } = require("express-validator");

const router = express.Router();

/* ===============================
   RATE LIMIT LOGIN
   =============================== */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Demasiados intentos, por favor intente después"
  }
});

/* ===============================
   POST /api/auth/login
   =============================== */
router.post(
  "/login",
  loginLimiter,

  // VALIDACIONES
  [
    body("correo")
      .isEmail()
      .withMessage("Correo inválido")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres")
      .trim()
  ],

  async (req, res) => {

    // VALIDAR ERRORES
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errores: errors.array()
      });
    }

    const { correo, password } = req.body;

    try {

      const [rows] = await db.query(
        "SELECT * FROM usuarios WHERE correo = ?",
        [correo]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      const usuario = rows[0];

      // bcrypt
      const passwordValido = await bcrypt.compare(password, usuario.password);

      if (!passwordValido) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      // JWT
      const token = jwt.sign(
        {
          id: usuario.id_usuario,
          rol: usuario.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      // COOKIE SEGURA
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // true en producción (HTTPS)
        sameSite: "strict",
        maxAge: 8 * 60 * 60 * 1000
      });

      // RESPUESTA SIN TOKEN
      res.json({
        mensaje: "Login exitoso",
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          rol: usuario.rol
        }
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  }
);

module.exports = router;