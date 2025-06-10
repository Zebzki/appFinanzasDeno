// deno-lint-ignore-file no-explicit-any
import { iniciarSesion } from "../models/loginModel.ts";
import { crearToken } from "../helpers/jwt.ts";

export const loginController = async(ctx:any)=>{
    const {request, response} = ctx;
    try {
        const length = request.headers.get("Content-Length");
        if (length === 0) {
            response.status = 400;
            response.body = { success: false, error: "cuerpo de la peticion vacio" };
            return;
        }
        const body = await request.body.json();
        if(!body.email || !body.password){
            response.status = 400;
            response.body = { success: false, error: "email y password son requeridos" };
            return;

        }
        const resul = await iniciarSesion(body.email, body.password);
        if (resul.success) {
            const token = await crearToken(resul.data.idUsuario, resul.data.email);
            response.status = 200;
            response.body = { success: true, accessToken: token, data: `${resul.data.nombre}-${resul.data.apellido}` };
        } else {
            response.status = 400;
            response.body = { success: resul.success, error: resul.mensaje || "Error al iniciar sesión", data: resul.data };
        }
    } catch (error) {
        console.error("Error in loginController:", error);
        response.status = 500;
        response.body = { success: false, error: "Internal server error" };
        return;
        
    }
}