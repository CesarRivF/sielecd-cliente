import { get, post } from "./config";

export const Categoria = {
  obtenerCategorias: () => get("categorias"),
  crearCategoria: (body) => post("categorias", body),
};
