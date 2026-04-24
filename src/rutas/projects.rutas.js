const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const db = require("../config/db");
const verificarToken = require("../middlewares/auth.middleware");

const upload = require("../middlewares/upload.middleware");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const PDFDocument = require("pdfkit");
const axios = require("axios");
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
      
      // VALIDACIÓN
      if (!titulo || !descripcion) {
        return res.status(400).json({ error: "Título y descripción requeridos" });
      }

      let url = null;

      // SOLO subir si hay archivo
      if (req.file) {

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
        url = resultado.secure_url;
      }

      // INSERTAR BITÁCORA SIEMPRE
      const [bitacoraResult] = await db.query(
        `INSERT INTO bitacora (id_proyecto, id_usuario, titulo, descripcion, fecha_registro)
         VALUES (?, ?, ?, ?, NOW())`,
        [id_proyecto, id_usuario, titulo, descripcion]
      );

      const id_bitacora = bitacoraResult.insertId;

      // INSERTAR FOTO SOLO SI EXISTE
      if (url) {
        await db.query(
          `INSERT INTO fotos (id_bitacora, url_foto, fecha_subida)
           VALUES (?, ?, NOW())`,
          [id_bitacora, url]
        );
      }

      // RESPUESTA
      res.status(201).json({
        mensaje: "Bitácora creada",
        bitacora_id: id_bitacora,
        url: url // puede ser null
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  }
);

/* ===============================
   GET /api/proyectos/:id_proyecto/bitacora
   =============================== */
router.get(
  "/proyectos/:id_proyecto/bitacora",
  verificarToken,
  async (req, res) => {

    const { id_proyecto } = req.params;

    try {

      // VALIDAR PERMISOS
      let queryPermiso;
      let paramsPermiso = [id_proyecto];

      if (req.usuario.rol === "admin") {
        queryPermiso = `
          SELECT nombre 
          FROM proyectos 
          WHERE id_proyecto = ?
        `;
      } else {
        queryPermiso = `
          SELECT nombre 
          FROM proyectos 
          WHERE id_proyecto = ? AND id_creador = ?
        `;
        paramsPermiso.push(req.usuario.id);
      }

      const [proyectoRows] = await db.query(queryPermiso, paramsPermiso);

      if (proyectoRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "No tienes permiso para ver este proyecto"
        });
      }
      
      const [rows] = await db.query(
        `SELECT 
          b.id_bitacora,
          b.titulo,
          b.descripcion,
          b.fecha_registro,
          u.nombre AS autor,
          f.url_foto
        FROM bitacora b
        LEFT JOIN usuarios u ON b.id_usuario = u.id_usuario
        LEFT JOIN fotos f ON b.id_bitacora = f.id_bitacora
        WHERE b.id_proyecto = ?
        ORDER BY b.fecha_registro DESC`,
        [id_proyecto]
      );

      // Agrupar
      const mapa = {};

      rows.forEach(row => {

        if (!mapa[row.id_bitacora]) {
          mapa[row.id_bitacora] = {
            id_bitacora: row.id_bitacora,
            titulo: row.titulo,
            descripcion: row.descripcion,
            fecha_registro: row.fecha_registro,
            autor: row.autor,
            fotos: []
          };
        }

        if (row.url_foto) {
          mapa[row.id_bitacora].fotos.push(row.url_foto);
        }

      });

      res.json({
        success: true,
        proyecto: {
          nombre: proyectoRows[0].nombre
        },
        reportes: Object.values(mapa)
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }

  }
);

/* ===============================
   GET /api/proyectos/:id_proyecto/pdf
   =============================== */
router.get(
  "/proyectos/:id_proyecto/pdf",
  verificarToken,
  async (req, res) => {

    const { id_proyecto } = req.params;

    try {

      //Validar permisos
      let queryPermiso;
      let paramsPermiso = [id_proyecto];

      if (req.usuario.rol === "admin") {
        queryPermiso = `
          SELECT nombre 
          FROM proyectos 
          WHERE id_proyecto = ?
        `;
      } else {
        queryPermiso = `
          SELECT nombre 
          FROM proyectos 
          WHERE id_proyecto = ? AND id_creador = ?
        `;
        paramsPermiso.push(req.usuario.id);
      }

      const [proyectoRows] = await db.query(queryPermiso, paramsPermiso);

      if (proyectoRows.length === 0) {
        return res.status(403).json({ message: "No autorizado" });
      }

      const nombreProyecto = proyectoRows[0].nombre;

      //Query
      const [rows] = await db.query(
        `SELECT 
          b.id_bitacora,
          b.titulo,
          b.descripcion,
          b.fecha_registro,
          u.nombre AS autor,
          f.url_foto
        FROM bitacora b
        LEFT JOIN usuarios u ON b.id_usuario = u.id_usuario
        LEFT JOIN fotos f ON b.id_bitacora = f.id_bitacora
        WHERE b.id_proyecto = ?
        ORDER BY b.fecha_registro DESC`,
        [id_proyecto]
      );

      //Agrupar
      const mapa = {};

      rows.forEach(row => {
        if (!mapa[row.id_bitacora]) {
          mapa[row.id_bitacora] = {
            titulo: row.titulo,
            descripcion: row.descripcion,
            fecha_registro: row.fecha_registro,
            autor: row.autor,
            fotos: []
          };
        }

        if (row.url_foto) {
          mapa[row.id_bitacora].fotos.push(row.url_foto);
        }
      });

      const reportes = Object.values(mapa);

      //PDF
      const doc = new PDFDocument({
        size: "LETTER",
        margin: 50
      });

      doc.on("error", (err) => {
        console.error("PDF error:", err);
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename=reporte_${id_proyecto}.pdf`
      );

      doc.pipe(res);

      //Header
      doc.fontSize(20).fillColor("#0a3d62")
        .text("Reporte de Obra", { align: "center" });

      doc.moveDown(0.5);

      doc.fontSize(16).fillColor("#000")
        .text(nombreProyecto, { align: "center" });

      doc.moveDown(2);

      //Contenido
      for (const reporte of reportes) {

        const fecha = new Date(reporte.fecha_registro);

        const fechaFormateada = fecha.toLocaleDateString("es-MX", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        const hora = fecha.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit"
        });

        doc.fontSize(12).fillColor("#3a3a3a")
          .text(`${fechaFormateada} - ${hora}`);

        doc.text(`${reporte.autor}`);

        doc.moveDown(0.5);

        doc.fontSize(15).fillColor("#000")
          .text(reporte.titulo, { underline: true });

        doc.moveDown(0.5);

        doc.fontSize(14).fillColor("#000")
          .text(reporte.descripcion, { align: "justify" });

        doc.moveDown();

        //Imagenes
        for (const url of reporte.fotos) {
          try {

            const response = await axios.get(url, {
              responseType: "arraybuffer"
            });

            const buffer = Buffer.from(response.data, "binary");

            doc.image(buffer, {
              fit: [250, 250],   // tamaño máximo
              align: "center"  
            });

            doc.moveDown();

          } catch (error) {
            console.log("Error cargando imagen:", error.message);
          }
        }

        doc.moveDown();

        // Separador
        doc.strokeColor("#cccccc")
          .lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown(1.5);
      }

      doc.end();

    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  }
);

module.exports = router;