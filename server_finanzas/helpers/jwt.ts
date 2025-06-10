import 'https://deno.land/std@0.224.0/dotenv/load.ts';
import { create, getNumericDate, verify } from '../dependencies/dependencias.ts';
import { generarKey } from "./criptoKey.ts";

const key = Deno.env.get('MY_SECRET_KEY') || 'default_secret_key';
const server = Deno.env.get('SERVER');

export const crearToken = async (userId: string, email:string) => {
    const payload = {
        iss: server,
        sub: userId,
        ema: email,
        jti: crypto.randomUUID(),
        exp: getNumericDate(60 * 30),
    }
    const secretKey = await generarKey(key);
    return await create({ alg: "HS256", typ: "JWT" }, payload, secretKey);
}
export const verificarTokenAcceso = async (token: string) => {
    try {
        const secretKey = await generarKey(key);

        return await verify(token, secretKey);
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}