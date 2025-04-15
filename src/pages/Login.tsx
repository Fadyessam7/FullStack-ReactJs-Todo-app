import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useForm, SubmitHandler } from "react-hook-form";
import { LOGIN_FORM } from "../data";
import InputErrorMessage from "../components/ui/InputErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../validation";
import { useState } from "react";
import axiosInstance from "../config/axios.config";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { IErrorResponse } from "../interfaces";
interface IFormInput {
  identifier: string;
  password: string;
}
const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: yupResolver(loginSchema),
  });

  //** Handlers
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    //** Pending
    setIsLoading(true);
    //** fullFilled
    try {
      const { status, data: resData } = await axiosInstance.post(
        "/auth/local",
        data
      );
      if (status === 200) {
        toast.success("Logged In Successfully 👌", {
          position: "bottom-center",
          duration: 1500,
          style: {
            background: "black",
            color: "white",
            width: "fit-content",
          },
        });
        localStorage.setItem("loggedInUser", JSON.stringify(resData));
        setTimeout(() => {
          location.replace("/");
        }, 2000);
      }
    } catch (error) {
      //** Rejected
      const errorObj = error as AxiosError<IErrorResponse>;
      toast.error(`${errorObj.response?.data?.error.message}`, {
        position: "bottom-center",
        duration: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  //** Renders
  const renderLoginForm = LOGIN_FORM.map(
    ({ type, name, placeholder, validation }, index) => {
      return (
        <div key={index}>
          <Input
            {...register(name, validation)}
            placeholder={placeholder}
            type={type}
          ></Input>
          {errors[name] && <InputErrorMessage msg={errors[name].message} />}
        </div>
      );
    }
  );

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center mb-4 text-3xl font-semibold">
        Login to get access!
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {renderLoginForm}
        <Button fullWidth isLoading={isLoading}>
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
