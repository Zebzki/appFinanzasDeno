import { Router } from "../dependencies/dependencias.ts";
import { getUsuarios,postUsuarios,deleteUsuarios } from "../controllers/usuarioController.ts";
import { validateJWT } from "../middleware/validateJWT.ts";

const usuarioRouter = new Router();

usuarioRouter.get("/usuarios", validateJWT, getUsuarios);
usuarioRouter.post("/usuarios",  postUsuarios);
usuarioRouter.delete("/usuarios", validateJWT, deleteUsuarios);

export { usuarioRouter };