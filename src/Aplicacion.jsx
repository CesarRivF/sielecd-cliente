import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import Root from "./Root";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import ErrorPage from "./pantallas/ErrorPage";
import Cotizaciones from "./pantallas/Cotizaciones";
import Productos from "./pantallas/Productos";
import Clientes from "./pantallas/Clientes";
import Historial from "./pantallas/Historial";

const routes = createRoutesFromElements(
  <Route path="/" element={<Root />} errorElement={<ErrorPage />}>
    <Route path="cotizaciones" element={<Cotizaciones />}>
      <Route path=":cotizacionId" element={<Cotizaciones />} />
    </Route>
    <Route path="productos" element={<Productos />} />
    <Route path="clientes" element={<Clientes />} />
    <Route path="historial" element={<Historial />} />
  </Route>
);
const router = createBrowserRouter(routes);

export default function Aplicacion() {
  return (
    <MantineProvider>
      <Notifications />
      <ModalsProvider>
        <RouterProvider router={router} />
      </ModalsProvider>
    </MantineProvider>
  );
}
