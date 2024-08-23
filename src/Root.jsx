import {
  AppShell,
  Title,
  Flex,
  NavLink,
  Group,
  Burger,
  LoadingOverlay,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { HealthCheck } from "./servicios/healthcheck";
import {
  IconArticle,
  IconFileReport,
  IconReceipt,
  IconUsers,
} from "@tabler/icons-react";

import Clientes from "./pantallas/Clientes";
import { Image } from "@mantine/core";
import Cotizaciones from "./pantallas/Cotizaciones";
import Productos from "./pantallas/Productos";
import Historial from "./pantallas/Historial";
import { Outlet, useNavigate } from "react-router-dom";

const menu = [
  { icon: IconReceipt, label: "Cotizaciones", path: "cotizaciones" },
  { icon: IconArticle, label: "Productos", path: "productos" },
  { icon: IconUsers, label: "Clientes", path: "clientes" },
  { icon: IconFileReport, label: "Historial", path: "historial" },
];

export default function Root() {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);

  const [visible, { toggle: toggleLoader }] = useDisclosure(true);
  const navigate = useNavigate();
  useEffect(() => {
    HealthCheck.validate()
      .then((res) => {
        toggleLoader(false);
      })
      .catch();
  }, []);
  return (
    <>
      <Box pos="relative">
        <LoadingOverlay
          visible={visible}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
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
                onClick={() => {
                  setActive(index);
                  navigate(item.path);
                }}
              />
            ))}
          </AppShell.Navbar>
          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
        </AppShell>
      </Box>
    </>
  );
}
