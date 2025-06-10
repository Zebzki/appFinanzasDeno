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
        const { rows: usuario } = await conexion.execute("SELECT idUsuario, nombre, apellido, email, telefono FROM usuario WHERE email=?",[email]);
        return usuario as usuariosData[];
    }
}