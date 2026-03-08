const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const router = express.Router();

router.post("/login", async (req, res) => {
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

    const passwordValido = password === usuario.password;

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

    res.json({
      token,
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