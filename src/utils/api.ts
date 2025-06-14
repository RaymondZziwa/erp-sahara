import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { handleGenericError } from "./errorHandling";
import { toast } from "react-toastify";
import { ServerResponse } from "../redux/slices/types/ServerResponse";
//export const baseURL = "https://latcuapidemo.efinanci.com/api"
//export const baseURL = "https://latculive.efinanci.co.tz/api";
//export const baseURL = "https://saharaauth.efinanci.com/api";
//export const baseURL = "https://shrecuapi.efinanci.com/api"
export const baseURL = "https://latcuapi.efinanci.com/api"
//export const imageURL = "https://saharaauth.efinanci.com/storage"
//export const imageURL = "https://latcuapidemo.efinanci.com/storage"
//export const imageURL = "https://shrecuapi.efinanci.com/storage"
export const imageURL = "https://latcuapi.efinanci.com/storage"
//export const baseURL = "https://latcu-api.efinanci.co.tz/api";
//export const baseURL = "https://merp.efinanci.co.tz/api";
export const baseURL2 = "https://saharaauth.efinanci.com/api";
//export const baseURL = "demo-api.efinanci.co.tz";
// export const baseURL = "https://latcu-api.efinanci.co.tz/api"
//export const baseURL = "https://shrecu-api.efinanci.co.tz/api"
//export const baseURL = "https://sahara.efinanci.co.tz/api"
export const mossAppbaseURL = "https://mosappapi.mosmiles.org/api/app";
// export const mossAppbaseURL =
//   "https://mosappapi.mosmiles.org/mos/public/api/app";
export const mossAppImageURL =
  "https://mosappapi.mosmiles.org/api/public/storage";
export const org = 'latcu'
export const apiRequest = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  token?: string,
  data?: any
): Promise<T> => {
  const url = `${baseURL}${endpoint}`;

  const config: AxiosRequestConfig = {
    url,
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(data && { data }),
  };

  try {
    const response: AxiosResponse<T> = await axios.request(config);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (data?.message) {
          toast.error(data.message);
        }

        //window.location.href = "/login";
      }
      throw error; // Rethrow the error for further handling if needed
    }
    // Handle non-Axios related errors
    throw new Error("An error occurred during the API request.");
  }
};
export const mossAppApiRequest = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  token?: string,
  data?: any
): Promise<T> => {
  const url = `${mossAppbaseURL}${endpoint}`;

  const config: AxiosRequestConfig = {
    url,
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(data && { data }),
  };

  try {
    const response: AxiosResponse<T> = await axios.request(config);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }

    throw new Error("An error occurred during the API request.");
  }
};

export const createRequest = async <T>(
  endpoint: string,
  token: string,
  body?: T,
  cb?: () => void,
  method?: "POST" | "PUT" | "DELETE"
) => {
  try {
    const data = await apiRequest<ServerResponse<T>>(
      endpoint,
      method || "POST",
      token,
      body
    );

    if (data.success) {
      // alert(data.message || "Request successful");
      toast.success(data.message || "Request successful");
    } else {
      throw new Error(data.message);
    }
    cb && cb();
  } catch (error) {
    handleGenericError(error);
  }
};
export const createMossAppRequest = async <T>(
  endpoint: string,
  token: string,
  body?: T,
  cb?: () => void,
  method?: "POST" | "PUT" | "DELETE"
) => {
  try {
    const data = await mossAppApiRequest<ServerResponse<T>>(
      endpoint,
      method || "POST",
      token,
      body
    );

    if (data.success) {
      // alert(data.message || "Request successful");
      toast.success(data.message || "Request successful");
    } else {
      throw new Error(data.message);
    }
    cb && cb();
  } catch (error) {
    handleGenericError(error);
  }
};
