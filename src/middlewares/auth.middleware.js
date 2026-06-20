const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      mensaje: "Sesión expirada"
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = decoded;

    // Renovar sesión otros 15 minutos
    const nuevoToken = jwt.sign(
      {
        id: decoded.id,
        rol: decoded.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m"
      }
    );

    res.cookie("token", nuevoToken, {
      httpOnly: true,
      secure: false, // true con HTTPS
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    });

    next();

  } catch (error) {

    res.clearCookie("token");

    return res.status(401).json({
      mensaje: "Sesión expirada"
    });

  }

}

module.exports = verificarToken;