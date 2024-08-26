import { notifications } from "@mantine/notifications";

export const Notificaciones = {
  successCotizacion: () =>
    notifications.show({
      title: "Cotización creada con exito",
      message: "Se creó la cotización correctamente",
    }),
  errorCotizacion: () =>
    notifications.show({
      title: "Ocurrio un error",
      message: "No se creó la cotización",
    }),
};
