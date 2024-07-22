import { useState, useContext } from "react";
import { styled } from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AuthContext } from "../utils/AuthContext.jsx";

const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
`;

const SignUpLink = styled.div`
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 24px;
  color: #666666;
  text-align: center;
  font-family: "Poppins", sans-serif;
  font-weight: 500;
  padding-top: 1.125rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-size: 16px;
  line-height: 24px;
  color: #666666;
  text-align: justify-left;
  font-family: "Poppins", sans-serif;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #dddddd;
  border-radius: 5px;
  max-width: 400px;
  font-family: "Poppins", sans-serif;
  &::placeholder {
    color: #d9d9d9;
    font-size: 1rem;
  }
  &:focus {
    border-color: #000;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 10px;
  background-color: #ffc107;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  max-width: 400px;
  font-weight: 600;
  font-size: 0.9rem;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
  &:hover {
    background-color: #b38600;
  }
`;

const ErrorMessage = styled.p`
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  color: #990000;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
`;

const SignLink = styled(Link)`
  color: #666666;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

function LoginForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { loginUser } = useContext(AuthContext);
  const [serverError, setServerError] = useState(null);

  const onSubmit = async (data) => {
    try {
      await loginUser(data);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.status === 401) {
        setServerError("Incorrect email or password. Please try again.");
      } else if (error.response && error.response.status === 500) {
        setServerError("An error occurred on the server. Please try again later.");
      } else {
        setServerError("An unexpected error occurred. Please try again later.");
      }
    }
  };
  return (
    <Container>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label>Email address</Label>
          <Input
            type="text"
            name="login"
            autoComplete="username"
            {...register("login", { required: "Email is required" })}
          />
          {errors.login && <ErrorMessage>{errors.login.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <ErrorMessage>{errors.password.message}</ErrorMessage>
          )}
        </FormGroup>
        {serverError && <ErrorMessage>{serverError}</ErrorMessage>}
        <Button type="submit">SIGN IN</Button>
        <SignUpLink>
          Don&apos;t have an account?{" "}
          <SignLink to="/registration">Sign up</SignLink>
        </SignUpLink>
      </Form>
    </Container>
  );
}

export default LoginForm;
