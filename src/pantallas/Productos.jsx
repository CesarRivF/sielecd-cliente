import {
  Button,
  Container,
  Flex,
  Title,
  Table,
  Modal,
  Stack,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Producto } from "../servicios/productos";
import { useDisclosure } from "@mantine/hooks";
import CrearActualizarProducto from "../modales/CrearActualizarProducto";
import { notifications } from "@mantine/notifications";

const productoVacio = {
  categoria_Id: null,
  descripcion: null,
  id: null,
  modelo: null,
  precio_unitario: null,
  unidad: null,
};

export default function Productos() {
  const [productoSeleccionado, actualizarProductoSeleccionado] =
    useState(productoVacio);
  const [productos, actualizarProductos] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [crearProducto, setCrearProducto] = useState(false);

  useEffect(() => {
    Producto.obtenerProductos()
      .then((result) => {
        actualizarProductos(result.data);
        setRefresh(false);
      })
      .catch((error) => console.error(error));
  }, [refresh]);

  const rows = productos.map((producto) => (
    <Table.Tr
      key={producto.id}
      bg={
        productoSeleccionado.id === producto.id
          ? "var(--mantine-color-blue-light)"
          : undefined
      }
      onClick={() => {
        actualizarProductoSeleccionado(producto);
      }}
    >
      <Table.Td>{producto.descripcion}</Table.Td>
      <Table.Td>${producto.precio_unitario}</Table.Td>
      <Table.Td>{producto.categoria.nombre}</Table.Td>
      <Table.Td>{producto.unidad}</Table.Td>
    </Table.Tr>
  ));

  const [opened, { open, close }] = useDisclosure(false);

  const eliminarProducto = () => {
    Producto.eliminarProducto(productoSeleccionado.id)
      .then((result) => {
        setRefresh(true);
        actualizarProductoSeleccionado(productoVacio);
        notifications.show({
          title: "Producto Eliminado",
          message: "Se eliminado el producto " + result.data.descripcion,
        });
      })
      .catch((error) => {
        console.error(error);
        notifications.show({
          title: "No se pudo eliminar el producto",
          message: "Ocurrio un error",
        });
      });
  };

  const onSuccess = () => {
    close();
    setRefresh(true);
    setCrearProducto(true);
    actualizarProductoSeleccionado(productoVacio);
    notifications.show({
      title: crearProducto
        ? "Producto creado con Exito"
        : "Producto Actualizo con Exito",
      message: crearProducto
        ? "Producto Nuevo Agregado"
        : "Producto Modificado",
    });
  };

  return (
    <Stack>
      <Modal
        opened={opened}
        onClose={close}
        title={crearProducto ? "Crear Nuevo Producto" : "Actualizar Producto"}
      >
        <CrearActualizarProducto
          success={onSuccess}
          crearProducto={crearProducto}
          productoSeleccionado={productoSeleccionado}
        />
      </Modal>
      <Title>Productos</Title>
      <Flex gap="md">
        <Button
          onClick={() => {
            setCrearProducto(true);
            open();
          }}
        >
          Nuevo producto
        </Button>
        {productoSeleccionado.id === null ? (
          <Button disabled>Actualizar producto</Button>
        ) : (
          <Button
            onClick={() => {
              setCrearProducto(false);
              open();
            }}
          >
            Actualizar producto
          </Button>
        )}
        {productoSeleccionado.id === null ? (
          <Button disabled>Eliminar producto</Button>
        ) : (
          <Button onClick={eliminarProducto}>Eliminar producto</Button>
        )}
      </Flex>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nombre del Producto</Table.Th>
            <Table.Th>Precio</Table.Th>
            <Table.Th>Categoria</Table.Th>
            <Table.Th>Unidad de Medida</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Stack>
  );
}
