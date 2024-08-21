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
  TextInput,
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
import { BASE_URL } from "../servicios/config";
import { useForm } from "@mantine/form";

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
  const [refreshClientes, setRefreshClientes] = useState(false);
  const [refreshProductos, setRefreshProductos] = useState(false);

  useEffect(() => {
    Cotizacion.obtenerUltimoFolio().then((result) =>
      setFolio(result.data.ultimoFolio + 1)
    );
  }, []);

  useEffect(() => {
    Cliente.obtenerCliente().then((result) => setClientes(result.data));
    setRefreshClientes(false);
  }, [refreshClientes]);

  useEffect(() => {
    Producto.obtenerProductos().then((result) => setProductos(result.data));
    setRefreshProductos(false);
  }, [refreshProductos]);

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
        if (productosAgregados.find((x) => x.id === productoEncontrado.id)) {
          const productosActualizados = productosAgregados.map((product) =>
            product.id === productoEncontrado.id
              ? {
                  ...product,
                  cantidad: product.cantidad + valorCantidad,
                  importe:
                    (product.cantidad + valorCantidad) *
                    productoEncontrado.precio_unitario,
                }
              : product
          );
          setProductosAgregados(productosActualizados);
        } else {
          setProductosAgregados(
            productosAgregados.concat({
              ...productoEncontrado,
              cantidad: valorCantidad,
              importe: valorCantidad * productoEncontrado.precio_unitario,
            })
          );
        }
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

  const formCambiarCantidad = useForm({
    mode: "uncontrolled",
    initialValues: {
      nuevaCantidad: 1,
    },
  });

  const cambiarCantidad = (index, producto) =>
    modals.open({
      centered: true,
      title: "Actualizar cantidad ",
      children: (
        <>
          <form
            onSubmit={formCambiarCantidad.onSubmit((values) => {
              productosAgregados[index].cantidad = values.nuevaCantidad;
              productosAgregados[index].importe =
                values.nuevaCantidad *
                productosAgregados[index].precio_unitario;
              setProductosAgregados([...productosAgregados]);
              formCambiarCantidad.reset();
            })}
          >
            <NumberInput
              placeholder="Ingresa la nueva cantidad"
              allowDecimal={false}
              allowNegative={false}
              min={1}
              key={formCambiarCantidad.key("nuevaCantidad")}
              {...formCambiarCantidad.getInputProps("nuevaCantidad")}
            />
            <Button
              type="submit"
              fullWidth
              onClick={() => modals.closeAll()}
              mt="md"
            >
              Actualizar
            </Button>
          </form>
        </>
      ),
    });

  const formCambiarPrecio = useForm({
    mode: "uncontrolled",
    initialValues: {
      precio_unitario: 0,
    },
  });
  const abrirModalCambiarPrecio = (product) =>
    modals.open({
      centered: true,
      title: "Actualizar Precio",
      children: (
        <>
          <form
            onSubmit={formCambiarPrecio.onSubmit((values) => {
              formCambiarPrecio.reset();
              Producto.actualizarProducto(product.id, values)
                .then((res) => {
                  const productoActualizado = res.data;
                  for (const producto of productosAgregados) {
                    if (producto.id === productoActualizado.id) {
                      producto.precio_unitario =
                        productoActualizado.precio_unitario;
                      producto.importe =
                        producto.cantidad * producto.precio_unitario;
                    }
                  }
                  setProductosAgregados([...productosAgregados]);
                })
                .catch((err) => console.error(err));
            })}
          >
            <NumberInput
              placeholder="Ingresa la nueva cantidad"
              allowDecimal={false}
              allowNegative={false}
              min={0}
              prefix="$"
              hideControls
              key={formCambiarPrecio.key("precio_unitario")}
              {...formCambiarPrecio.getInputProps("precio_unitario")}
            />

            <Button
              type="submit"
              fullWidth
              onClick={() => modals.closeAll()}
              mt="md"
            >
              Actualizar
            </Button>
          </form>
        </>
      ),
    });

  const abrirModalEliminarProducto = (productIndex) =>
    modals.openConfirmModal({
      title: "Eliminar producto",
      centered: true,
      children: (
        <Text size="sm">
          ¿Estás seguro que deseas eliminar el producto de la cotización?
        </Text>
      ),
      labels: { confirm: "Eliminar", cancel: "No eliminar" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => {
        productosAgregados.splice(productIndex, 1);
        setProductosAgregados([...productosAgregados]);
      },
    });

  const renglones = productosAgregados.map((producto, index) => (
    <Table.Tr key={producto.id}>
      <Table.Td>
        <MenuProducto
          productIndex={index}
          producto={producto}
          cambiarCantidad={cambiarCantidad}
          cambiarPrecio={abrirModalCambiarPrecio}
          eliminarProducto={abrirModalEliminarProducto}
        />
      </Table.Td>

      <Table.Td>{producto.cantidad}</Table.Td>
      <Table.Td>{producto.descripcion}</Table.Td>
      <Table.Td>{producto.unidad}</Table.Td>
      <Table.Td>$ {producto.precio_unitario.toLocaleString("en")}</Table.Td>
      <Table.Td>$ {producto.importe.toLocaleString("en")}</Table.Td>
    </Table.Tr>
  ));

  const clienteCreadoExitosamente = (cliente) => {
    setRefreshClientes(true);
    setClienteSeleccionado(cliente);
    setValorCliente("");
  };

  const productoCreadoExitosamente = (nuevoProducto) => {
    setRefreshProductos(true);
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
            Cambiar Cliente
          </Button>
        )}
        {clienteSeleccionado.id == null && (
          <Button
            disabled={valorCliente === ""}
            onClick={() => seleccionarCliente("Enter")}
          >
            Asignar Cliente
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
          placeholder="Buscar productos"
          value={valorProducto}
          onChange={setValorProducto}
          onKeyUp={(value) => agregarProducto(value.key)}
          data={productos.map((producto) => producto.descripcion)}
        />
        <Button
          disabled={valorProducto === ""}
          onClick={() => agregarProducto("Enter")}
        >
          Agregar
        </Button>
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
                BASE_URL + "/api/cotizaciones/descargar/" + cotizacion.id,
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
          {productosAgregados
            .reduce((acc, producto) => acc + producto.importe, 0)
            .toLocaleString("en")}
        </Title>
      </Flex>
    </Stack>
  );
}
