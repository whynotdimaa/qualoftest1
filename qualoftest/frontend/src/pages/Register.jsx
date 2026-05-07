import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import {
  getApiErrorMessage,
  validateEmail,
  validateMatch,
  validateMinLength,
  validateRequired,
} from "../utils/formValidation";
import "./Form.css";

export const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    const usernameError = validateRequired(username, "Username");
    const emailError = validateEmail(email);
    const passwordError = validateMinLength(password, "Пароль", 8);
    const confirmError = validateMatch(
      passwordConfirm,
      password,
      "Підтвердження пароля",
    );

    if (usernameError) newErrors.username = usernameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmError) newErrors.passwordConfirm = confirmError;

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
      const { data } = await api.post("/auth/register/", {
        email,
        password,
        password_confirm: passwordConfirm,
        username,
      });
      if (data.access) localStorage.setItem("access", data.access);
      if (data.refresh) localStorage.setItem("refresh", data.refresh);
      // Dispatch auth-change event so Header updates
      window.dispatchEvent(new Event("auth-change"));
      navigate("/");
    } catch (err) {
      setErrors({
        general: getApiErrorMessage(
          err.response?.data,
          "Не вдалося створити акаунт",
        ),
      });
    }
  };

  return (
    <div className="form-page">
      <h1>Реєстрація</h1>
      {errors.general && <p className="form-error">{errors.general}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setErrors((currentErrors) => ({
              ...currentErrors,
              username: "",
              general: "",
            }));
          }}
          aria-invalid={Boolean(errors.username)}
        />
        {errors.username && <p className="form-error">{errors.username}</p>}
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
        <input
          type="password"
          placeholder="Підтвердіть пароль"
          value={passwordConfirm}
          onChange={(e) => {
            setPasswordConfirm(e.target.value);
            setErrors((currentErrors) => ({
              ...currentErrors,
              passwordConfirm: "",
              general: "",
            }));
          }}
          aria-invalid={Boolean(errors.passwordConfirm)}
        />
        {errors.passwordConfirm && (
          <p className="form-error">{errors.passwordConfirm}</p>
        )}
        <button type="submit">Зареєструватись</button>
      </form>
      <p className="form-link">
        Вже маєш акаунт? <Link to="/login">Увійди</Link>
      </p>
    </div>
  );
};
