console.log("1. Iniciando servidor");

const app = require('./aplicacion');

console.log("2. Aplicacion cargada");

const PUERTO = 3000;

app.listen(PUERTO, () => {
    console.log(`3. Servidor corriendo en http://localhost:${PUERTO}`);
});



