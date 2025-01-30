import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

interface ServerResponse<T> {
  success: boolean;
  message: string;
  errors: Errors;
  data: T;
}

interface Errors {
  [key: string]: string[]; // Define the structure based on your server response
}

const handleGenericError = <T>(
  error: Error | AxiosError<ServerResponse<T>> | any
) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ServerResponse<T>>;
    if (axiosError.response) {
      const { data } = axiosError.response;
      if (data.message) {
        toast.error(data.message);
      } else if (data.errors && Object.keys(data.errors).length > 0) {
        Object.keys(data.errors).forEach((key) => {
          data.errors[key].forEach((errorMessage: string) => {
            toast.error(`${key}: ${errorMessage}`);
          });
        });
      } else {
        toast.error("An unexpected error occurred.");
      }
      if (axiosError.response.status === 401) {
        // data.message && toast.error(data.message);

        // setInterval(() => {
        //   localStorage.clear();
        //   window.location.href = "/login";
        // }, 2000);
        window.location.href = "/login";
      }
    } else if (axiosError.request) {
      toast.error("No response received from the server.");
    } else {
      toast.error("Error during request setup.");
    }
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    console.error("Unknown error:", error);
    toast.error("An unexpected error occurred.");
  }
};

export { handleGenericError };
