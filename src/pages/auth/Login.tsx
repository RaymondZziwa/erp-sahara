//@ts-nocheck
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useAppDispatch } from "../../redux/hooks";
//import { useTranslation } from "react-i18next";
import saharaLogo from '../../assets/images/sahara.jpeg';
import latcuLogo from '../../assets/images/logos/ltcu.jpeg'
import { org } from "../../utils/api";
import axios from "axios";
import { baseURL } from "../../utils/api";
import {
  setUserData
} from "../../redux/slices/user/userAuthSlice";

export default function LoginPage() {
  const { isLoading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  //const { t } = useTranslation();

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const response = await axios.post(
      `${baseURL}/login`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if(response.status === 200) {
      const { token } = response.data.data;

      // Save to localStorage or cookies as needed
      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem("user", JSON.stringify(response.data.data));
      dispatch(setUserData(response.data));
      toast.success("Login successful");
      navigate("/");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Login failed. Please try again.";

    toast.error(errorMessage);
  }
};

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left section with illustration */}
      <div className="hidden lg:flex items-center justify-center bg-teal-50 p-8">
        <div className="relative w-full max-w-md h-96">
          <img
            src="/logo.jpg"
            alt="Login illustration"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>
      </div>

      {/* Right section with form */}
      <div className="flex items-center justify-center p-2">
        <div className="w-full max-w-md space-y-2">
          {/* Logo */}
          <div className="flex flex-col items-center">
            {/* <div className="w-8 h-8 rounded bg-gradient-to-r from-purple-500 to-teal-500" /> */}
            <img
              src={org === "latcu" ? latcuLogo : saharaLogo}
              alt=""
              className=" w-60 h-48"
            />
            
            {org === "sahara" && (
              <p className="font-bold text-6xl -mt-8 mb-4">SPICE HUB</p>
            )}
            {/* <span className="text-xl font-semibold">ERP</span> */}
          </div>

          {/* Header */}
          <div className="space-y-2">
            {/* <h1 className="text-2xl font-semibold tracking-tight">
              {t("welcome")}
            </h1> */}
            {/* <p className="text-sm text-muted-foreground">
              Your Admin Dashboard
            </p> */}
          </div>

          {/* Social Login */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground bg-white">
                  log in
                </span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              {/* <label htmlFor="email" className="font-medium">Email</label> */}
              <InputText
                name="email"
                id="email"
                aria-describedby="email-help"
                placeholder="Email"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
              />
              {/* <small id="email-help">
                Enter your username to reset your password.
              </small> */}
            </div>
            <div className="flex flex-col gap-2">
              {/* <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password
              </label> */}
              <InputText
                name="password"
                id="password"
                placeholder="Password"
                type="password"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
              />
            </div>

            <div className="flex justify-end">
              {/* <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={false} />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember this Device
                </label>
              </div> */}
              {/* <Link
                to="/forgot-password"
                className="text-sm text-teal-500 hover:text-teal-600"
              >
                Forgot Password?
              </Link> */}
            </div>

            <Button
              loading={isLoading}
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-center"
            >
              <h4 className="flex w-full justify-center"> LOG IN</h4>
            </Button>
          </form>

          {/* <p className="text-center text-sm text-muted-foreground">
            New to ERP?{" "}
            <Link to="/signup" className="text-teal-500 hover:text-teal-600">
              Create an account
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}
