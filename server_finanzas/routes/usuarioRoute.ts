import { Router } from "../dependencies/dependencias.ts";
import { getUsuarios } from "../controllers/usuarioController.ts";
import { validateJWT } from "../middleware/validateJWT.ts";

const usuarioRouter = new Router();

usuarioRouter.get("/usuarios", validateJWT, getUsuarios);

export { usuarioRouter };