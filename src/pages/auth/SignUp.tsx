import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { FloatLabel } from "primereact/floatlabel";
import { Link, useNavigate } from "react-router-dom";
import { handleGenericError } from "../../utils/errorHandling";
import useAuth from "../../hooks/useAuth";

interface SignUpData {
  password: string;
  country_id: number;
  password_confirmation: string;
  organisation_name: string;
  email: string;
  phone_number: string;
  last_name: string;
  first_name: string;
}

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState<SignUpData>({
    password: "",
    country_id: 1,
    password_confirmation: "",
    organisation_name: "",
    email: "",
    phone_number: "",
    last_name: "",
    first_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);
  const { signUpHandler } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof SignUpData
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await signUpHandler(formData);
      if (res.success) {
        console.log("Form Data:", formData);
        toast.current?.show({
          severity: "success",
          summary: "Login success",
          detail: "Welcome",
        });
        navigate("/login");
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Signup error",
          detail: res.message,
        });
      }
    } catch (error) {
      handleGenericError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 bg-gray-100">
      <Toast ref={toast} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg space-y-6"
      >
        <img src="/logo.jpg" alt="Logo" className="mx-auto mb-4 h-40" />{" "}
        {/* Logo included here */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          Let's get you signed up
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-4">
          <FloatLabel>
            <InputText
              required
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleChange(e, "first_name")}
              className="w-full"
            />
            <label htmlFor="first_name">First Name</label>
          </FloatLabel>
        </div>
        <div className="mb-4">
          <FloatLabel>
            <InputText
              required
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleChange(e, "last_name")}
              className="w-full"
            />
            <label htmlFor="last_name">Last Name</label>
          </FloatLabel>
        </div>
        <div className="mb-4">
          <FloatLabel>
            <InputText
              required
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange(e, "email")}
              className="w-full"
            />
            <label htmlFor="email">Email</label>
          </FloatLabel>
        </div>
        <div className="mb-4">
          <FloatLabel>
            <InputText
              required
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => handleChange(e, "phone_number")}
              className="w-full"
            />
            <label htmlFor="phone_number">Phone Number</label>
          </FloatLabel>
        </div>
        <div className="mb-4">
          <FloatLabel>
            <InputText
              required
              id="organisation_name"
              value={formData.organisation_name}
              onChange={(e) => handleChange(e, "organisation_name")}
              className="w-full"
            />
            <label htmlFor="organisation_name">Organisation Name</label>
          </FloatLabel>
        </div>
        <div className="mb-4 ">
          <FloatLabel>
            <InputText
              type="password"
              required
              id="password"
              value={formData.password}
              onChange={(e) => handleChange(e, "password")}
              className="min-w-full"
            />
            <label htmlFor="password">Password</label>
          </FloatLabel>
        </div>
        <div className="mb-4">
          <FloatLabel>
            <InputText
              type="password"
              required
              id="password_confirmation"
              value={formData.password_confirmation}
              onChange={(e) => handleChange(e, "password_confirmation")}
              className="w-full"
            />
            <label htmlFor="password_confirmation">Confirm Password</label>
          </FloatLabel>
        </div>
        <Button
          loading={loading}
          type="submit"
          className="w-full  text-white py-2 rounded-lg  transition duration-200 justify-center flex"
        >
          Sign Up
        </Button>
        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
