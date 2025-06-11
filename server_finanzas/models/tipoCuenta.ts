import { conexion } from "./conexion.ts";

export interface TipoCuenta {
  idTipoCuenta?: number;
  tipo: string;
}

export class TipoCuentaModel {
  private db = conexion;

  // Obtener todos los tipos de cuenta
  async obtenerTodos(): Promise<TipoCuenta[]> {
    try {
      const result = await this.db.query(
        "SELECT * FROM tipoCuenta ORDER BY tipo ASC"
      );
      return result as TipoCuenta[];
    } catch (error) {
      console.error("Error obteniendo tipos de cuenta:", error);
      throw error;
    }
  }

  // Obtener tipo de cuenta por ID
  async obtenerPorId(id: number): Promise<TipoCuenta | null> {
    try {
      const result = await this.db.query(
        "SELECT * FROM tipoCuenta WHERE idTipoCuenta = ?",
        [id]
      );
      return result.length > 0 ? result[0] as TipoCuenta : null;
    } catch (error) {
      console.error("Error obteniendo tipo de cuenta por ID:", error);
      throw error;
    }
  }

  // Crear nuevo tipo de cuenta
  async crear(tipoCuenta: Omit<TipoCuenta, 'idTipoCuenta'>): Promise<number> {
    try {
      // Verificar si ya existe
      const existe = await this.db.query(
        "SELECT idTipoCuenta FROM tipoCuenta WHERE LOWER(tipo) = LOWER(?)",
        [tipoCuenta.tipo]
      );

      if (existe.length > 0) {
        throw new Error("Ya existe un tipo de cuenta con ese nombre");
      }

      const result = await this.db.query(
        "INSERT INTO tipoCuenta (tipo) VALUES (?)",
        [tipoCuenta.tipo]
      );
      return result.insertId as number;
    } catch (error) {
      console.error("Error creando tipo de cuenta:", error);
      throw error;
    }
  }

  // Actualizar tipo de cuenta
  async actualizar(id: number, tipoCuenta: Partial<TipoCuenta>): Promise<boolean> {
    try {
      if (!tipoCuenta.tipo) return false;

      // Verificar si ya existe otro con el mismo nombre
      const existe = await this.db.query(
        "SELECT idTipoCuenta FROM tipoCuenta WHERE LOWER(tipo) = LOWER(?) AND idTipoCuenta != ?",
        [tipoCuenta.tipo, id]
      );

      if (existe.length > 0) {
        throw new Error("Ya existe un tipo de cuenta con ese nombre");
      }

      const result = await this.db.query(
        "UPDATE tipoCuenta SET tipo = ? WHERE idTipoCuenta = ?",
        [tipoCuenta.tipo, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error actualizando tipo de cuenta:", error);
      throw error;
    }
  }

  // Eliminar tipo de cuenta
  async eliminar(id: number): Promise<boolean> {
    try {
      // Verificar si está en uso
      const enUso = await this.db.query(
        "SELECT COUNT(*) as count FROM cuenta WHERE idTipoCuenta = ?",
        [id]
      );

      if (enUso[0]?.count > 0) {
        throw new Error("No se puede eliminar el tipo de cuenta porque está siendo utilizado por una o más cuentas");
      }

      const result = await this.db.query(
        "DELETE FROM tipoCuenta WHERE idTipoCuenta = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error eliminando tipo de cuenta:", error);
      throw error;
    }
  }

  // Verificar uso del tipo de cuenta
  async verificarUso(id: number): Promise<{enUso: boolean, detalles: any}> {
    try {
      const cuentas = await this.db.query(
        "SELECT COUNT(*) as count FROM cuenta WHERE idTipoCuenta = ?",
        [id]
      );

      const countCuentas = cuentas[0]?.count || 0;

      return {
        enUso: countCuentas > 0,
        detalles: {
          cuentas: countCuentas
        }
      };
    } catch (error) {
      console.error("Error verificando uso del tipo de cuenta:", error);
      throw error;
    }
  }
}