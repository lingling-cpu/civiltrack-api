const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
    res.json({ mensaje: "CivilTrack API online" });
});

module.exports = router;

