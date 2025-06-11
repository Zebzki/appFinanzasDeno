import { conexion } from "./conexion.ts";

export interface Cuenta {
  idCuenta?: number;
  nombreCuenta: string;
  idTipoCuenta: number;
  saldo: number;
  // Para las consultas con JOIN
  tipoCuenta?: string;
}

export interface CuentaConUso extends Cuenta {
  transacciones: number;
  ultimaTransaccion?: string;
  enUso: boolean;
}

export interface ResumenCuentas {
  tipo: string;
  idTipoCuenta: number;
  totalCuentas: number;
  saldoTotal: number;
  saldoPromedio: number;
}

export class CuentaModel {
  private db = conexion;

  // Obtener todas las cuentas con información del tipo
  async obtenerTodas(): Promise<Cuenta[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          c.idCuenta,
          c.nombreCuenta,
          c.idTipoCuenta,
          c.saldo,
          tc.tipo as tipoCuenta
        FROM cuenta c
        INNER JOIN tipoCuenta tc ON c.idTipoCuenta = tc.idTipoCuenta
        ORDER BY c.nombreCuenta ASC
      `);
      return result as Cuenta[];
    } catch (error) {
      console.error("Error obteniendo cuentas:", error);
      throw error;
    }
  }

  // Obtener cuenta por ID con información del tipo
  async obtenerPorId(id: number): Promise<Cuenta | null> {
    try {
      const result = await this.db.query(`
        SELECT 
          c.idCuenta,
          c.nombreCuenta,
          c.idTipoCuenta,
          c.saldo,
          tc.tipo as tipoCuenta
        FROM cuenta c
        INNER JOIN tipoCuenta tc ON c.idTipoCuenta = tc.idTipoCuenta
        WHERE c.idCuenta = ?
      `, [id]);
      return result.length > 0 ? result[0] as Cuenta : null;
    } catch (error) {
      console.error("Error obteniendo cuenta por ID:", error);
      throw error;
    }
  }

  // Crear nueva cuenta
  async crear(cuenta: Omit<Cuenta, 'idCuenta'>): Promise<number> {
    try {
      // Verificar que el tipo de cuenta existe
      const tipoExiste = await this.db.query(
        "SELECT idTipoCuenta FROM tipoCuenta WHERE idTipoCuenta = ?",
        [cuenta.idTipoCuenta]
      );

      if (tipoExiste.length === 0) {
        throw new Error("El tipo de cuenta especificado no existe");
      }

      // Verificar que no exista una cuenta con el mismo nombre
      const existe = await this.db.query(
        "SELECT idCuenta FROM cuenta WHERE nombreCuenta = ?",
        [cuenta.nombreCuenta]
      );

      if (existe.length > 0) {
        throw new Error("Ya existe una cuenta con ese nombre");
      }

      const result = await this.db.query(
        "INSERT INTO cuenta (nombreCuenta, idTipoCuenta, saldo) VALUES (?, ?, ?)",
        [cuenta.nombreCuenta, cuenta.idTipoCuenta, cuenta.saldo]
      );
      return result.insertId as number;
    } catch (error) {
      console.error("Error creando cuenta:", error);
      throw error;
    }
  }

  // Actualizar cuenta
  async actualizar(id: number, cuenta: Partial<Cuenta>): Promise<boolean> {
    try {
      const campos = [];
      const valores = [];

      if (cuenta.nombreCuenta !== undefined) {
        // Verificar que no exista otra cuenta con el mismo nombre
        const existe = await this.db.query(
          "SELECT idCuenta FROM cuenta WHERE nombreCuenta = ? AND idCuenta != ?",
          [cuenta.nombreCuenta, id]
        );

        if (existe.length > 0) {
          throw new Error("Ya existe una cuenta con ese nombre");
        }

        campos.push("nombreCuenta = ?");
        valores.push(cuenta.nombreCuenta);
      }

      if (cuenta.idTipoCuenta !== undefined) {
        // Verificar que el tipo de cuenta existe
        const tipoExiste = await this.db.query(
          "SELECT idTipoCuenta FROM tipoCuenta WHERE idTipoCuenta = ?",
          [cuenta.idTipoCuenta]
        );

        if (tipoExiste.length === 0) {
          throw new Error("El tipo de cuenta especificado no existe");
        }

        campos.push("idTipoCuenta = ?");
        valores.push(cuenta.idTipoCuenta);
      }

      if (cuenta.saldo !== undefined) {
        campos.push("saldo = ?");
        valores.push(cuenta.saldo);
      }

      if (campos.length === 0) return false;

      valores.push(id);
      const query = `UPDATE cuenta SET ${campos.join(", ")} WHERE idCuenta = ?`;

      const result = await this.db.query(query, valores);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error actualizando cuenta:", error);
      throw error;
    }
  }

  // NUEVO: Actualizar solo el saldo
  async actualizarSaldo(id: number, saldo: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        "UPDATE cuenta SET saldo = ? WHERE idCuenta = ?",
        [saldo, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error actualizando saldo:", error);
      throw error;
    }
  }

  // Eliminar cuenta
  async eliminar(id: number): Promise<boolean> {
    try {
      // Verificar si la cuenta tiene transacciones asociadas
      const transacciones = await this.db.query(
        "SELECT COUNT(*) as count FROM transaccion WHERE idCuenta = ?",
        [id]
      );

      const countTransacciones = transacciones[0]?.count || 0;
      if (countTransacciones > 0) {
        throw new Error("No se puede eliminar la cuenta porque tiene transacciones asociadas");
      }

      const result = await this.db.query(
        "DELETE FROM cuenta WHERE idCuenta = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error eliminando cuenta:", error);
      throw error;
    }
  }

  // Verificar uso de una cuenta
  async verificarUso(id: number): Promise<{enUso: boolean, detalles: any}> {
    try {
      const transacciones = await this.db.query(
        "SELECT COUNT(*) as count FROM transaccion WHERE idCuenta = ?",
        [id]
      );

      const countTransacciones = transacciones[0]?.count || 0;

      return {
        enUso: countTransacciones > 0,
        detalles: {
          transacciones: countTransacciones
        }
      };
    } catch (error) {
      console.error("Error verificando uso de cuenta:", error);
      throw error;
    }
  }

  // NUEVO: Obtener cuentas con información de uso
  async obtenerConUso(): Promise<CuentaConUso[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          c.idCuenta,
          c.nombreCuenta,
          c.idTipoCuenta,
          c.saldo,
          tc.tipo as tipoCuenta,
          COUNT(t.idTransaccion) as transacciones,
          MAX(t.fecha) as ultimaTransaccion,
          CASE WHEN COUNT(t.idTransaccion) > 0 THEN true ELSE false END as enUso
        FROM cuenta c
        INNER JOIN tipoCuenta tc ON c.idTipoCuenta = tc.idTipoCuenta
        LEFT JOIN transaccion t ON c.idCuenta = t.idCuenta
        GROUP BY c.idCuenta, c.nombreCuenta, c.idTipoCuenta, c.saldo, tc.tipo
        ORDER BY c.nombreCuenta ASC
      `);
      return result as CuentaConUso[];
    } catch (error) {
      console.error("Error obteniendo cuentas con uso:", error);
      throw error;
    }
  }

  // NUEVO: Obtener resumen de cuentas por tipo
  async obtenerResumen(): Promise<ResumenCuentas[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          tc.tipo,
          tc.idTipoCuenta,
          COUNT(c.idCuenta) as totalCuentas,
          COALESCE(SUM(c.saldo), 0) as saldoTotal,
          COALESCE(AVG(c.saldo), 0) as saldoPromedio
        FROM tipoCuenta tc
        LEFT JOIN cuenta c ON tc.idTipoCuenta = c.idTipoCuenta
        GROUP BY tc.idTipoCuenta, tc.tipo
        ORDER BY tc.tipo ASC
      `);
      return result as ResumenCuentas[];
    } catch (error) {
      console.error("Error obteniendo resumen de cuentas:", error);
      throw error;
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas(): Promise<any> {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(c.idCuenta) as totalCuentas,
          SUM(c.saldo) as saldoTotal,
          tc.tipo,
          COUNT(c.idCuenta) as cuentasPorTipo,
          SUM(c.saldo) as saldoPorTipo
        FROM cuenta c
        INNER JOIN tipoCuenta tc ON c.idTipoCuenta = tc.idTipoCuenta
        GROUP BY tc.idTipoCuenta, tc.tipo
        ORDER BY tc.tipo
      `);

      const resumen = await this.db.query(`
        SELECT 
          COUNT(*) as totalCuentas,
          SUM(saldo) as saldoTotal,
          AVG(saldo) as saldoPromedio
        FROM cuenta
      `);

      return {
        resumen: resumen[0] || { totalCuentas: 0, saldoTotal: 0, saldoPromedio: 0 },
        porTipo: result || []
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas de cuentas:", error);
      throw error;
    }
  }
}