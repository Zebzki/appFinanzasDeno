import { Router } from "../dependencies/dependencias.ts";
import { CuentaController } from "../controllers/cuentaController.ts";

const cuentaRouter = new Router();
const cuentaController = new CuentaController();

cuentaRouter
  // Rutas generales
  .get("/cuenta", (ctx) => cuentaController.obtenerTodas(ctx)) // Listar TODAS las cuentas
  .get("/cuenta/con-uso", (ctx) => cuentaController.obtenerConUso(ctx)) // Obtener todas con uso
  .get("/cuenta/resumen", (ctx) => cuentaController.obtenerResumen(ctx)) // Resumen general por tipo
  .get("/cuentas/estadisticas", (ctx) => cuentaController.obtenerEstadisticas(ctx)) // Estadísticas generales
  
  // Rutas específicas por usuario
  .get("/usuario/:usuarioId/cuenta", (ctx) => cuentaController.obtenerPorUsuario(ctx)) // Cuentas de un usuario específico
  .get("/usuario/:usuarioId/cuenta/con-uso", (ctx) => cuentaController.obtenerConUsoPorUsuario(ctx)) // Cuentas con uso de un usuario
  .get("/usuario/:usuarioId/cuenta/resumen", (ctx) => cuentaController.obtenerResumenPorUsuario(ctx)) // Resumen por usuario
  .get("/usuario/:usuarioId/cuenta/estadisticas", (ctx) => cuentaController.obtenerEstadisticasPorUsuario(ctx)) // Estadísticas por usuario
  
  // Rutas individuales de cuenta
  .get("/cuenta/:id", (ctx) => cuentaController.obtenerPorId(ctx)) // Obtener cuenta por ID
  .get("/cuenta/:id/uso", (ctx) => cuentaController.verificarUso(ctx)) // Verificar uso de una cuenta
  
  // Operaciones CRUD
  .post("/cuenta", (ctx) => cuentaController.crear(ctx)) // Crear nueva cuenta
  .put("/cuenta/:id", (ctx) => cuentaController.actualizar(ctx)) // Actualizar cuenta completa
  .put("/cuenta/:id/saldo", (ctx) => cuentaController.actualizarSaldo(ctx)) // Actualizar solo saldo
  .delete("/cuenta/:id", (ctx) => cuentaController.eliminar(ctx)); // Eliminar cuenta

export default cuentaRouter;