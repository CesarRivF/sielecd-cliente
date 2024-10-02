import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Flex,
  FocusTrap,
  LoadingOverlay,
  NumberInput,
  ScrollArea,
  Select,
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
import { BASE_URL } from "../servicios/config";
import { useForm } from "@mantine/form";
import { IconArrowBackUp } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { Notificaciones } from "../utils/Notificaciones";

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
  diasCotizacion: null,
};

export default function Cotizaciones() {
  const { cotizacionId } = useParams();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(clienteVacio);
  const [lugarDeEntrega, setLugarDeEntrega] = useState("");
  const [diasDeCotizacion, setDiasDeCotizacion] = useState(1);
  const [suministroMaterial, setSuministroMaterial] = useState("");
  const [peticionAnticipo, setPeticionAnticipo] = useState(0);

  const [valorCliente, setValorCliente] = useState("");
  const [valorProducto, setValorProducto] = useState("");
  const [valorCantidad, setValorCantidad] = useState(1);
  const [folio, setFolio] = useState(0);

  const [productosAgregados, setProductosAgregados] = useState([]);
  const [cotizacion, setCotizacion] = useState(cotizacionVacia);
  const [refreshClientes, setRefreshClientes] = useState(false);
  const [refreshProductos, setRefreshProductos] = useState(false);
  const [visible, { toggle: toggleLoader }] = useDisclosure(true);
  const navigate = useNavigate();

  const resetState = () => {
    toggleLoader();
    setDiasDeCotizacion(1);
    setRefreshProductos(!refreshProductos);
    setRefreshClientes(!refreshClientes);
    setCotizacion(cotizacionVacia);
    setClienteSeleccionado(clienteVacio);
    setProductosAgregados([]);
  };

  useEffect(() => {
    if (cotizacionId) {
      Cotizacion.obtenerCotizacionPorId(cotizacionId).then((result) => {
        setFolio(result.data.id);
        setCotizacion(result.data);
        setClienteSeleccionado(result.data.cliente);
        setProductosAgregados(result.data.productos);
        toggleLoader();
      });
    }
  }, [cotizacionId]);

  useEffect(() => {
    if (!cotizacionId) {
      Cotizacion.obtenerUltimoFolio().then((result) => {
        setFolio(result.data.ultimoFolio + 1);
        toggleLoader();
      });
    }
  }, [cotizacionId]);

  useEffect(() => {
    if (!cotizacionId) {
      Cliente.obtenerCliente().then((result) => setClientes(result.data));
    }
  }, [refreshClientes]);

  useEffect(() => {
    if (!cotizacionId) {
      Producto.obtenerProductos().then((result) => setProductos(result.data));
    }
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
      nuevaCantidad: null,
    },
  });

  const abrirModalCambiarCantidad = (index, producto) =>
    modals.open({
      centered: true,
      title: "Actualizar cantidad ",
      children: (
        <>
          <form
            onSubmit={formCambiarCantidad.onSubmit((values) => {
              if (values.nuevaCantidad != null) {
                productosAgregados[index].cantidad = values.nuevaCantidad;
                productosAgregados[index].importe =
                  values.nuevaCantidad *
                  productosAgregados[index].precio_unitario;
                setProductosAgregados([...productosAgregados]);
              }
              formCambiarCantidad.reset();
            })}
          >
            <FocusTrap active>
              <NumberInput
                data-autofocus
                placeholder="Ingresa la nueva cantidad"
                allowDecimal={false}
                allowNegative={false}
                min={1}
                key={formCambiarCantidad.key("nuevaCantidad")}
                {...formCambiarCantidad.getInputProps("nuevaCantidad")}
              />
            </FocusTrap>
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
      precio_unitario: null,
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
              if (values.precio_unitario != null) {
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
              }
            })}
          >
            <FocusTrap active={true}>
              <NumberInput
                data-autofocus
                placeholder="Ingresa el nuevo precio"
                allowDecimal={false}
                allowNegative={false}
                min={0}
                prefix="$"
                hideControls
                key={formCambiarPrecio.key("precio_unitario")}
                {...formCambiarPrecio.getInputProps("precio_unitario")}
              />
            </FocusTrap>
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
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
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
        {cotizacion.id == null && (
          <MenuProducto
            productIndex={index}
            producto={producto}
            cambiarCantidad={abrirModalCambiarCantidad}
            cambiarPrecio={abrirModalCambiarPrecio}
            eliminarProducto={abrirModalEliminarProducto}
          />
        )}
      </Table.Td>

      <Table.Td>{producto.cantidad}</Table.Td>
      <Table.Td>{producto.descripcion}</Table.Td>
      <Table.Td>{producto.unidad}</Table.Td>
      <Table.Td>$ {producto.precio_unitario.toLocaleString("en")}</Table.Td>
      <Table.Td>$ {producto.importe.toLocaleString("en")}</Table.Td>
    </Table.Tr>
  ));

  const clienteCreadoExitosamente = (cliente) => {
    setRefreshClientes(!refreshClientes);
    setClienteSeleccionado(cliente);
    setValorCliente("");
  };

  const productoCreadoExitosamente = (nuevoProducto) => {
    setRefreshProductos(!refreshProductos);
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
          suministroMaterial: suministroMaterial,
          porcentajeAnticipo: peticionAnticipo,
        };
        toggleLoader();
        Cotizacion.crearCotizacion(bodyCotizacion)
          .then((result) => {
            Promise.all(
              productosAgregados.map((producto) => {
                const bodyProducto = {
                  cotizacionId: result.data.id,
                  productoId: producto.id,
                  cantidad: producto.cantidad,
                  descripcion: producto.descripcion,
                  unidad: producto.unidad,
                  precio_unitario: producto.precio_unitario,
                  importe: producto.cantidad * producto.precio_unitario,
                };
                return Cotizacion.agregarProductoCotizacion(bodyProducto);
              })
            ).then((res) => {
              if (res.every((product) => product.status == 200)) {
                Cotizacion.actualizarTotalCotizacion(result.data.id);
                Notificaciones.successCotizacion();
                navigate("/cotizaciones/" + result.data.id);
                resetState();
              } else {
                Notificaciones.errorCotizacion();
              }
            });
          })
          .catch((error) => Notificaciones.errorCotizacion());
      },
    });

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={visible}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Stack>
        <Flex gap="md" align="center">
          {cotizacion.id != null && (
            <Button
              variant="light"
              leftSection={<IconArrowBackUp size={14} />}
              onClick={() => {
                navigate("/cotizaciones");
                resetState();
              }}
            >
              Crear nueva
            </Button>
          )}
          <Title>Cotización</Title>
        </Flex>
        {/*Datos Generales*/}
        <Divider my="xs" label="Informacion General" labelPosition="left" />
        <Flex gap="md" align="center">
          <Text size="h2">
            <Text span fw={700} inherit>
              Folio:
            </Text>
            {" " + folio}
          </Text>
          <Text size="h2">
            <Text span fw={700} inherit>
              Dias de vigencia:{" "}
            </Text>
            {cotizacion.diasCotizacion ?? ""}
          </Text>
          {cotizacion.diasCotizacion == null && (
            <NumberInput
              onChange={(value) => setDiasDeCotizacion(value)}
              defaultValue={1}
              min={1}
            />
          )}
          <Text size="h2">
            <Text span fw={700} inherit>
              Lugar de Entrega:{" "}
            </Text>
            {cotizacion.lugarDeEntrega ?? ""}
          </Text>
          {cotizacion.lugarDeEntrega == null && (
            <Autocomplete
              onChange={(value) => setLugarDeEntrega(value)}
              placeholder="Punto de Recepcion"
            />
          )}
        </Flex>

        <Flex gap="md" align="center">
          <Text span fw={700} inherit>
            Suministro de Material:
          </Text>
          <Select
            placeholder="Selecciona Fecha Estimada"
            onChange={(value) => setSuministroMaterial(value)}
            data={[
              "Entrega Inmediata",
              "1 Semana de Entrega",
              "2 Semanas de Entrega",
              "1 Mes de Entrega",
            ]}
          />
        </Flex>
        <Flex gap="md" align="center">
          <Text span fw={700} inherit>
            Peticion de Anticipo:
          </Text>
          <NumberInput
            onChange={(value) => setPeticionAnticipo(value)}
            step={10}
            min={0}
            max={50}
            suffix=" %"
            defaultValue={0}
          />
        </Flex>
        {/*Datos del cliente*/}
        <Divider my="xs" label="Datos del Cliente" labelPosition="left" />
        <Flex gap="xs" align="center">
          <Text>
            <Text span fw={700} inherit>
              Cliente:{" "}
            </Text>
            {clienteSeleccionado.nombre ?? ""}
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
          {clienteSeleccionado.id && cotizacion.id == null && (
            <Button onClick={() => setClienteSeleccionado(clienteVacio)}>
              Cambiar Cliente
            </Button>
          )}
          {clienteSeleccionado.id == null && cotizacion.id == null && (
            <Button
              disabled={valorCliente === ""}
              onClick={() => seleccionarCliente("Enter")}
            >
              Asignar Cliente
            </Button>
          )}
        </Flex>
        {clienteSeleccionado.id != null && (
          <Flex gap="xl">
            <Text>
              <Text span fw={700} inherit>
                Correo:{" "}
              </Text>
              {clienteSeleccionado.correo}
            </Text>
            <Text>
              <Text span fw={700} inherit>
                Telefono:{" "}
              </Text>
              {clienteSeleccionado.telefono}
            </Text>
            <Text>
              <Text span fw={700} inherit>
                Domicilio:{" "}
              </Text>
              {clienteSeleccionado.domicilio}
            </Text>
          </Flex>
        )}

        {/*Productos*/}
        {cotizacion.id == null && (
          <Divider my="xs" label="Productos" labelPosition="left" />
        )}
        {cotizacion.id == null && (
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
        )}
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

          {cotizacion.id == null && (
            <Button
              disabled={
                clienteSeleccionado.id === null ||
                lugarDeEntrega == "" ||
                productosAgregados.length < 1
              }
              onClick={confirmarCotizacion}
            >
              Crear Cotizacion
            </Button>
          )}
          <Title size="h3">
            Total: $
            {productosAgregados
              .reduce((acc, producto) => acc + producto.importe, 0)
              .toLocaleString("en")}
          </Title>
        </Flex>
      </Stack>
    </Box>
  );
}
