const rateLimit = require("express-rate-limit");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Demasiados intentos, porfavor intente después"
  }
});

router.post("/login", loginLimiter, async (req, res) => {
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

    // Usar bcrypt
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // ENVIAR TOKEN COMO COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true en producción (HTTPS)
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000 // 8 horas
    });

    // YA NO ENVIAR TOKEN
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
});

module.exports = router;