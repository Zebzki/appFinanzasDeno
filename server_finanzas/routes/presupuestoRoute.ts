import { Router } from "../dependencies/dependencias.ts";
import { establecerLimiteGasto } from "../controllers/presupuestoController.ts";
import { validateJWT } from "../middleware/validateJWT.ts";
const routerPresupuesto = new Router();

routerPresupuesto.post("/presupuesto", validateJWT, establecerLimiteGasto);
export { routerPresupuesto };