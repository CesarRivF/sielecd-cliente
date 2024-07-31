import {
  Autocomplete,
  Button,
  Container,
  NumberInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Categoria } from "../servicios/categorias";
import { useForm } from "@mantine/form";
import { Producto } from "../servicios/productos";
import { modals } from "@mantine/modals";

export default function CrearActualizarProducto({
  success,
  crearProducto,
  productoSeleccionado,
  nombreProducto = "",
}) {
  const [categorias, actualizarCategorias] = useState([]);
  useEffect(() => {
    Categoria.obtenerCategorias()
      .then((result) => actualizarCategorias(result.data))
      .catch((error) => console.error(error));
  }, []);
  const nombresCategorias = categorias.map((categoria) => categoria.nombre);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      descripcion: crearProducto
        ? nombreProducto
        : productoSeleccionado.descripcion,
      unidad: crearProducto ? "" : productoSeleccionado.unidad,
      precio_unitario: crearProducto
        ? ""
        : productoSeleccionado.precio_unitario,
      categoria: crearProducto ? "" : productoSeleccionado.categoria.nombre,
    },
    validate: {
      descripcion: (value) => (value === "" ? "Ingresa una descripcion" : null),
      precio_unitario: (value) => (value === "" ? "Ingresa un precio" : null),
      unidad: (value) => (value === "" ? "Ingresa una unidad" : null),
      categoria: (value) => (value === "" ? "Ingresa una categoria" : null),
    },
  });

  return (
    <Container>
      <form
        onSubmit={form.onSubmit((valores) => {
          if (crearProducto) {
            Producto.crearProducto(valores)
              .then((result) => {
                modals.closeAll();
                success(result.data);
              })
              .catch((error) => console.error(error));
          } else {
            Producto.actualizarProducto(productoSeleccionado.id, valores)
              .then((result) => {
                modals.closeAll();
                success();
              })
              .catch((error) => console.error(error));
          }
        })}
      >
        <Stack>
          <TextInput
            label="Descripcion"
            placeholder="Ingrese la descripcion"
            key={form.key("descripcion")}
            {...form.getInputProps("descripcion")}
          />
          <NumberInput
            label="Precio"
            placeholder="Ingrese el Precio"
            thousandSeparator=","
            prefix="$"
            hideControls
            key={form.key("precio_unitario")}
            {...form.getInputProps("precio_unitario")}
          />
          <Autocomplete
            label="Unidad"
            placeholder="Ingrese la Unidad"
            data={["Pieza", "Metro", "Servicio"]}
            key={form.key("unidad")}
            {...form.getInputProps("unidad")}
          />
          <Autocomplete
            label="Categoria"
            placeholder="Ingrese la Categoria"
            data={nombresCategorias}
            key={form.key("categoria")}
            {...form.getInputProps("categoria")}
          />
          <Button type="submit">
            {crearProducto ? "Crear Producto" : "Actualizar Producto"}
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
