import { get } from "./config";

export const HealthCheck = {
  validate: () => get("/healthcheck"),
};
