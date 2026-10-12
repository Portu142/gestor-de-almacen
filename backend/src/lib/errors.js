// src/lib/errors.js — error de aplicación con código HTTP asociado
// Las capas de negocio lanzan AppError; las rutas solo traducen la respuesta.
export class AppError extends Error {
  constructor(mensaje, status = 400) {
    super(mensaje);
    this.name = 'AppError';
    this.status = status;
  }
}

export const errorNoEncontrado = (recurso) => new AppError(`${recurso} no encontrado`, 404);
export const errorConflicto = (mensaje) => new AppError(mensaje, 409);

// Envuelve handlers async para pasar los errores al manejador central de Express.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
