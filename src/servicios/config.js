import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const apiClient = axios.create({
  baseURL: BASE_URL + "/api/",
});

const { get, post, put, delete: destroy } = apiClient;
export { get, post, put, destroy, BASE_URL };
