console.log("1. Iniciando servidor");

const app = require('./aplicacion');
const authRoutes = require('./rutas/auth.rutas');

console.log("2. Aplicacion cargada");

app.use("/api/auth", authRoutes);

const PUERTO = 3000;

app.listen(PUERTO, () => {
    console.log(`3. Servidor corriendo en http://localhost:${PUERTO}`);
});



