import { conexion } from "./conexion.ts";
import { z } from "../dependencies/dependencias.ts";

export const iniciarSesion = async (email: string, password: string) => {
    try {
        const [usuario] = await conexion.query('SELECT * FROM usuario WHERE email = ?', [email]);

        if (!usuario) {
            return {
                success: false,
                mensaje: "Usuario no encontrado",
                data: null
            };
        }
        if (password == usuario.password) {
            return {
                success: true,
                mensaje: "Inicio de sesión exitoso",
                data: usuario
            };
        } else {
            return {
                success: false,
                mensaje: "Error al inicar sesion, contraseña incorrecta",
                data: null
            };
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.message };
        } else {
            return { success: false, error: `error interno:${error}` };
        }
    }
}