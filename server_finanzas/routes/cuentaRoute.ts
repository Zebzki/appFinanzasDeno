import { Router } from "../dependencies/dependencias.ts";
import { CuentaController } from "../controllers/cuentaController.ts";

const cuentaRouter = new Router();
const cuentaController = new CuentaController();

cuentaRouter
  .get("/cuenta", (ctx) => cuentaController.obtenerTodas(ctx)) // Listar TODAS
  .get("/cuenta/con-uso", (ctx) => cuentaController.obtenerConUso(ctx)) // Obtener con uso (ANTES del :id)
  .get("/cuenta/resumen", (ctx) => cuentaController.obtenerResumen(ctx)) // Resumen por tipo (ANTES del :id)
  .get("/cuenta/:id", (ctx) => cuentaController.obtenerPorId(ctx)) // Obtener por ID
  .get("/cuenta/:id/uso", (ctx) => cuentaController.verificarUso(ctx)) // Verificar uso
  .post("/cuenta", (ctx) => cuentaController.crear(ctx)) // Crear nueva
  .put("/cuenta/:id", (ctx) => cuentaController.actualizar(ctx)) // Actualizar
  .put("/cuenta/:id/saldo", (ctx) => cuentaController.actualizarSaldo(ctx)) // Actualizar solo saldo
  .delete("/cuenta/:id", (ctx) => cuentaController.eliminar(ctx)) // Eliminar
  .get("/cuentas/estadisticas", (ctx) => cuentaController.obtenerEstadisticas(ctx)); // Estadísticas

export default cuentaRouter;