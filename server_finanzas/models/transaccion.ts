import { conexion } from "./conexion.ts";
import { z } from "../dependencies/dependencias.ts";

interface transaccionData {
    idTransaccion: number | null;
    monto: number;
    fecha: Date;
    descripcion: string;
    idCategoria: number;
    idCuenta: number;
}
export class Transaccion {
    public _objTransaccion: transaccionData | null;
    public _idTransaccion: number | null;
    /**
     *
     */
    constructor(objtransaccion: transaccionData | null = null, idtransaccion: number | null = null) {
        this._objTransaccion = objtransaccion;
        this._idTransaccion = idtransaccion;

    }
    public async listarTransacciones(): Promise<transaccionData[]> {
        const { rows: trans } = await conexion.execute("SELECT * FROM transaccion t JOIN cuenta c ON t.idCuenta = c.idCuenta WHERE idUsuario = ?", [this._idTransaccion]);
        return trans as transaccionData[];
    }

    public async ingresarTransaccionIngreso(): Promise<{ success: boolean, mensaje: string, transaccion?: Record<string, unknown> }> {
        try {
            if (!this._objTransaccion) {
                throw new Error("Objeto de transacción no definido");
            }
            const { monto, fecha, descripcion, idCategoria, idCuenta } = this._objTransaccion;
            if (!monto || !fecha || !descripcion || !idCategoria || !idCuenta) {
                throw new Error("Faltan datos en el objeto de transacción");

            }
            await conexion.execute('START TRANSACTION');
            const resul = await conexion.execute(
                `INSERT INTO transaccion (monto, fecha, descripcion,  idCategoria, idCuenta)
                 VALUES (?, ?, ?, ?, ?) `,
                [monto, fecha, descripcion, idCategoria, idCuenta]
            );
            if (resul && typeof resul.affectedRows === 'number' && resul.affectedRows > 0) {
                await conexion.execute(
                    `UPDATE cuenta SET saldo = saldo + ? WHERE idCuenta = ?`,
                    [monto, idCuenta]
                );
                const { trans } = await conexion.query('SELECT * FROM transaccion WHERE idTransaccion = LAST_INSERT_ID()');
                await conexion.execute('COMMIT');
                return { success: true, mensaje: "Transacción ingresada correctamente", transaccion: trans };
            } else {
                throw new Error("No se pudo hacer la transacción");
            }

        } catch (error) {
            if (error instanceof z.ZodError) {
                return { success: false, mensaje: "Error de validación" };

            } else {
                return { success: false, mensaje: `Error al ingresar la transacción. ${error}` };
            }
        }
    }
    public async ingresarTransaccionGasto(): Promise<{ success: boolean, mensaje: string, transaccion?: Record<string, unknown> }> {
        try {
            if (!this._objTransaccion) {
                throw new Error("Objeto de transacción no definido");
            }
            const { monto, fecha, descripcion, idCategoria, idCuenta } = this._objTransaccion;
            if (!monto || !fecha || !descripcion || !idCategoria || !idCuenta) {
                throw new Error("Faltan datos en el objeto de transacción");

            }
            await conexion.execute('START TRANSACTION');
            const resul = await conexion.execute(
                `INSERT INTO transaccion (monto, fecha, descripcion,  idCategoria, idCuenta)
                 VALUES (?, ?, ?, ?, ?) `,
                [monto, fecha, descripcion, idCategoria, idCuenta]
            );
            if (resul && typeof resul.affectedRows === 'number' && resul.affectedRows > 0) {
                await conexion.execute(
                    `UPDATE cuenta SET saldo = saldo - ? WHERE idCuenta = ?`,
                    [monto, idCuenta]
                );
                const { trans } = await conexion.query('SELECT * FROM transaccion WHERE idTransaccion = LAST_INSERT_ID()');
                await conexion.execute('COMMIT');
                return { success: true, mensaje: "Transacción ingresada correctamente", transaccion: trans };
            } else {
                throw new Error("No se pudo hacer la transacción");
            }

        } catch (error) {
            if (error instanceof z.ZodError) {
                return { success: false, mensaje: "Error de validación" };

            } else {
                return { success: false, mensaje: `Error al ingresar la transacción. ${error}` };
            }
        }
    }
}