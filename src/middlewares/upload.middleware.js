const multer = require("multer");

// Guardar en memoria
const storage = multer.memoryStorage();

// Limitar tamaño a 5MB
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

const upload = multer({
  storage,
  limits
});

module.exports = upload;