import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from 'react-hook-form';
import { Typography } from "@material-tailwind/react";

interface FormData {
  username: string;
  email: string;
  password: string;
}

const Register: FC = () => {
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await fetch("/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error in registration:", errorData);
        return;
      }

      const result = await response.json();
      console.log("User has been registered:", result);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const navigate = useNavigate();

  return (
    <>
      <section>
        <div className="pt-8 pb-8 bg-base-200">
          <form className="max-w-sm mx-auto py-[10%]" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-5">
              <label htmlFor="username" className={`${getErrorClasses(errors.username?.message, false)} block mb-2 text-sm font-medium text-gray-900 `}>
                Your Username
              </label>
              <input type="text" id="username"
                     {...register('username', {
                       required: 'Username is required',
                       pattern: {
                         value: /^[a-zA-Z0-9_]{3,15}$/,
                         message: 'Invalid username format',
                       },
                     })}
                     className={`${getErrorClasses(errors.username?.message)} shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light`}
                     placeholder="username"/>
              {ShowError(errors.username?.message)}
            </div>
            <div className="mb-5">
              <label htmlFor="email" className={`${getErrorClasses(errors.email?.message, false)} block mb-2 text-sm font-medium text-gray-900 `}>
                Your Email
              </label>
              <input type="text" id="email"
                     className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                     {...register('email', {
                       required: 'Email is required',
                       pattern: {
                         value: /\S+@\S+\.\S+/,
                         message: 'Invalid email address',
                       },
                     })}
                     placeholder="name@flowbite.com"/>
              {ShowError(errors.email?.message)}
            </div>
            <div className="mb-5">
              <label htmlFor="password" className={`${getErrorClasses(errors.password?.message, false)} block mb-2 text-sm font-medium text-gray-900 `}>
                Your password
              </label>
              <input type="password" id="password"
                     {...register('password', {
                       required: 'Password is required',
                       minLength: {
                         value: 8,
                         message: 'Password must be at least 8 characters',
                       }
                     })}
                     className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"/>
              {ShowError(errors.password?.message)}
            </div>
            <button type="submit" className="mx-auto block px-4 py-2 bg-blue-600 text-white rounded">
              Register new account
            </button>
            <Typography color="gray" className="mt-4 text-center font-normal">
              Already have an account?{" "}
                <a href="/" className="font-medium text-gray-900">
                  Sign In
                </a>
            </Typography>
          </form>

        </div>
      </section>
    </>
  );
};

export default Register;

const ShowError = (errorMsg: string | undefined) => {
  return errorMsg ? (<p className="mt-2 text-sm text-red-600 dark:text-red-500"><span
    className="font-medium">Oops!</span> {errorMsg}</p>) : null
}

const getErrorClasses = (errorMsg: string | undefined, isField = true): string => {
  return errorMsg ? !isField ? 'text-red-700 dark:text-red-500' : ' bg-red-50 border border-red-500 text-red-900 placeholder-red-700 dark:bg-green-100 dark:border-green-400' : '';
}