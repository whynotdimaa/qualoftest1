import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Link } from "react-router-dom";
import {
  getApiErrorMessage,
  validateEmail,
  validateMinLength,
} from "../utils/formValidation";
import "./Form.css";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailError = validateEmail(email);
    const passwordError = validateMinLength(password, "Пароль", 8);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const response = await api.post("/auth/login/", { email, password });
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      // Dispatch auth-change event so Header updates
      window.dispatchEvent(new Event("auth-change"));
      navigate("/");
    } catch (err) {
      setErrors({
        general: getApiErrorMessage(
          err.response?.data,
          "Невірний email або пароль",
        ),
      });
    }
  };

  return (
    <div className="form-page">
      <h1>Логін</h1>
      {errors.general && <p className="form-error">{errors.general}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((currentErrors) => ({
              ...currentErrors,
              email: "",
              general: "",
            }));
          }}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="form-error">{errors.email}</p>}
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((currentErrors) => ({
              ...currentErrors,
              password: "",
              general: "",
            }));
          }}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <p className="form-error">{errors.password}</p>}
        <button type="submit">Увійти</button>
      </form>
      <p className="form-link">
        Немає акаунту? <Link to="/register">Зареєструйся</Link>
      </p>
    </div>
  );
};
