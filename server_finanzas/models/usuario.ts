import { conexion } from "./conexion.ts";
import { z } from "../dependencies/dependencias.ts";
interface usuariosData {
    idUsuario: number | null;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    password: string;
}
export class Usuario {
    public _objUsuario: usuariosData | null;
    public _idUsuario: number | null;

    /**
     *
     */
    constructor(objusuario: usuariosData | null = null, idusuario: number | null = null) {
        this._objUsuario = objusuario;
        this._idUsuario = idusuario;
    }
    public async listarUsuarioLogin(email: string): Promise<usuariosData[]> {
        const { rows: usuario } = await conexion.execute("SELECT idUsuario, nombre, apellido, email, telefono FROM usuario WHERE email=?", [email]);
        return usuario as usuariosData[];
    }
    public async registrarUsuario(): Promise<{ success: boolean, mensaje: string, usuario?: Record<string, unknown> }> {
        try {
            if (!this._objUsuario) {
                return { success: false, mensaje: "No se proporcionó información del usuario." };
            }
            const { nombre, apellido, email, telefono, password } = this._objUsuario;
            if (!nombre || !apellido || !email || !telefono || !password) {
                return { success: false, mensaje: "Todos los campos son obligatorios." };

            }
            await conexion.execute('START TRANSACTION');
            const resul = await conexion.execute(
                "INSERT INTO usuario (nombre, apellido, email, telefono, password) VALUES (?, ?, ?, ?, ?)",
                [nombre, apellido, email, telefono, password]
            );
            if (resul && typeof resul.affectedRows === "number" && resul.affectedRows > 0) {
                const { usu } = await conexion.query("SELECT * FROM usuario WHERE idUsuario = LAST_INSERT_ID()");
                await conexion.execute('COMMIT');
                return { success: true, mensaje: "Usuario registrado exitosamente.", usuario: usu };
            } else {
                await conexion.execute('ROLLBACK');
                return { success: false, mensaje: "Error al registrar el usuario." };
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                return { success: false, mensaje: "Error de validación: " + error.message };
            } else {
                return { success: false, mensaje: `Error al registrar el usuario: ${error}` };
            }
        }

    }
    public async eliminarUsuario(): Promise<{ success: boolean, mensaje: string }> {
        try {
            if (!this._idUsuario) {
                return { success: false, mensaje: "No se proporcionó el ID del usuario." };
            }
            const resul = await conexion.execute("CALL sp_eliminar_usuario(?)", [this._idUsuario]);
            if (resul && typeof resul.affectedRows === "number" && resul.affectedRows > 0) {
                return { success: true, mensaje: "Usuario eliminado exitosamente." };
            } else {
                return { success: false, mensaje: "Error al eliminar el usuario." };
            }
        } catch (error) {
            return { success: false, mensaje: `Error al eliminar el usuario: ${error}` };
        }
    }
}