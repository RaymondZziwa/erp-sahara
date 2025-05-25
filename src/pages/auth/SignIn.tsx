import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { FormEvent, useRef } from "react";
import { Toast } from "primereact/toast";

import { handleGenericError } from "../../utils/errorHandling";
import useAuth from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";

const SignIn = () => {
  const toast = useRef<Toast>(null);
  const { loginHandler, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        username: formData.get("username") as string,
        password: formData.get("password") as string,
      };
      const res = await loginHandler(data);
      if (res.success) {
        console.log("Form Data:", data);
        toast.current?.show({
          severity: "success",
          summary: "Login success",
          detail: "Welcome",
        });
        navigate("/");
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Login error",
          detail: res.message,
        });
      }
    } catch (error) {
      handleGenericError(error);
    }

    // You can send 'data' to your API or handle it as needed
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toast ref={toast} />
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md"
      >
        {/* <img src="/logo.jpg" alt="Logo" className=" mx-auto mb-6" /> */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          Let's get you signed in
        </h2>

        <div className="mb-6">
          <FloatLabel>
            <InputText
              required
              id="username"
              name="username"
              className="w-full"
            />
            <label htmlFor="username">Username</label>
          </FloatLabel>
        </div>

        <div className="mb-6">
          <FloatLabel>
            <InputText
              required
              id="password"
              name="password"
              type="password"
              className="w-full"
            />
            <label htmlFor="password">Password</label>
          </FloatLabel>
        </div>

        <Button
          loading={isLoading}
          type="submit"
          className="w-full bg-shade text-white py-2 rounded-lg hover:bg-blue-600 text-center flex justify-center"
        >
          Sign In
        </Button>

        <div className="text-center mt-4">
          <a href="/forgot-password" className="text-blue-500 hover:underline">
            Forgot Password?
          </a>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">Don't have an account?</p>
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
