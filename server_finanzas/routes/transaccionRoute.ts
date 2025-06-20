import { Router } from "../dependencies/dependencias.ts";
import { getTransacciones, ingresarTransaccionIngreso, ingresarTransaccionGasto, getReporteSemanal } from "../controllers/transaccionController.ts";
import { validateJWT } from "../middleware/validateJWT.ts";

const transaccionRouter = new Router();

transaccionRouter.get("/transacciones", validateJWT, getTransacciones);
transaccionRouter.post("/transacciones/ingreso", ingresarTransaccionIngreso);
transaccionRouter.post("/transacciones/gasto", ingresarTransaccionGasto);
transaccionRouter.get("/transacciones/reporte-semanal", validateJWT, getReporteSemanal);

export { transaccionRouter };