import { Router } from "../dependencies/dependencias.ts";
import { CategoriaController } from "../controllers/categoriaController.ts";

const categoriaRouter = new Router();
const categoriaController = new CategoriaController();

categoriaRouter

  .get("/categoria", (ctx) => categoriaController.obtenerTodas(ctx))               // Listar TODAS
  .get("/categoria/:id", (ctx) => categoriaController.obtenerPorId(ctx))           // Obtener por ID
  .post("/categoria", (ctx) => categoriaController.crear(ctx))                     // Crear nueva
  .put("/categoria/:id", (ctx) => categoriaController.actualizar(ctx))             // Actualizar
  .delete("/categoria/:id", (ctx) => categoriaController.eliminar(ctx))            // Eliminar
  
  .get("/categoria/tipo/:tipo", (ctx) => categoriaController.obtenerPorTipo(ctx))  // Por tipo (ingresos/gastos)
  .get("/categoria/:id/uso", (ctx) => categoriaController.verificarUso(ctx))       // Verificar uso
  .get("/categorias/estadisticas", (ctx) => categoriaController.obtenerEstadisticas(ctx)); // Estadísticas

export default categoriaRouter;