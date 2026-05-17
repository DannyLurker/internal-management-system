import axios from "axios";
import { getErrorMessage } from "./error-handlers/getErrorMessage";

export interface ApiResponse<T> {
  message: string;
  data: T;
  status: number;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for Auth.js/NextAuth cookies
});

let loadingSetter: (val: boolean) => void = () => {};
let toastSetter: (msg: string) => void = () => {};

export const registerApiListeners = (
  setIsLoading: (val: boolean) => void,
  notifyError: (msg: string) => void,
) => {
  loadingSetter = setIsLoading;
  toastSetter = notifyError;
};

api.interceptors.request.use((config) => {
  loadingSetter(true);
  return config;
});

api.interceptors.response.use(
  (response) => {
    loadingSetter(false);
    return response;
  },
  async (error) => {
    loadingSetter(false);
    const message = (await getErrorMessage(error)) || "An error occurred";
    toastSetter(message);
    return Promise.reject(error);
  },
);
