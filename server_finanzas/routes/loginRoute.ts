import { Router } from "../dependencies/dependencias.ts";
import { loginController } from "../controllers/loginControler.ts";


const loginRouter = new Router();
loginRouter.post("/", loginController);
export { loginRouter };