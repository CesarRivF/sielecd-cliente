import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:4000/api/",
});

const { get, post, put, delete: destroy } = apiClient;
export { get, post, put, destroy };
