import { Router } from "../dependencies/dependencias.ts";
import { TipoCuentaController } from "../controllers/tipoCuentaController.ts";

const tipoCuentaRouter = new Router();
const tipoCuentaController = new TipoCuentaController();

tipoCuentaRouter
  .get("/tipo-cuenta", (ctx) => tipoCuentaController.obtenerTodos(ctx))              // Listar todos
  .get("/tipo-cuenta/:id", (ctx) => tipoCuentaController.obtenerPorId(ctx))          // Obtener por ID
  .post("/tipo-cuenta", (ctx) => tipoCuentaController.crear(ctx))                    // Crear nuevo
  .put("/tipo-cuenta/:id", (ctx) => tipoCuentaController.actualizar(ctx))            // Actualizar
  .delete("/tipo-cuenta/:id", (ctx) => tipoCuentaController.eliminar(ctx))           // Eliminar
  .get("/tipo-cuenta/:id/uso", (ctx) => tipoCuentaController.verificarUso(ctx));     // Verificar uso

export default tipoCuentaRouter;