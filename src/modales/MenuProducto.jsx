import { Menu, rem, ActionIcon } from "@mantine/core";
import {
  IconTrash,
  IconDots,
  IconAdjustments,
  IconCoin,
} from "@tabler/icons-react";

export default function MenuProducto({
  productIndex,
  producto,
  cambiarCantidad,
  cambiarPrecio,
  eliminarProducto,
}) {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="light" aria-label="Settings">
          <IconDots style={{ width: "70%", height: "70%" }} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={() => cambiarCantidad(productIndex, producto)}
          leftSection={
            <IconAdjustments style={{ width: rem(14), height: rem(14) }} />
          }
        >
          Cambiar cantidad
        </Menu.Item>
        <Menu.Item
          onClick={() => cambiarPrecio(producto)}
          leftSection={<IconCoin style={{ width: rem(14), height: rem(14) }} />}
        >
          Cambiar precio
        </Menu.Item>

        <Menu.Item
          onClick={() => eliminarProducto(productIndex, producto)}
          color="red"
          leftSection={
            <IconTrash style={{ width: rem(14), height: rem(14) }} />
          }
        >
          Borrar producto
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
