import { Context } from "https://deno.land/x/oak@v17.1.3/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.1/mod.ts";
import { CategoriasModel } from "../models/categoria.ts";

const categoriaSchema = z.object({
  nombreCategoria: z.string().min(1, "El nombre es requerido").max(30, "El nombre es muy largo"),
  esIngreso: z.boolean()
});

type ContextWithParams = Context & {
  params: {
    id?: string;
    tipo?: string;
  };
};

export class CategoriaController {
  private categoriasModel = new CategoriasModel();

  // Listar TODAS las categorías
  async obtenerTodas(ctx: Context) {
    try {
      const categorias = await this.categoriasModel.obtenerTodas();
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: categorias,
        message: `${categorias.length} categorías obtenidas exitosamente`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: "Error interno del servidor",
        details: errorMessage
      };
    }
  }

  // Obtener categorías por tipo (ingresos o gastos)
  async obtenerPorTipo(ctx: ContextWithParams) {
    try {
      const tipo = ctx.params?.tipo;
      
      if (!tipo || (tipo !== 'ingresos' && tipo !== 'gastos')) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Tipo inválido. Use 'ingresos' o 'gastos'"
        };
        return;
      }

      const esIngreso = tipo === 'ingresos';
      const categorias = await this.categoriasModel.obtenerPorTipo(esIngreso);
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: categorias,
        message: `${categorias.length} categorías de ${tipo} obtenidas exitosamente`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: "Error interno del servidor",
        details: errorMessage
      };
    }
  }

  // Obtener categoría por ID
  async obtenerPorId(ctx: ContextWithParams) {
    try {
      const id = parseInt(ctx.params?.id as string);
      
      if (isNaN(id)) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "ID inválido"
        };
        return;
      }

      const categoria = await this.categoriasModel.obtenerPorId(id);
      
      if (!categoria) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          error: "Categoría no encontrada"
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: categoria,
        message: "Categoría obtenida exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: "Error interno del servidor",
        details: errorMessage
      };
    }
  }

  // Crear nueva categoría
  async crear(ctx: Context) {
    try {
      const body = await ctx.request.body.json();
      
      const validacion = categoriaSchema.safeParse(body);
      if (!validacion.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Datos inválidos",
          details: validacion.error.errors
        };
        return;
      }

      const nuevaCategoria = validacion.data;
      const id = await this.categoriasModel.crear(nuevaCategoria);

      ctx.response.status = 201;
      ctx.response.body = {
        success: true,
        data: { idCategoria: id, ...nuevaCategoria },
        message: "Categoría creada exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes("Ya existe una categoría")) {
        ctx.response.status = 409; // Conflict
        ctx.response.body = {
          success: false,
          error: "Categoría duplicada",
          message: errorMessage
        };
        return;
      }

      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: "Error interno del servidor",
        details: errorMessage
      };
    }
  }

  // Actualizar categoría
  async actualizar(ctx: ContextWithParams) {
    try {
      const id = parseInt(ctx.params?.id as string);
      
      if (isNaN(id)) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "ID inválido"
        };
        return;
      }

      const body = await ctx.request.body.json();
      
      const updateSchema = categoriaSchema.partial();
      const validacion = updateSchema.safeParse(body);
      if (!validacion.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Datos inválidos",
          details: validacion.error.errors
        };
        return;
      }

      const actualizado = await this.categoriasModel.actualizar(id, validacion.data);
      
      if (!actualizado) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          error: "Categoría no encontrada o sin cambios"
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Categoría actualizada exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes("Ya existe una categoría")) {
        ctx.response.status = 409; // Conflict
        ctx.response.body = {
          success: false,
          error: "Categoría duplicada",
          message: errorMessage
        };
        return;
      }

      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: "Error interno del servidor",
        details: errorMessage
      };
    }
  }

  // Eliminar categoría
  async eliminar(ctx: ContextWithParams) {
    try {
      const id = parseInt(ctx.params?.id as string);
      
      if (isNaN(id)) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "ID inválido"
        };
        return;
      }

      const eliminado = await this.categoriasModel.eliminar(id);
      
      if (!eliminado) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          error: "Categoría no encontrada"
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Categoría eliminada exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: "Error interno del servidor",
        details: errorMessage
      };
    }
  }

  // Verificar uso de una categoría
  async verificarUso(ctx: ContextWithParams) {
    try {
      const id = parseInt(ctx.params?.id as string);
      
      if (isNaN(id)) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "ID inválido"
        };
        return;
      }

      const uso = await this.categoriasModel.verificarUso(id);
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: uso,
        message: "Información de uso obtenida exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: "Error interno del servidor",
        details: errorMessage
      };
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas(ctx: Context) {
    try {
      const estadisticas = await this.categoriasModel.obtenerEstadisticas();
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: estadisticas,
        message: "Estadísticas obtenidas exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: "Error interno del servidor",
        details: errorMessage
      };
    }
  }
}