import { useLocation, useNavigate } from "react-router-dom";
import {
  clearUserData,
  setUserData,
  startFetchingLocalToken,
  finishFetchingLocalToken,
} from "../redux/slices/user/userAuthSlice";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { apiRequest } from "../utils/api";
import { handleGenericError } from "../utils/errorHandling";
import { SignUpData, UserAuthType } from "../redux/slices/types/user/userAuth";
import { ServerResponse } from "../redux/slices/types/ServerResponse";
import { AxiosError } from "axios";

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.userAuth);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logOutHandler = () => {
    localStorage.clear();
    dispatch(clearUserData());
    navigate("/login")
  };

  const loginHandler = async (data: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      const res = await apiRequest<ServerResponse<UserAuthType>>(
        "/login",
        "POST",
        "",
        data
      );

      dispatch(setUserData(res.data));
      localStorage.setItem("user", JSON.stringify(res.data));
      setIsLoading(false);
      return { success: true, message: res.message };
    } catch (error) {
      setIsLoading(false);
      handleGenericError(error);
      const axiosError = error as AxiosError<ServerResponse<unknown>>;
      // @ts-expect-error
      const { data } = axiosError.response;

      return {
        success: false,
        message:
          data.message ??
          ((error instanceof Error && error.message) || "Login failed"),
      };
    }
  };
  const signUpHandler = async (data: SignUpData) => {
    try {
      setIsLoading(true);
      const res = await apiRequest<ServerResponse<UserAuthType>>(
        "/users",
        "POST",
        "",
        data
      );

      setIsLoading(false);
      return { success: true, message: res.message };
    } catch (error) {
      handleGenericError(error);
      setIsLoading(false);
      return {
        success: false,
        message: (error instanceof Error && error.message) || "Signup failed",
      };
    }
  };

  useEffect(() => {
    dispatch(startFetchingLocalToken());

    const localUserJSON = localStorage.getItem("user");
    const localUser: UserAuthType = localUserJSON && JSON.parse(localUserJSON);

    if (localUser && localUser.token.access_token) {
      dispatch(setUserData(localUser));
    } else {
      if (authState.token.access_token === "") {
        navigate(pathname == "/signup" ? "/signup" : "/login");
      }
      dispatch(finishFetchingLocalToken());
    }
  }, [authState.token.access_token]);

  return {
    ...authState,
    logOutHandler,
    loginHandler,
    signUpHandler,
    isLoading,
  };
};

export default useAuth;
