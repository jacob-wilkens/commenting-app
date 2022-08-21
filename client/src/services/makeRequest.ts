import axios, { AxiosError, AxiosRequestConfig } from "axios";

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_SERVER_URL, withCredentials: true });

export const makeRequest = async <T>(url: string, options?: AxiosRequestConfig): Promise<T | Error> => {
  try {
    const data: T = (await api(url, options)).data;
    return data;
  } catch (err: any) {
    if (err instanceof AxiosError) {
      if (err.response?.data.error) err.message = err.response?.data.message;

      return err;
    }
    return new Error("Something went wrong...");
  }
};
