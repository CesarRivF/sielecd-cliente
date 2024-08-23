import {
  Button,
  ColorInput,
  Container,
  Flex,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Cotizacion } from "../servicios/cotizaciones";
import { notifications } from "@mantine/notifications";
import { BASE_URL } from "../servicios/config";
import { useNavigate } from "react-router-dom";
const cotizacionVacia = {
  id: null,
};
export default function Historial() {
  const [cotizaciones, actualizarCotizaciones] = useState([]);
  const [cotizacionSeleccionada, actualizarCotizacionSeleccionada] =
    useState(cotizacionVacia);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Cotizacion.obtenerCotizaciones().then((result) => {
      actualizarCotizaciones(result.data);
      setRefresh(false);
    });
  }, [refresh]);
  const renglones = cotizaciones.map((cotizacion) => (
    <Table.Tr
      key={cotizacion.id}
      bg={
        cotizacionSeleccionada.id === cotizacion.id
          ? "var(--mantine-color-blue-light)"
          : undefined
      }
      onClick={() => {
        actualizarCotizacionSeleccionada(cotizacion);
      }}
    >
      <Table.Td>{cotizacion.id}</Table.Td>
      <Table.Td>{cotizacion.cliente.nombre}</Table.Td>
      <Table.Td>
        {new Date(cotizacion.fechaCreacion).toLocaleDateString()}
      </Table.Td>
      <Table.Td>${cotizacion.total.toLocaleString("en")}</Table.Td>
    </Table.Tr>
  ));

  const eliminarCotizacion = () => {
    Cotizacion.eliminarCotizacion(cotizacionSeleccionada.id)
      .then((result) => {
        setRefresh(true);
        actualizarCotizacionSeleccionada(cotizacionVacia);
        notifications.show({
          title: "Cotizacion Eliminada",
          message: "Se eliminado la Cotizacion con Folio " + result.data.id,
        });
      })
      .catch((error) => {
        console.error(error);
        notifications.show({
          title: "No se pudo eliminar la cotizacion",
          message: "Ocurrio un error",
        });
      });
  };

  return (
    <Stack>
      <Title>Historial</Title>
      <Flex gap="md">
        <Button
          disabled={cotizacionSeleccionada.id === null}
          onClick={() => navigate("/cotizaciones/" + cotizacionSeleccionada.id)}
        >
          Ver Detalle
        </Button>
        <Button
          disabled={cotizacionSeleccionada.id === null}
          onClick={() =>
            window.open(
              BASE_URL +
                "/api/cotizaciones/descargar/" +
                cotizacionSeleccionada.id,
              "_blank"
            )
          }
        >
          Descargar
        </Button>
        <Button
          disabled={cotizacionSeleccionada.id === null}
          onClick={eliminarCotizacion}
        >
          Eliminar
        </Button>
      </Flex>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>No. Folio</Table.Th>
            <Table.Th>Cliente</Table.Th>
            <Table.Th>Fecha</Table.Th>
            <Table.Th>Importe</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{renglones}</Table.Tbody>
      </Table>
    </Stack>
  );
}
