import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../utils/formValidation";
import "./Payments.css";

export const Payments = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/payment/payments/")
      .then((r) =>
        setItems(
          Array.isArray(r.data) ? r.data : (r.data.results ?? []),
        ),
      )
      .catch((e) =>
        setError(getApiErrorMessage(e.response?.data, "Не вдалося завантажити платежі")),
      );
  }, []);

  return (
    <div className="payments-page">
      <h1>Мої платежі</h1>
      {error ? <p className="payments-err">{error}</p> : null}
      {items.length === 0 && !error ? (
        <p className="muted">Історії платежів поки немає.</p>
      ) : null}
      <ul className="payments-list">
        {items.map((p) => (
          <li key={p.id}>
            <Link to={`/payments/${p.id}`}>Платіж #{p.id}</Link>
            <span className="pill">{p.status}</span>
            <span>
              {p.amount} {p.currency}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
