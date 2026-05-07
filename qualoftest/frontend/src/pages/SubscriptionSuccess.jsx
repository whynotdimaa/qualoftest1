import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import "./SubscriptionSuccess.css";

export const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  const sessionStripe = searchParams.get("session_id");

  useEffect(() => {
    const pid = sessionStorage.getItem("pending_payment_id");
    if (!pid) {
      setError(
        "Не знайдено ідентифікатора платежу у браузері. Перевірте розділ «Платежі».",
      );
      return;
    }

    api
      .get(`/payment/payments/${pid}/status/`)
      .then((r) => {
        setDetail(r.data);
        if (["succeeded"].includes(String(r.data?.status ?? ""))) {
          sessionStorage.removeItem("pending_payment_id");
        }
      })
      .catch(() =>
        setError("Не вдалося перевірити статус платежу. Спробуйте через хвилину."),
      );
  }, []);

  return (
    <div className="subs-success-page">
      <h1>Оплата</h1>
      {sessionStripe ? (
        <p className="muted">Stripe session: {sessionStripe}</p>
      ) : null}
      {detail ? (
        <>
          <p>
            Платіж <strong>#{detail.payment_id}</strong>: статус{" "}
            <strong>{detail.status}</strong>
          </p>
          <p>{detail.message}</p>
          {detail.subscription_activated ? (
            <p className="ok-msg">Підписка активована.</p>
          ) : null}
        </>
      ) : null}
      {error ? <p className="err-msg">{error}</p> : null}
      <p className="actions-row">
        <Link to="/subscribe">До підписок</Link>
        {" · "}
        <Link to="/payments">Мої платежі</Link>
        {" · "}
        <Link to="/">На головну</Link>
      </p>
    </div>
  );
};
