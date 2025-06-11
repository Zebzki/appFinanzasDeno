import { Context } from "https://deno.land/x/oak@v17.1.3/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.1/mod.ts";
import { TipoCuentaModel } from "../models/tipoCuenta.ts";

const tipoCuentaSchema = z.object({
  tipo: z.string().min(1, "El tipo es requerido").max(30, "El tipo es muy largo")
});

type ContextWithParams = Context & {
  params: {
    id?: string;
  };
};

export class TipoCuentaController {
  private tipoCuentaModel = new TipoCuentaModel();

  // Listar todos los tipos de cuenta
  async obtenerTodos(ctx: Context) {
    try {
      const tiposCuenta = await this.tipoCuentaModel.obtenerTodos();
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: tiposCuenta,
        message: `${tiposCuenta.length} tipos de cuenta obtenidos exitosamente`
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

  // Obtener tipo de cuenta por ID
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

      const tipoCuenta = await this.tipoCuentaModel.obtenerPorId(id);
      
      if (!tipoCuenta) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          error: "Tipo de cuenta no encontrado"
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: tipoCuenta,
        message: "Tipo de cuenta obtenido exitosamente"
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

  // Crear nuevo tipo de cuenta
  async crear(ctx: Context) {
    try {
      const body = await ctx.request.body.json();
      
      const validacion = tipoCuentaSchema.safeParse(body);
      if (!validacion.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Datos inválidos",
          details: validacion.error.errors
        };
        return;
      }

      const nuevoTipoCuenta = validacion.data;
      const id = await this.tipoCuentaModel.crear(nuevoTipoCuenta);

      ctx.response.status = 201;
      ctx.response.body = {
        success: true,
        data: { idTipoCuenta: id, ...nuevoTipoCuenta },
        message: "Tipo de cuenta creado exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes("Ya existe un tipo de cuenta")) {
        ctx.response.status = 409; // Conflict
        ctx.response.body = {
          success: false,
          error: "Tipo de cuenta duplicado",
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

  // Actualizar tipo de cuenta
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
      
      const updateSchema = tipoCuentaSchema.partial();
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

      const actualizado = await this.tipoCuentaModel.actualizar(id, validacion.data);
      
      if (!actualizado) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          error: "Tipo de cuenta no encontrado o sin cambios"
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Tipo de cuenta actualizado exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes("Ya existe un tipo de cuenta")) {
        ctx.response.status = 409; // Conflict
        ctx.response.body = {
          success: false,
          error: "Tipo de cuenta duplicado",
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

  // Eliminar tipo de cuenta
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

      const eliminado = await this.tipoCuentaModel.eliminar(id);
      
      if (!eliminado) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          error: "Tipo de cuenta no encontrado"
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Tipo de cuenta eliminado exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes("No se puede eliminar")) {
        ctx.response.status = 409; // Conflict
        ctx.response.body = {
          success: false,
          error: "No se puede eliminar",
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

  // Verificar uso del tipo de cuenta
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

      const uso = await this.tipoCuentaModel.verificarUso(id);
      
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
}