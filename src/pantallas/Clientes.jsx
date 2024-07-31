import {
  Button,
  Container,
  Flex,
  Modal,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Cliente } from "../servicios/clientes";
import { useDisclosure } from "@mantine/hooks";
import CrearActualizarCliente from "../modales/CrearActualizarCliente";
import { notifications } from "@mantine/notifications";

const clienteVacio = {
  id: null,
  nombre: null,
  logo: null,
  correo: null,
  telefono: null,
  domicilio: null,
};

export default function Clientes() {
  const [clienteSeleccionado, actualizarClienteSeleccionado] =
    useState(clienteVacio);
  const [clientes, actualizarClientes] = useState([]);
  const [crearCiente, setCrearCliente] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    Cliente.obtenerCliente().then((result) => {
      actualizarClientes(result.data);
      setRefresh(false);
    });
  }, [refresh]);

  const rows = clientes.map((cliente) => (
    <Table.Tr
      key={cliente.id}
      bg={
        clienteSeleccionado.id === cliente.id
          ? "var(--mantine-color-blue-light)"
          : undefined
      }
      onClick={() => {
        actualizarClienteSeleccionado(cliente);
      }}
    >
      <Table.Td>{cliente.nombre}</Table.Td>
      <Table.Td>{cliente.correo}</Table.Td>
      <Table.Td>{cliente.telefono}</Table.Td>
    </Table.Tr>
  ));

  const clienteCreado = () => {
    close();
    setRefresh(true);
    setCrearCliente(false);
    actualizarClienteSeleccionado(clienteVacio);
    notifications.show({
      title: crearCiente ? "Cliente Creado con Exito" : "Cliente Actualizado",
      message: crearCiente ? "Cliente Nuevo Agregado" : "Cliente Modificado",
    });
  };

  const eliminarCliente = () => {
    Cliente.eliminarCliente(clienteSeleccionado.id)
      .then((result) => {
        setRefresh(true);
        actualizarClienteSeleccionado(clienteVacio);
        notifications.show({
          title: "Cliente Eliminado",
          message: "Se eliminado el cliente " + result.data.descripcion,
        });
      })
      .catch((error) => {
        console.error(error);
        notifications.show({
          title: "No se pudo eliminar el cliente",
          message: "Ocurrio un error",
        });
      });
  };

  return (
    <Stack>
      <Modal
        opened={opened}
        onClose={close}
        title={crearCiente ? "Crear Cliente" : "Modificar Cliente"}
      >
        <CrearActualizarCliente
          clienteCreado={clienteCreado}
          crearCliente={crearCiente}
          clienteSeleccionado={clienteSeleccionado}
        />
      </Modal>
      <Title>Clientes</Title>
      <Flex gap="md">
        <Button
          onClick={() => {
            setCrearCliente(true);
            open();
          }}
        >
          Crear cliente
        </Button>
        {clienteSeleccionado.id === null ? (
          <Button disabled>Modificar cliente</Button>
        ) : (
          <Button
            onClick={() => {
              setCrearCliente(false);
              open();
            }}
          >
            Modificar cliente
          </Button>
        )}
        {clienteSeleccionado.id === null ? (
          <Button disabled>Eliminar cliente</Button>
        ) : (
          <Button onClick={eliminarCliente}>Eliminar cliente</Button>
        )}
      </Flex>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nombre del Cliente</Table.Th>
            <Table.Th>Correo</Table.Th>
            <Table.Th>Telefono</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Stack>
  );
}
