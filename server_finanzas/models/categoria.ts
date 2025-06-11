import { conexion } from "./conexion.ts";

export interface Categoria {
  idCategoria?: number;
  nombreCategoria: string;
  esIngreso: boolean;
}

export class CategoriasModel {
  private db = conexion;

  
  async obtenerTodas(): Promise<Categoria[]> {
    try {
      const result = await this.db.query(
        "SELECT * FROM categoria ORDER BY esIngreso DESC, nombreCategoria ASC"
      );
      return result as Categoria[];
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
      throw error;
    }
  }

  
  async obtenerPorTipo(esIngreso: boolean): Promise<Categoria[]> {
    try {
      const result = await this.db.query(
        "SELECT * FROM categoria WHERE esIngreso = ? ORDER BY nombreCategoria ASC",
        [esIngreso ? 1 : 0]
      );
      return result as Categoria[];
    } catch (error) {
      console.error("Error obteniendo categorías por tipo:", error);
      throw error;
    }
  }

  
  async obtenerPorId(id: number): Promise<Categoria | null> {
    try {
      const result = await this.db.query(
        "SELECT * FROM categoria WHERE idCategoria = ?",
        [id]
      );
      return result.length > 0 ? result[0] as Categoria : null;
    } catch (error) {
      console.error("Error obteniendo categoría por ID:", error);
      throw error;
    }
  }

  
  async crear(categoria: Omit<Categoria, 'idCategoria'>): Promise<number> {
    try {
   
      const existe = await this.db.query(
        "SELECT idCategoria FROM categoria WHERE nombreCategoria = ? AND esIngreso = ?",
        [categoria.nombreCategoria, categoria.esIngreso ? 1 : 0]
      );

      if (existe.length > 0) {
        throw new Error("Ya existe una categoría con ese nombre para el mismo tipo");
      }

      const result = await this.db.query(
        "INSERT INTO categoria (nombreCategoria, esIngreso) VALUES (?, ?)",
        [categoria.nombreCategoria, categoria.esIngreso ? 1 : 0]
      );
      return result.insertId as number;
    } catch (error) {
      console.error("Error creando categoría:", error);
      throw error;
    }
  }

  
  async actualizar(id: number, categoria: Partial<Categoria>): Promise<boolean> {
    try {
      const campos = [];
      const valores = [];

      if (categoria.nombreCategoria !== undefined) {
        
        const existe = await this.db.query(
          "SELECT idCategoria FROM categoria WHERE nombreCategoria = ? AND esIngreso = ? AND idCategoria != ?",
          [categoria.nombreCategoria, categoria.esIngreso ? 1 : 0, id]
        );

        if (existe.length > 0) {
          throw new Error("Ya existe una categoría con ese nombre para el mismo tipo");
        }

        campos.push("nombreCategoria = ?");
        valores.push(categoria.nombreCategoria);
      }
      
      if (categoria.esIngreso !== undefined) {
        campos.push("esIngreso = ?");
        valores.push(categoria.esIngreso ? 1 : 0);
      }

      if (campos.length === 0) return false;

      valores.push(id);
      const query = `UPDATE categoria SET ${campos.join(", ")} WHERE idCategoria = ?`;

      const result = await this.db.query(query, valores);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error actualizando categoría:", error);
      throw error;
    }
  }

 
  async eliminar(id: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        "DELETE FROM categoria WHERE idCategoria = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      throw error;
    }
  }

  
  async verificarUso(id: number): Promise<{enUso: boolean, detalles: any}> {
    try {
      const presupuestos = await this.db.query(
        "SELECT COUNT(*) as count FROM presupuesto WHERE idCategoria = ?",
        [id]
      );
      
      const transacciones = await this.db.query(
        "SELECT COUNT(*) as count FROM transaccion WHERE idCategoria = ?",
        [id]
      );

      const countPresupuestos = presupuestos[0]?.count || 0;
      const countTransacciones = transacciones[0]?.count || 0;

      return {
        enUso: countPresupuestos > 0 || countTransacciones > 0,
        detalles: {
          presupuestos: countPresupuestos,
          transacciones: countTransacciones
        }
      };
    } catch (error) {
      console.error("Error verificando uso de categoría:", error);
      throw error;
    }
  }

  async obtenerEstadisticas(): Promise<any> {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as totalCategorias,
          SUM(CASE WHEN esIngreso = 1 THEN 1 ELSE 0 END) as categoriasIngreso,
          SUM(CASE WHEN esIngreso = 0 THEN 1 ELSE 0 END) as categoriasGasto
        FROM categoria
      `);

      return result[0] || { totalCategorias: 0, categoriasIngreso: 0, categoriasGasto: 0 };
    } catch (error) {
      console.error("Error obteniendo estadísticas de categorías:", error);
      throw error;
    }
  }
}