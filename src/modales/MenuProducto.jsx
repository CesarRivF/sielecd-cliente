import { Menu, rem, ActionIcon } from "@mantine/core";
import {
  IconTrash,
  IconDots,
  IconAdjustments,
  IconCoin,
} from "@tabler/icons-react";

export default function MenuProducto() {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="light" aria-label="Settings">
          <IconDots style={{ width: "70%", height: "70%" }} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={
            <IconAdjustments style={{ width: rem(14), height: rem(14) }} />
          }
        >
          Cambiar cantidad
        </Menu.Item>
        <Menu.Item
          leftSection={<IconCoin style={{ width: rem(14), height: rem(14) }} />}
        >
          Cambiar precio
        </Menu.Item>

        <Menu.Item
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
