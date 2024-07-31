import {
  Autocomplete,
  Button,
  Divider,
  Flex,
  NumberInput,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Producto } from "../servicios/productos";
import { Cliente } from "../servicios/clientes";
import CrearActualizarCliente from "../modales/CrearActualizarCliente";
import CrearActualizarProducto from "../modales/CrearActualizarProducto";
import { modals } from "@mantine/modals";
import MenuProducto from "../modales/MenuProducto";
import { Cotizacion } from "../servicios/cotizaciones";
import { notifications } from "@mantine/notifications";

const clienteVacio = {
  id: null,
  nombre: null,
  logo: null,
  correo: null,
  telefono: null,
  domicilio: null,
};
const cotizacionVacia = {
  id: null,
};

export default function Cotizaciones() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(clienteVacio);
  const [lugarDeEntrega, setLugarDeEntrega] = useState("");
  const [diasDeCotizacion, setDiasDeCotizacion] = useState(1);

  const [valorCliente, setValorCliente] = useState("");
  const [valorProducto, setValorProducto] = useState("");
  const [valorCantidad, setValorCantidad] = useState(1);
  const [folio, setFolio] = useState(0);

  const [productosAgregados, setProductosAgregados] = useState([]);
  const [cotizacion, setCotizacion] = useState(cotizacionVacia);

  useEffect(() => {
    Producto.obtenerProductos().then((result) => setProductos(result.data));
    Cliente.obtenerCliente().then((result) => setClientes(result.data));
    Cotizacion.obtenerUltimoFolio().then((result) =>
      setFolio(result.data.ultimoFolio + 1)
    );
  }, []);
  const seleccionarCliente = (key) => {
    if (key === "Enter") {
      const clienteEncontrado = clientes.find(
        (cliente) => cliente.nombre === valorCliente
      );
      if (clienteEncontrado) {
        setClienteSeleccionado(clienteEncontrado);
        setValorCliente("");
      } else {
        modals.open({
          title: "Crear nuevo cliente",
          children: (
            <CrearActualizarCliente
              clienteCreado={clienteCreadoExitosamente}
              crearCliente={true}
              nombreCliente={valorCliente}
            />
          ),
        });
      }
    }
  };

  const agregarProducto = (key) => {
    if (key === "Enter") {
      const productoEncontrado = productos.find(
        (producto) => producto.descripcion === valorProducto
      );
      if (productoEncontrado) {
        productoEncontrado.cantidad = valorCantidad;
        productoEncontrado.importe =
          valorCantidad * productoEncontrado.precio_unitario;
        setProductosAgregados(
          productosAgregados.concat(Array(productoEncontrado))
        );
        setValorCantidad(1);
        setValorProducto("");
      } else {
        modals.open({
          title: "Crear nuevo producto",
          children: (
            <CrearActualizarProducto
              crearProducto={true}
              nombreProducto={valorProducto}
              success={productoCreadoExitosamente}
            />
          ),
        });
      }
    }
  };

  const renglones = productosAgregados.map((producto) => (
    <Table.Tr key={producto.id}>
      <Table.Td>
        <MenuProducto />
      </Table.Td>

      <Table.Td>{producto.cantidad}</Table.Td>
      <Table.Td>{producto.descripcion}</Table.Td>
      <Table.Td>{producto.unidad}</Table.Td>
      <Table.Td>$ {producto.precio_unitario}</Table.Td>
      <Table.Td>$ {producto.importe}</Table.Td>
    </Table.Tr>
  ));

  const clienteCreadoExitosamente = (cliente) => {
    setClienteSeleccionado(cliente);
    setValorCliente("");
  };

  const productoCreadoExitosamente = (nuevoProducto) => {
    nuevoProducto.cantidad = valorCantidad;
    nuevoProducto.importe = valorCantidad * nuevoProducto.precio_unitario;
    setProductosAgregados(productosAgregados.concat(Array(nuevoProducto)));
    setValorCantidad(1);
    setValorProducto("");
  };

  const confirmarCotizacion = () =>
    modals.openConfirmModal({
      title: "Desea crear la cotizacion",
      children: (
        <Text size="sm">¿Revisó correctamente todos los datos ingresados?</Text>
      ),
      labels: { confirm: "Confirmar", cancel: "Cancelar" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => {
        const bodyCotizacion = {
          diasCotizacion: diasDeCotizacion,
          clienteId: clienteSeleccionado.id,
          lugarDeEntrega: lugarDeEntrega,
        };
        Cotizacion.crearCotizacion(bodyCotizacion)
          .then((result) => {
            setCotizacion(result.data);
            productosAgregados.map((producto) => {
              const bodyProducto = {
                cotizacionId: result.data.id,
                productoId: producto.id,
                cantidad: producto.cantidad,
              };
              Cotizacion.agregarProductoCotizacion(bodyProducto)
                .then((result) =>
                  notifications.show({
                    title: "Cotización creada con exito",
                    message: "Se creó la cotización correctamente",
                  })
                )
                .catch((error) => console.error(error));
            });
          })
          .catch((error) => console.error(error));
      },
    });

  return (
    <Stack>
      <Title>Cotización</Title>
      <Flex gap="md" align="center">
        <Text size="h2">Folio: {folio}</Text>
        <Text size="h2">Dias de Cotizacion: {} </Text>
        <NumberInput
          onChange={(value) => setDiasDeCotizacion(value)}
          defaultValue={1}
          min={1}
        ></NumberInput>
        <Text size="h2">Lugar de Entrega: {} </Text>
        <Autocomplete
          onChange={(value) => setLugarDeEntrega(value)}
          placeholder="Punto de Recepcion"
        />
      </Flex>

      {/*Datos del cliente*/}
      <Divider my="xs" label="Datos del cliente" labelPosition="left" />
      <Flex gap="md" align="center">
        <Text>
          Cliente:{" "}
          {clienteSeleccionado.id != null ? clienteSeleccionado.nombre : ""}
        </Text>
        {clienteSeleccionado.id == null && (
          <Autocomplete
            value={valorCliente}
            onChange={setValorCliente}
            placeholder="Seleccione cliente"
            onKeyUp={(value) => seleccionarCliente(value.key)}
            data={clientes.map((cliente) => cliente.nombre)}
          />
        )}
        {clienteSeleccionado.id && (
          <Button onClick={() => setClienteSeleccionado(clienteVacio)}>
            Cambiar cliente
          </Button>
        )}
      </Flex>
      <Flex gap="xl">
        {clienteSeleccionado.id != null && (
          <Text>Correo: {clienteSeleccionado.correo}</Text>
        )}
        {clienteSeleccionado.id != null && (
          <Text>Telefono: {clienteSeleccionado.telefono}</Text>
        )}
        {clienteSeleccionado.id != null && (
          <Text>Domicilio: {clienteSeleccionado.domicilio}</Text>
        )}
      </Flex>

      {/*Productos*/}
      <Divider my="xs" label="Productos" labelPosition="left" />
      <Flex gap="md" align="center">
        <Text>Cantidad: </Text>
        <NumberInput
          value={valorCantidad}
          onChange={setValorCantidad}
          defaultValue={1}
          min={1}
        ></NumberInput>
        <Text>Producto:</Text>
        <Autocomplete
          placeholder="Agregar productos"
          value={valorProducto}
          onChange={setValorProducto}
          onKeyUp={(value) => agregarProducto(value.key)}
          data={productos.map((producto) => producto.descripcion)}
        />
      </Flex>
      <ScrollArea h={370}>
        <Table
          stickyHeader
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th></Table.Th>

              <Table.Th>Cantidad</Table.Th>
              <Table.Th>Producto</Table.Th>
              <Table.Th>Unidad</Table.Th>
              <Table.Th>Precio</Table.Th>
              <Table.Th>Importe</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{renglones}</Table.Tbody>
        </Table>
      </ScrollArea>

      <Divider />
      <Flex
        mih={50}
        gap="md"
        justify="flex-end"
        align="center"
        direction="row"
        wrap="wrap"
      >
        {cotizacion.id === null ? (
          <Button disabled>Descargar Cotización</Button>
        ) : (
          <Button
            onClick={() =>
              window.open(
                "http://localhost:4000/api/cotizaciones/descargar/" +
                  cotizacion.id,
                "_blank"
              )
            }
          >
            Descargar Cotización
          </Button>
        )}
        {clienteSeleccionado.id === null ||
        lugarDeEntrega == "" ||
        productosAgregados.length < 1 ? (
          <Button disabled>Crear Cotizacion</Button>
        ) : (
          <Button onClick={confirmarCotizacion}>Crear Cotizacion</Button>
        )}
        <Title size="h3">
          Total: $
          {productosAgregados.reduce(
            (acc, producto) => acc + producto.importe,
            0
          )}
        </Title>
      </Flex>
    </Stack>
  );
}
