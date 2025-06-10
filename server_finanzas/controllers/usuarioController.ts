// deno-lint-ignore-file no-explicit-any
import { Usuario } from "../models/usuario.ts";
export const getUsuarios = async (ctx: any) => {
    const { response,state } = ctx;
    try {

        const email = state.user.ema;
        if (typeof email !== "string") {
            response.status = 400;
            response.body = { success: false, mensaje: "Email is required" };
            return;
        }
        const objU = new Usuario();

        const result = await objU.listarUsuarioLogin(email);
        response.status = 200;
        response.body = { success: true, data: result }

    } catch (error) {
        console.error(error);
        ctx.response.status = 500;
        ctx.response.body = { success: false, mensaje: `error interno del servidor:${error}` }
    }
}