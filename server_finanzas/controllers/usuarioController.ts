// deno-lint-ignore-file no-explicit-any
import { Usuario } from "../models/usuario.ts";
export const getUsuarios = async (ctx: any) => {
    const { response, state } = ctx;
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
export const postUsuarios = async (ctx: any) => {
    const { response, request } = ctx;
    try {
        const length = request.headers.get("content-length");
        if (length === 0) {
            response.status = 400;
            response.body = { success: false, mensaje: "No se proporcionó información del usuario." };
            return;
        }
        const body = await request.body.json();
        const data = {
            idUsuario: null,
            nombre: body.nombre,
            apellido: body.apellido,
            email: body.email,
            telefono: body.telefono,
            password: body.password
        };
        const usuario = new Usuario(data);
        const result = await usuario.registrarUsuario();
        response.status = result.success ? 201 : 400;
        response.body = {
            success: result.success,
            mensaje: result.mensaje,
            usuario: result.usuario
        };

    } catch (error) {
        console.error(error);
        ctx.response.status = 500;
        ctx.response.body = { success: false, mensaje: `error interno del servidor:${error}` }
    }
}   
export const deleteUsuarios = async (ctx: any) => {
    const { response,  state } = ctx;
    try {
        const idUsuario = state.user.sub;
        if (!idUsuario) {
            response.status = 400;
            response.body = { success: false, mensaje: "ID de usuario no proporcionado." };
            return;
        }
        const usuario = new Usuario(null, idUsuario);
        const result = await usuario.eliminarUsuario();
        response.status = result.success ? 200 : 400;
        response.body = { success: result.success, mensaje: result.mensaje };
    } catch (error) {
        console.error(error);
        ctx.response.status = 500;
        ctx.response.body = { success: false, mensaje: `error interno del servidor:${error}` }
    }
}