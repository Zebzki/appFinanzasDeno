import { Client } from "../dependencies/dependencias.ts";

export const conexion = await new Client().connect({
    db: 'db_finanzas',
    hostname: 'localhost',
    username: 'root',
    password: '',
})