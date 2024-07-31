import { destroy, get, post } from "./config";

export const Cotizacion = {
  obtenerUltimoFolio: () => get("cotizaciones/obtenerUltimoFolio"),
  crearCotizacion: (body) => post("cotizaciones", body),
  descargarCotizacion: (id) => get("cotizaciones/descargar/" + id),
  agregarProductoCotizacion: (body) => post("productoCotizaciones", body),
  obtenerCotizaciones: () => get("cotizaciones"),
  eliminarCotizacion: (id) => destroy("cotizaciones/" + id),
};
