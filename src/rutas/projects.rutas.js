const express = require("express");
const router = express.Router();

const db = require("../config/db");
const verificarToken = require("../middlewares/auth.middleware");

/* ===============================
   GET /api/projects
   =============================== */
router.get("/projects", verificarToken, async (req, res) => {

  try {

    let query;
    let params = [];

    if (req.usuario.rol === "admin") {

      query = "SELECT * FROM proyectos WHERE activo = true";

    } else {

      query = "SELECT * FROM proyectos WHERE id_creador = ? AND activo = true";
      params.push(req.usuario.id);

    }

    const [rows] = await db.query(query, params);

    res.json(rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

/* ===============================
   POST /api/projects
   =============================== */
router.post("/projects", verificarToken, async (req, res) => {
 
  const { id_proyecto, nombre, descripcion, ubicacion, fecha_inicio, fecha_creacion, activo } = req.body;

  // FORZAR usuario del token
  const id_creador = req.usuario.id;

  console.log("Usuario autenticado:", id_creador);

  try {

    const [result] = await db.query(
      `INSERT INTO proyectos (id_proyecto, id_creador, nombre, descripcion, 
                              ubicacion, fecha_inicio, fecha_creacion, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_proyecto, id_creador, nombre, descripcion, ubicacion, fecha_inicio, fecha_creacion, activo]
    );

    res.json({
      mensaje: "Proyecto creado",
      id: result.insertId
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


/* ===============================
   PUT /api/projects/:id
   =============================== */
router.put("/projects/:id", verificarToken, async (req, res) => {

  const id = req.params.id;
  const { nombre, descripcion, ubicacion, fecha_inicio } = req.body;

  try {

    // 1. Obtener proyecto
    const [rows] = await db.query(
      "SELECT id_creador FROM proyectos WHERE id_proyecto = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    const proyecto = rows[0];

    // 2. Validar dueño
    if (req.usuario.rol !== "admin" && proyecto.id_creador !== req.usuario.id) {
      return res.status(403).json({ mensaje: "No autorizado" });
    }

    // 3. Ejecutar update
    await db.query(
      `UPDATE proyectos 
       SET nombre = ?, descripcion = ?, ubicacion = ?, fecha_inicio = ?
       WHERE id_proyecto = ?`,
      [nombre, descripcion, ubicacion, fecha_inicio, id]
    );

    res.json({ mensaje: "Proyecto actualizado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


/* ===============================
   DELETE /api/projects/:id
   (soft delete)
   =============================== */
router.delete("/projects/:id", verificarToken, async (req, res) => {

  const id = req.params.id;

  try {

    // 1. Obtener proyecto
    const [rows] = await db.query(
      "SELECT id_creador FROM proyectos WHERE id_proyecto = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    const proyecto = rows[0];

    // 2. Verificar dueño (o permitir admin)
    if (req.usuario.rol !== "admin" && proyecto.id_creador !== req.usuario.id) {
      return res.status(403).json({ mensaje: "No autorizado" });
    }

    // 3. Soft delete
    await db.query(
      "UPDATE proyectos SET activo = false WHERE id_proyecto = ?",
      [id]
    );

    res.json({ mensaje: "Proyecto desactivado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


module.exports = router;