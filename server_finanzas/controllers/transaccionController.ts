// deno-lint-ignore-file no-explicit-any
import { Transaccion } from "../models/transaccion.ts";

export const getTransacciones = async (ctx: any) => {
    const { response, state } = ctx;
    try {
        const id = state.user.sub;
        const objTransaccion = new Transaccion(null, id);
        const transacciones = await objTransaccion.listarTransacciones();
        response.status = 200;
        response.body = { success: true, data: transacciones };
    } catch (error) {
        response.status = 500;
        response.body = { success: false, mensaje: `error interno del servidor. ${error}` };
    }
}
export const ingresarTransaccionIngreso = async (ctx: any) => {
    const { request, response } = ctx;
    try {
        const length = request.headers.get("Content-Length");
        if (length === 0) {
            response.status = 400;
            response.body = { success: false, mensaje: "cuerpo de la peticion vacio" };
            return;
        }
        const body = await request.body.json();
        const data = { idTransaccion: null, monto: body.monto, fecha: new Date(), descripcion: body.descripcion, idCategoria: body.idCategoria, idCuenta: body.idCuenta };
        const objTransaccion = new Transaccion(data);
        const result = await objTransaccion.ingresarTransaccionIngreso();
        response.status = result.success ? 201 : 400;
        response.body = { success: result.success, mensaje: result.mensaje, transaccion: result.transaccion };
    } catch (error) {
        response.status = 500;
        response.body = { success: false, mensaje: `error interno del servidor. ${error}` };
    }
}
export const ingresarTransaccionGasto = async (ctx: any) => {
    const { request, response } = ctx;
    try {
        const length = request.headers.get("Content-Length");
        if (length === 0) {
            response.status = 400;
            response.body = { success: false, mensaje: "cuerpo de la peticion vacio" };
            return;
        }
        const body = await request.body.json();
        const data = { idTransaccion: null, monto: body.monto, fecha: new Date(), descripcion: body.descripcion, idCategoria: body.idCategoria, idCuenta: body.idCuenta };
        const objTransaccion = new Transaccion(data);
        const result = await objTransaccion.ingresarTransaccionGasto();
        response.status = result.success ? 201 : 400;
        response.body = { success: result.success, mensaje: result.mensaje, transaccion: result.transaccion };
    } catch (error) {
        response.status = 500;
        response.body = { success: false, mensaje: `error interno del servidor. ${error}` };
    }
}