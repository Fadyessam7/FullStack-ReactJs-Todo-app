import * as yup from "yup";
export const loginSchema = yup
  .object({
    identifier: yup
      .string()
      .required("Email is required")
      .matches(/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, "Not a valid email address."),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password should be at least 8 characters."),
  })
  .required();

export const registerSchema = yup
  .object({
    username: yup
      .string()
      .required("Username is required!")
      .min(6, "Username must have at least 6 characters"),
    email: yup
      .string()
      .required("Email is required")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email!"
      ),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "password must have at least 8 characters"),
  })
  .required();
