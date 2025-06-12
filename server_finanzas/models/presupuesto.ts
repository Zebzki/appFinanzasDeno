import { conexion } from "./conexion.ts";
import { z } from "../dependencies/dependencias.ts";

interface presupuestoData {
    idPresupuesto: number | null;
    montoLimite: number;
    fechaInicio: Date;
    fechaFin: Date;
    idCategoria: number;
    idUsuario: number;
}
export class Presupuesto{
    public _objPresupuesto : presupuestoData | null;
    public _idPresupuesto: number | null;

    constructor(objpresupuesto: presupuestoData | null = null, idpresupuesto: number | null = null) {
        this._objPresupuesto = objpresupuesto;
        this._idPresupuesto = idpresupuesto;
    }
    public async establecerLimiteGasto(): Promise<{ success: boolean, mensaje: string, presupuesto?: Record<string, unknown> }> {
        try {
            if (!this._objPresupuesto) {
                throw new Error("Objeto de presupuesto no definido");
            }
            const { montoLimite, fechaInicio, fechaFin,  idCategoria, idUsuario } = this._objPresupuesto;
            if (!montoLimite || !fechaInicio || !fechaFin || !idCategoria || !idUsuario) {
                throw new Error("Faltan datos en el objeto de presupuesto");
            }
            await conexion.execute('START TRANSACTION');
            const resul = await conexion.execute(
                `INSERT INTO presupuesto (montoLimite, inicio, fin,  idUsuario, idCategoria)
                 VALUES (?, ?, ?, ?, ?) `,
                [montoLimite, fechaInicio, fechaFin,  idUsuario, idCategoria]
            );
            if (resul && typeof resul.affectedRows === 'number' && resul.affectedRows > 0) {
                const { presupuesto } = await conexion.query('SELECT * FROM presupuesto WHERE idPresupuesto = LAST_INSERT_ID()');
                await conexion.execute('COMMIT');
                return { success: true, mensaje: "Presupuesto establecido correctamente", presupuesto: presupuesto };
            } else {
                throw new Error("No se pudo establecer el presupuesto");
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                return { success: false, mensaje: error.message };
            } else {
                return { success: false, mensaje: `error interno del servidor ${error}` };
            }
        }
    }
}
