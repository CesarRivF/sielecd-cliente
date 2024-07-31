import { destroy, get, post, put } from "./config";

export const Cliente = {
  obtenerCliente: () => get("clientes"),
  crearCliente: (body) => post("clientes", body),
  actualizarCliente: (id, body) => put("clientes/" + id, body),
  eliminarCliente: (id) => destroy("clientes/" + id),
};
