import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";

import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { handleGenericError } from "../../utils/errorHandling";
import Logo from '../../assets/images/sahara.jpeg'

export default function LoginPage() {
  const { loginHandler, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        username: formData.get("email") as string,
        password: formData.get("password") as string,
      };

      const res = await loginHandler(data);
      if (res.success) {
        // console.log("Form Data:", data);

        navigate("/");
      } else {
        // throw Error(res.message);
      }
    } catch (error) {
      handleGenericError(error);
    }

    // You can send 'data' to your API or handle it as needed
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
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {/* <div className="w-8 h-8 rounded bg-gradient-to-r from-purple-500 to-teal-500" /> */}
            <img src={Logo} alt="" className="w-48 h-48" />
            {/* <span className="text-xl font-semibold">ERP</span> */}
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back!
            </h1>
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
                  sign in
                </span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email">Email</label>
              <InputText
                name="email"
                id="email"
                aria-describedby="email-help"
                placeholder="info@erp.com"
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
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password
              </label>
              <InputText
                name="password"
                id="password"
                placeholder="••••••••••••"
                type="password"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={false} />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember this Device
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-teal-500 hover:text-teal-600"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              loading={isLoading}
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-center"
            >
              <h4 className="flex w-full justify-center"> Sign In</h4>
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
