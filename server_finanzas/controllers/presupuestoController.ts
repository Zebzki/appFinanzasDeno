// deno-lint-ignore-file no-explicit-any
import { Presupuesto } from "../models/presupuesto.ts";
export const establecerLimiteGasto = async (ctx: any) => {
    const { response, request, state } = ctx;
    try {
        const lenght = request.headers.get("content-length");
        if (lenght === 0) {
            response.status = 400;
            response.body = { success: false, mensaje: "cuerpo de la peticion vacio" };
            return;
        }
        const body = await request.body.json();
        const idUsuario = state.user.sub;
        const data = { idPresupuesto: null, montoLimite: body.montoLimite, fechaInicio: body.fechaInicio, fechaFin: body.fechaFin, idUsuario: idUsuario, idCategoria: body.idCategoria };
        const objPresupuesto = new Presupuesto(data);
        const resul = await objPresupuesto.establecerLimiteGasto();
        response.status = resul.success ? 201 : 400;
        response.body = { success: resul.success, mensaje: resul.mensaje, presupuesto: resul.presupuesto };
    } catch (error) {
        response.status = 500;
        response.body = { success: false, mensaje: `Error interno del servidor ${error}` };
    }
}