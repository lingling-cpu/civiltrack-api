const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const db = require("../config/db");
const verificarToken = require("../middlewares/auth.middleware");

const upload = require("../middlewares/upload.middleware");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

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
router.post(
  "/projects",
  verificarToken,
  [
    body("nombre").notEmpty().isLength({ max: 100 }).trim().escape(),
    body("descripcion").notEmpty().isLength({ max: 255 }).trim().escape(),
    body("ubicacion").notEmpty().isLength({ max: 100 }).trim().escape(),
    body("fecha_inicio").isISO8601(),
    body("activo").isBoolean()
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { id_proyecto, nombre, descripcion, ubicacion, fecha_inicio, fecha_creacion, activo } = req.body;
    const id_creador = req.usuario.id;

    try {

      const [result] = await db.query(
        `INSERT INTO proyectos 
        (id_proyecto, id_creador, nombre, descripcion, ubicacion, fecha_inicio, fecha_creacion, activo)
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
  }
);

/* ===============================
   PUT /api/projects/:id
   =============================== */
router.put(
  "/projects/:id",
  verificarToken,
  [
    body("nombre").optional().isLength({ max: 100 }).trim().escape(),
    body("descripcion").optional().isLength({ max: 255 }).trim().escape(),
    body("ubicacion").optional().isLength({ max: 100 }).trim().escape(),
    body("fecha_inicio").optional().isISO8601()
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const id = req.params.id;
    const { nombre, descripcion, ubicacion, fecha_inicio } = req.body;

    try {

      const [rows] = await db.query(
        "SELECT id_creador FROM proyectos WHERE id_proyecto = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ mensaje: "Proyecto no encontrado" });
      }

      const proyecto = rows[0];

      if (req.usuario.rol !== "admin" && proyecto.id_creador !== req.usuario.id) {
        return res.status(403).json({ mensaje: "No autorizado" });
      }

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
  }
);

/* ===============================
   DELETE /api/projects/:id
   =============================== */
router.delete("/projects/:id", verificarToken, async (req, res) => {

  const id = req.params.id;

  try {

    const [rows] = await db.query(
      "SELECT id_creador FROM proyectos WHERE id_proyecto = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    const proyecto = rows[0];

    if (req.usuario.rol !== "admin" && proyecto.id_creador !== req.usuario.id) {
      return res.status(403).json({ mensaje: "No autorizado" });
    }

    await db.query(
      "UPDATE proyectos SET activo = false WHERE id_proyecto = ?",
      [id]
    );

    res.json({ mensaje: "Proyecto desactivado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   POST /api/proyectos/:id/bitacora
   =============================== */
router.post(
  "/proyectos/:id/bitacora",
  verificarToken,
  upload.single("imagen"),
  async (req, res) => {

    const id_proyecto = req.params.id;
    const id_usuario = req.usuario.id;
    const { titulo, descripcion } = req.body;

    try {

      // VALIDACIONES
      if (!titulo || !descripcion) {
        return res.status(400).json({ error: "Título y descripción requeridos" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Archivo requerido" });
      }

      // SUBIR A CLOUDINARY
      const subirArchivo = () => {
        return new Promise((resolve, reject) => {

          const stream = cloudinary.uploader.upload_stream(
            { folder: "bitacora" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const resultado = await subirArchivo();
      const url = resultado.secure_url;

      // INSERTAR BITÁCORA
      const [bitacoraResult] = await db.query(
        `INSERT INTO bitacora (id_proyecto, id_usuario, titulo, descripcion, fecha_registro)
         VALUES (?, ?, ?, ?, NOW())`,
        [id_proyecto, id_usuario, titulo, descripcion]
      );

      const id_bitacora = bitacoraResult.insertId;

      // INSERTAR FOTO
      await db.query(
        `INSERT INTO fotos (id_bitacora, url_foto, fecha_subida)
         VALUES (?, ?, NOW())`,
        [id_bitacora, url]
      );

      // RESPUESTA FINAL
      res.status(201).json({
        mensaje: "Bitácora creada",
        bitacora_id: id_bitacora,
        url: url
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  }
);

module.exports = router;