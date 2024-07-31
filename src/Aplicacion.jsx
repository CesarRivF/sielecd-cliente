import "@mantine/core/styles.css";
import {
  MantineProvider,
  AppShell,
  Title,
  Flex,
  NavLink,
  Group,
  Burger,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArticle,
  IconFileReport,
  IconReceipt,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import Cotizaciones from "./pantallas/Cotizaciones";
import Productos from "./pantallas/Productos";
import Historial from "./pantallas/Historial";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import Clientes from "./pantallas/Clientes";
import { ModalsProvider } from "@mantine/modals";
import { Image } from "@mantine/core";

const menu = [
  { icon: IconReceipt, label: "Cotizaciones" },
  { icon: IconArticle, label: "Productos" },
  { icon: IconUsers, label: "Clientes" },
  { icon: IconFileReport, label: "Historial" },
];

export default function Aplicacion() {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);

  return (
    <MantineProvider>
      <Notifications />
      <ModalsProvider>
        <AppShell
          header={{ height: 70 }}
          navbar={{
            width: 280,
            breakpoint: "sm",
            collapsed: { mobile: !opened },
          }}
          padding="md"
        >
          <AppShell.Header>
            <Group h="100%" px="md">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <Flex>
                <Title margin={20}>
                  <Image
                    radius="md"
                    h={69}
                    w={260}
                    fit="contain"
                    src="https://i.postimg.cc/bw9MH6jM/sielecd.jpg"
                  />
                </Title>
              </Flex>
            </Group>
          </AppShell.Header>
          <AppShell.Navbar p="md">
            {menu.map((item, index) => (
              <NavLink
                key={item.label}
                active={index === active}
                label={item.label}
                leftSection={<item.icon />}
                onClick={() => setActive(index)}
              />
            ))}
          </AppShell.Navbar>
          <AppShell.Main>
            {
              {
                0: <Cotizaciones />,
                1: <Productos />,
                2: <Clientes />,
                3: <Historial />,
              }[active]
            }
          </AppShell.Main>
        </AppShell>
      </ModalsProvider>
    </MantineProvider>
  );
}
