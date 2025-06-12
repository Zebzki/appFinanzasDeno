import { conexion } from "./conexion.ts";

export interface Cuenta {
  idCuenta?: number;
  nombreCuenta: string;
  idTipoCuenta: number;
  saldo: number;
  idUsuario: number;
  tipoCuenta?: string;
  usuario?: string;
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

export interface ResumenCuentasUsuario {
  idUsuario: number;
  usuario: string;
  tipo: string;
  idTipoCuenta: number;
  totalCuentas: number;
  saldoTotal: number;
  saldoPromedio: number;
}

export class CuentaModel {
  private db = conexion;

  async obtenerTodas(): Promise<Cuenta[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          c.idCuenta,
          c.nombreCuenta,
          c.idTipoCuenta,
          c.saldo,
          c.idUsuario,
          tc.tipo as tipoCuenta,
          CONCAT(u.nombre, ' ', u.apellido) as usuario
        FROM cuenta c
        INNER JOIN tipoCuenta tc ON c.idTipoCuenta = tc.idTipoCuenta
        INNER JOIN usuario u ON c.idUsuario = u.idUsuario
        ORDER BY u.nombre ASC, c.nombreCuenta ASC
      `);
      return result as Cuenta[];
    } catch (error) {
      console.error("Error obteniendo cuentas:", error);
      throw error;
    }
  }

  async obtenerPorUsuario(idUsuario: number): Promise<Cuenta[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          c.idCuenta,
          c.nombreCuenta,
          c.idTipoCuenta,
          c.saldo,
          c.idUsuario,
          tc.tipo as tipoCuenta,
          CONCAT(u.nombre, ' ', u.apellido) as usuario
        FROM cuenta c
        INNER JOIN tipoCuenta tc ON c.idTipoCuenta = tc.idTipoCuenta
        INNER JOIN usuario u ON c.idUsuario = u.idUsuario
        WHERE c.idUsuario = ?
        ORDER BY c.nombreCuenta ASC
      `, [idUsuario]);
      return result as Cuenta[];
    } catch (error) {
      console.error("Error obteniendo cuentas por usuario:", error);
      throw error;
    }
  }

  async obtenerPorId(id: number): Promise<Cuenta | null> {
    try {
      const result = await this.db.query(`
        SELECT 
          c.idCuenta,
          c.nombreCuenta,
          c.idTipoCuenta,
          c.saldo,
          c.idUsuario,
          tc.tipo as tipoCuenta,
          CONCAT(u.nombre, ' ', u.apellido) as usuario
        FROM cuenta c
        INNER JOIN tipoCuenta tc ON c.idTipoCuenta = tc.idTipoCuenta
        INNER JOIN usuario u ON c.idUsuario = u.idUsuario
        WHERE c.idCuenta = ?
      `, [id]);
      return result.length > 0 ? result[0] as Cuenta : null;
    } catch (error) {
      console.error("Error obteniendo cuenta por ID:", error);
      throw error;
    }
  }

  async crear(cuenta: Omit<Cuenta, 'idCuenta'>): Promise<number> {
    try {
      // Verificar que el usuario existe
      const usuarioExiste = await this.db.query(
        "SELECT idUsuario FROM usuario WHERE idUsuario = ?",
        [cuenta.idUsuario]
      );

      if (usuarioExiste.length === 0) {
        throw new Error("El usuario especificado no existe");
      }

      // Verificar que el tipo de cuenta existe
      const tipoExiste = await this.db.query(
        "SELECT idTipoCuenta FROM tipoCuenta WHERE idTipoCuenta = ?",
        [cuenta.idTipoCuenta]
      );

      if (tipoExiste.length === 0) {
        throw new Error("El tipo de cuenta especificado no existe");
      }

      // Verificar que no existe una cuenta con el mismo nombre para el mismo usuario
      const existe = await this.db.query(
        "SELECT idCuenta FROM cuenta WHERE nombreCuenta = ? AND idUsuario = ?",
        [cuenta.nombreCuenta, cuenta.idUsuario]
      );

      if (existe.length > 0) {
        throw new Error("Ya existe una cuenta con ese nombre para este usuario");
      }

      const result = await this.db.query(
        "INSERT INTO cuenta (nombreCuenta, idTipoCuenta, saldo, idUsuario) VALUES (?, ?, ?, ?)",
        [cuenta.nombreCuenta, cuenta.idTipoCuenta, cuenta.saldo, cuenta.idUsuario]
      );
      return result.insertId as number;
    } catch (error) {
      console.error("Error creando cuenta:", error);
      throw error;
    }
  }

  async actualizar(id: number, cuenta: Partial<Cuenta>): Promise<boolean> {
    try {
      const campos = [];
      const valores = [];

      if (cuenta.nombreCuenta !== undefined) {
        // Si se va a cambiar el nombre, verificar que no exista para el mismo usuario
        if (cuenta.idUsuario !== undefined) {
          const existe = await this.db.query(
            "SELECT idCuenta FROM cuenta WHERE nombreCuenta = ? AND idUsuario = ? AND idCuenta != ?",
            [cuenta.nombreCuenta, cuenta.idUsuario, id]
          );

          if (existe.length > 0) {
            throw new Error("Ya existe una cuenta con ese nombre para este usuario");
          }
        } else {
          // Si no se proporciona idUsuario, obtener el actual
          const cuentaActual = await this.obtenerPorId(id);
          if (cuentaActual) {
            const existe = await this.db.query(
              "SELECT idCuenta FROM cuenta WHERE nombreCuenta = ? AND idUsuario = ? AND idCuenta != ?",
              [cuenta.nombreCuenta, cuentaActual.idUsuario, id]
            );

            if (existe.length > 0) {
              throw new Error("Ya existe una cuenta con ese nombre para este usuario");
            }
          }
        }

        campos.push("nombreCuenta = ?");
        valores.push(cuenta.nombreCuenta);
      }

      if (cuenta.idTipoCuenta !== undefined) {
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

      if (cuenta.idUsuario !== undefined) {
        const usuarioExiste = await this.db.query(
          "SELECT idUsuario FROM usuario WHERE idUsuario = ?",
          [cuenta.idUsuario]
        );

        if (usuarioExiste.length === 0) {
          throw new Error("El usuario especificado no existe");
        }

        campos.push("idUsuario = ?");
        valores.push(cuenta.idUsuario);
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

  async eliminar(id: number): Promise<boolean> {
    try {
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

  async obtenerConUso(): Promise<CuentaConUso[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          c.idCuenta,
          c.nombreCuenta,
          c.idTipoCuenta,
          c.saldo,
          c.idUsuario,
          tc.tipo as tipoCuenta,
          CONCAT(u.nombre, ' ', u.apellido) as usuario,
          COUNT(t.idTransaccion) as transacciones,
          MAX(t.fecha) as ultimaTransaccion,
          CASE WHEN COUNT(t.idTransaccion) > 0 THEN true ELSE false END as enUso
        FROM cuenta c
        INNER JOIN tipoCuenta tc ON c.idTipoCuenta = tc.idTipoCuenta
        INNER JOIN usuario u ON c.idUsuario = u.idUsuario
        LEFT JOIN transaccion t ON c.idCuenta = t.idCuenta
        GROUP BY c.idCuenta, c.nombreCuenta, c.idTipoCuenta, c.saldo, c.idUsuario, tc.tipo, u.nombre, u.apellido
        ORDER BY u.nombre ASC, c.nombreCuenta ASC
      `);
      return result as CuentaConUso[];
    } catch (error) {
      console.error("Error obteniendo cuentas con uso:", error);
      throw error;
    }
  }

  async obtenerConUsoPorUsuario(idUsuario: number): Promise<CuentaConUso[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          c.idCuenta,
          c.nombreCuenta,
          c.idTipoCuenta,
          c.saldo,
          c.idUsuario,
          tc.tipo as tipoCuenta,
          CONCAT(u.nombre, ' ', u.apellido) as usuario,
          COUNT(t.idTransaccion) as transacciones,
          MAX(t.fecha) as ultimaTransaccion,
          CASE WHEN COUNT(t.idTransaccion) > 0 THEN true ELSE false END as enUso
        FROM cuenta c
        INNER JOIN tipoCuenta tc ON c.idTipoCuenta = tc.idTipoCuenta
        INNER JOIN usuario u ON c.idUsuario = u.idUsuario
        LEFT JOIN transaccion t ON c.idCuenta = t.idCuenta
        WHERE c.idUsuario = ?
        GROUP BY c.idCuenta, c.nombreCuenta, c.idTipoCuenta, c.saldo, c.idUsuario, tc.tipo, u.nombre, u.apellido
        ORDER BY c.nombreCuenta ASC
      `, [idUsuario]);
      return result as CuentaConUso[];
    } catch (error) {
      console.error("Error obteniendo cuentas con uso por usuario:", error);
      throw error;
    }
  }

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

  async obtenerResumenPorUsuario(idUsuario: number): Promise<ResumenCuentasUsuario[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          u.idUsuario,
          CONCAT(u.nombre, ' ', u.apellido) as usuario,
          tc.tipo,
          tc.idTipoCuenta,
          COUNT(c.idCuenta) as totalCuentas,
          COALESCE(SUM(c.saldo), 0) as saldoTotal,
          COALESCE(AVG(c.saldo), 0) as saldoPromedio
        FROM usuario u
        CROSS JOIN tipoCuenta tc
        LEFT JOIN cuenta c ON tc.idTipoCuenta = c.idTipoCuenta AND c.idUsuario = u.idUsuario
        WHERE u.idUsuario = ?
        GROUP BY u.idUsuario, u.nombre, u.apellido, tc.idTipoCuenta, tc.tipo
        HAVING COUNT(c.idCuenta) > 0
        ORDER BY tc.tipo ASC
      `, [idUsuario]);
      return result as ResumenCuentasUsuario[];
    } catch (error) {
      console.error("Error obteniendo resumen de cuentas por usuario:", error);
      throw error;
    }
  }

  async obtenerEstadisticas(): Promise<any> {
    try {
      const result = await this.db.query(`
        SELECT 
          tc.tipo,
          tc.idTipoCuenta,
          COUNT(c.idCuenta) as cuentasPorTipo,
          COALESCE(SUM(c.saldo), 0) as saldoPorTipo,
          COALESCE(AVG(c.saldo), 0) as saldoPromedioPorTipo
        FROM tipoCuenta tc
        LEFT JOIN cuenta c ON tc.idTipoCuenta = c.idTipoCuenta
        GROUP BY tc.idTipoCuenta, tc.tipo
        ORDER BY tc.tipo
      `);

      const resumen = await this.db.query(`
        SELECT 
          COUNT(*) as totalCuentas,
          COALESCE(SUM(saldo), 0) as saldoTotal,
          COALESCE(AVG(saldo), 0) as saldoPromedio,
          COUNT(DISTINCT idUsuario) as totalUsuarios
        FROM cuenta
      `);

      const porUsuario = await this.db.query(`
        SELECT 
          u.idUsuario,
          CONCAT(u.nombre, ' ', u.apellido) as usuario,
          COUNT(c.idCuenta) as totalCuentas,
          COALESCE(SUM(c.saldo), 0) as saldoTotal,
          COALESCE(AVG(c.saldo), 0) as saldoPromedio
        FROM usuario u
        LEFT JOIN cuenta c ON u.idUsuario = c.idUsuario
        GROUP BY u.idUsuario, u.nombre, u.apellido
        ORDER BY u.nombre ASC
      `);

      return {
        resumen: resumen[0] || { totalCuentas: 0, saldoTotal: 0, saldoPromedio: 0, totalUsuarios: 0 },
        porTipo: result || [],
        porUsuario: porUsuario || []
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas de cuentas:", error);
      throw error;
    }
  }

  async obtenerEstadisticasPorUsuario(idUsuario: number): Promise<any> {
    try {
      const result = await this.db.query(`
        SELECT 
          tc.tipo,
          tc.idTipoCuenta,
          COUNT(c.idCuenta) as cuentasPorTipo,
          COALESCE(SUM(c.saldo), 0) as saldoPorTipo,
          COALESCE(AVG(c.saldo), 0) as saldoPromedioPorTipo
        FROM tipoCuenta tc
        LEFT JOIN cuenta c ON tc.idTipoCuenta = c.idTipoCuenta AND c.idUsuario = ?
        GROUP BY tc.idTipoCuenta, tc.tipo
        HAVING COUNT(c.idCuenta) > 0
        ORDER BY tc.tipo
      `, [idUsuario]);

      const resumen = await this.db.query(`
        SELECT 
          COUNT(*) as totalCuentas,
          COALESCE(SUM(saldo), 0) as saldoTotal,
          COALESCE(AVG(saldo), 0) as saldoPromedio
        FROM cuenta
        WHERE idUsuario = ?
      `, [idUsuario]);

      const usuario = await this.db.query(`
        SELECT 
          idUsuario,
          CONCAT(nombre, ' ', apellido) as nombreCompleto,
          email
        FROM usuario
        WHERE idUsuario = ?
      `, [idUsuario]);

      return {
        usuario: usuario[0] || null,
        resumen: resumen[0] || { totalCuentas: 0, saldoTotal: 0, saldoPromedio: 0 },
        porTipo: result || []
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas de cuentas por usuario:", error);
      throw error;
    }
  }
}