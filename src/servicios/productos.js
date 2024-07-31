import { destroy, get, post, put } from "./config";

export const Producto = {
  obtenerProductos: () => get("productos"),
  crearProducto: (body) => post("productos", body),
  eliminarProducto: (id) => destroy("productos/" + id),
  actualizarProducto: (id, body) => put("productos/" + id, body),
};
