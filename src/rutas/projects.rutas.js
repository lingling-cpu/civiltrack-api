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

  const { id_proyecto, id_creador, nombre, descripcion, ubicacion, fecha_inicio, fecha_creacion, activo } = req.body;

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
   (estructura por ahora)
   =============================== */
router.put("/projects/:id", verificarToken, async (req, res) => {

  const id = req.params.id;

  res.json({
    mensaje: "Endpoint para editar proyecto listo",
    id
  });

});


/* ===============================
   DELETE /api/projects/:id
   (soft delete)
   =============================== */
router.delete("/projects/:id", verificarToken, async (req, res) => {

  const id = req.params.id;

  try {

    await db.query(
      "UPDATE proyectos SET activo = false WHERE id_proyecto = ?",
      [id]
    );

    res.json({
      mensaje: "Proyecto desactivado"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


module.exports = router;