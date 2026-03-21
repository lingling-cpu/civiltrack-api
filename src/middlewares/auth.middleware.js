const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {

  const token = req.cookies.token; // CAMBIO COOKIES

  if (!token) {
    return res.status(401).json({ mensaje: "No autenticado" });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = decoded;

    next();

  } catch (error) {

    return res.status(403).json({ mensaje: "Token inválido" });

  }

}

module.exports = verificarToken;