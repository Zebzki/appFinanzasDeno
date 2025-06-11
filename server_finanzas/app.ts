import { Application, oakCors } from "./dependencies/dependencias.ts";
import { loginRouter } from "./routes/loginRoute.ts";
import { usuarioRouter } from "./routes/usuarioRoute.ts";
import categoriaRouter from "./routes/categoriaRoute.ts";
import cuentaRouter from "./routes/cuentaRoute.ts";
import tipoCuentaRouter from "./routes/tipoCuentaRoute.ts";

const app = new Application();

app.use(oakCors());

const rutas = [
  loginRouter, 
  usuarioRouter, 
  categoriaRouter, 
  cuentaRouter,
  tipoCuentaRouter
];

rutas.forEach(r => {
    app.use(r.allowedMethods());
    app.use(r.routes());
});

console.log("servidor encendido en el puerto 8000:)");
app.listen({ port: 8000 });