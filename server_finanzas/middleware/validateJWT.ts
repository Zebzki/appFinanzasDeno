import { Context, Next } from "https://deno.land/x/oak@v17.1.3/mod.ts";
import { verificarTokenAcceso } from "../helpers/jwt.ts";

export async function validateJWT(ctx: Context, next: Next) {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Error, no Autorizado" };
        return;
    }

    const token = authHeader.split(" ")[1];
    const usuario = await verificarTokenAcceso(token);
    if (!usuario) {
        ctx.response.status = 401;
        ctx.response.body = { error: "token invalido o expirado" };
        return;
    }

    ctx.state.user = usuario;
    await next();
}