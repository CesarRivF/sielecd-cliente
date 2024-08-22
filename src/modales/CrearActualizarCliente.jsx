import { Button, Container, InputBase, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Cliente } from "../servicios/clientes";
import { modals } from "@mantine/modals";
import { IMaskInput } from "react-imask";

export default function CrearActualizarCliente({
  clienteCreado,
  crearCliente,
  clienteSeleccionado,
  nombreCliente = "",
}) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      nombre: crearCliente ? nombreCliente : clienteSeleccionado.nombre,
      correo: crearCliente ? "" : clienteSeleccionado.correo,
      telefono: crearCliente ? "" : clienteSeleccionado.telefono,
      domicilio: crearCliente ? "" : clienteSeleccionado.domicilio,
    },
    validate: {
      correo: (value) => (/^\S+@\S+$/.test(value) ? null : "Correo invalido"),
      nombre: (value) => (value === "" ? "Ingresa el nombre" : null),
      telefono: (value) => (value === "" ? "Ingresa número de teléfono" : null),
      telefono: (value) =>
        value.length < 14 ? "Ingrese completo el número de teléfono" : null,
      domicilio: (value) => (value === "" ? "Ingresa un domicilio" : null),
    },
  });
  return (
    <Container>
      <form
        onSubmit={form.onSubmit((valores) => {
          if (crearCliente) {
            Cliente.crearCliente(valores)
              .then((result) => {
                modals.closeAll();
                clienteCreado(result.data);
              })
              .catch((error) => console.error(error));
          } else {
            Cliente.actualizarCliente(clienteSeleccionado.id, valores)
              .then((result) => {
                modals.closeAll();
                clienteCreado();
              })
              .catch((error) => console.error(error));
          }
        })}
      >
        <Stack>
          <TextInput
            label="Nombre"
            placeholder="Ingrese el Nombre"
            key={form.key("nombre")}
            {...form.getInputProps("nombre")}
          />
          <TextInput
            label="Correo"
            placeholder="Ingrese el correo"
            key={form.key("correo")}
            {...form.getInputProps("correo")}
          />
          <InputBase
            label="Telefono"
            component={IMaskInput}
            mask="(000) 000 0000"
            placeholder="Ingrese número de teléfono"
            key={form.key("telefono")}
            {...form.getInputProps("telefono")}
          />
          <TextInput
            label="Domicilio"
            placeholder="Ingrese el Domicilio"
            key={form.key("domicilio")}
            {...form.getInputProps("domicilio")}
          />
          <Button type="submit">
            {crearCliente ? "Crear Cliente" : "Actualizar Cliente"}
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
