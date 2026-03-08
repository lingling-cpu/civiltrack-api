const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');

router.get('/status', (req, res) => {
    res.json({ mensaje: "CivilTrack API online" });
});

router.get('/status-protegido', verificarToken, (req, res) => {
    res.json({
        mensaje: "Ruta protegida",
        usuario: req.usuario
    });
});

module.exports = router;

