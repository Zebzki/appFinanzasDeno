import { Context } from "https://deno.land/x/oak@v17.1.3/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.1/mod.ts";
import { CuentaModel } from "../models/cuenta.ts";

const cuentaSchema = z.object({
  nombreCuenta: z.string().min(1, "El nombre es requerido").max(35, "El nombre es muy largo"),
  idTipoCuenta: z.number().int().positive("El tipo de cuenta es requerido"),
  saldo: z.number().min(0, "El saldo no puede ser negativo"),
  idUsuario: z.number().int().positive("El ID del usuario es requerido")
});

const saldoSchema = z.object({
  saldo: z.number().min(0, "El saldo no puede ser negativo")
});

type ContextWithParams = Context & {
  params: {
    id?: string;
    usuarioId?: string;
  };
};

export class CuentaController {
  private cuentaModel = new CuentaModel();

  // Listar TODAS las cuentas
  async obtenerTodas(ctx: Context) {
    try {
      const cuentas = await this.cuentaModel.obtenerTodas();
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: cuentas,
        message: `${cuentas.length} cuentas obtenidas exitosamente`
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

  // NUEVO: Listar cuentas por usuario
  async obtenerPorUsuario(ctx: ContextWithParams) {
    try {
      const idUsuario = parseInt(ctx.params?.usuarioId as string);
      
      if (isNaN(idUsuario)) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "ID de usuario inválido"
        };
        return;
      }

      const cuentas = await this.cuentaModel.obtenerPorUsuario(idUsuario);
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: cuentas,
        message: `${cuentas.length} cuentas del usuario obtenidas exitosamente`
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

  // Obtener cuenta por ID
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

      const cuenta = await this.cuentaModel.obtenerPorId(id);
      
      if (!cuenta) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          error: "Cuenta no encontrada"
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: cuenta,
        message: "Cuenta obtenida exitosamente"
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

  // Crear nueva cuenta
  async crear(ctx: Context) {
    try {
      const body = await ctx.request.body.json();
      
      const validacion = cuentaSchema.safeParse(body);
      if (!validacion.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Datos inválidos",
          details: validacion.error.errors
        };
        return;
      }

      const nuevaCuenta = validacion.data;
      const id = await this.cuentaModel.crear(nuevaCuenta);

      ctx.response.status = 201;
      ctx.response.body = {
        success: true,
        data: { idCuenta: id, ...nuevaCuenta },
        message: "Cuenta creada exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes("Ya existe una cuenta")) {
        ctx.response.status = 409;
        ctx.response.body = {
          success: false,
          error: "Cuenta duplicada",
          message: errorMessage
        };
        return;
      }

      if (errorMessage.includes("Tipo de cuenta no existe")) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Tipo de cuenta inválido",
          message: errorMessage
        };
        return;
      }

      if (errorMessage.includes("Usuario no existe")) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Usuario inválido",
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

  // Actualizar cuenta
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
      
      const updateSchema = cuentaSchema.partial();
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

      const actualizado = await this.cuentaModel.actualizar(id, validacion.data);
      
      if (!actualizado) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          error: "Cuenta no encontrada o sin cambios"
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Cuenta actualizada exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes("Ya existe una cuenta")) {
        ctx.response.status = 409;
        ctx.response.body = {
          success: false,
          error: "Cuenta duplicada",
          message: errorMessage
        };
        return;
      }

      if (errorMessage.includes("Tipo de cuenta no existe")) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Tipo de cuenta inválido",
          message: errorMessage
        };
        return;
      }

      if (errorMessage.includes("Usuario no existe")) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Usuario inválido",
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

  // Actualizar solo el saldo
  async actualizarSaldo(ctx: ContextWithParams) {
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
      
      const validacion = saldoSchema.safeParse(body);
      if (!validacion.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Datos inválidos",
          details: validacion.error.errors
        };
        return;
      }

      const actualizado = await this.cuentaModel.actualizarSaldo(id, validacion.data.saldo);
      
      if (!actualizado) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          error: "Cuenta no encontrada"
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Saldo actualizado exitosamente"
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

  // Obtener cuentas con información de uso
  async obtenerConUso(ctx: Context) {
    try {
      const cuentas = await this.cuentaModel.obtenerConUso();
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: cuentas,
        message: `${cuentas.length} cuentas con información de uso obtenidas exitosamente`
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

  // NUEVO: Obtener cuentas con información de uso por usuario
  async obtenerConUsoPorUsuario(ctx: ContextWithParams) {
    try {
      const idUsuario = parseInt(ctx.params?.usuarioId as string);
      
      if (isNaN(idUsuario)) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "ID de usuario inválido"
        };
        return;
      }

      const cuentas = await this.cuentaModel.obtenerConUsoPorUsuario(idUsuario);
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: cuentas,
        message: `${cuentas.length} cuentas del usuario con información de uso obtenidas exitosamente`
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

  // Obtener resumen de cuentas por tipo
  async obtenerResumen(ctx: Context) {
    try {
      const resumen = await this.cuentaModel.obtenerResumen();
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: resumen,
        message: "Resumen de cuentas por tipo obtenido exitosamente"
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

  // NUEVO: Obtener resumen de cuentas por usuario
  async obtenerResumenPorUsuario(ctx: ContextWithParams) {
    try {
      const idUsuario = parseInt(ctx.params?.usuarioId as string);
      
      if (isNaN(idUsuario)) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "ID de usuario inválido"
        };
        return;
      }

      const resumen = await this.cuentaModel.obtenerResumenPorUsuario(idUsuario);
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: resumen,
        message: "Resumen de cuentas del usuario obtenido exitosamente"
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

  // Eliminar cuenta
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

      const eliminado = await this.cuentaModel.eliminar(id);
      
      if (!eliminado) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          error: "Cuenta no encontrada"
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Cuenta eliminada exitosamente"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes("tiene transacciones asociadas")) {
        ctx.response.status = 409;
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

  // Verificar uso de una cuenta
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

      const uso = await this.cuentaModel.verificarUso(id);
      
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
      const estadisticas = await this.cuentaModel.obtenerEstadisticas();
      
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

  // NUEVO: Obtener estadísticas por usuario
  async obtenerEstadisticasPorUsuario(ctx: ContextWithParams) {
    try {
      const idUsuario = parseInt(ctx.params?.usuarioId as string);
      
      if (isNaN(idUsuario)) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "ID de usuario inválido"
        };
        return;
      }

      const estadisticas = await this.cuentaModel.obtenerEstadisticasPorUsuario(idUsuario);
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: estadisticas,
        message: "Estadísticas del usuario obtenidas exitosamente"
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