import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../utils/formValidation";
import "./Payments.css";

export const PaymentDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [syncMsg, setSyncMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPayment = () => {
    api
      .get(`/payment/payments/${id}/`)
      .then((r) => setData(r.data))
      .catch((e) =>
        setError(getApiErrorMessage(e.response?.data, "Не вдалося завантажити платіж")),
      );
  };

  useEffect(() => {
    loadPayment();
  }, [id]);

  const syncStatus = () => {
    setSyncMsg("");
    setLoading(true);
    api
      .get(`/payment/payments/${id}/status/`)
      .then((r) => {
        setSyncMsg(r.data.message ?? JSON.stringify(r.data));
        loadPayment();
      })
      .catch(() => setSyncMsg("Не вдалося синхронізувати."))
      .finally(() => setLoading(false));
  };

  const cancelPayment = () => {
    if (!window.confirm("Ви впевнені, що хочете скасувати цей платіж?")) {
      return;
    }
    setSyncMsg("");
    setLoading(true);
    api
      .post(`/payment/payments/${id}/cancel/`)
      .then((r) => {
        setSyncMsg(r.data.message ?? "Платіж успішно скасовано");
        loadPayment();
      })
      .catch((e) => {
        setSyncMsg(
          getApiErrorMessage(e.response?.data, "Не вдалося скасувати платіж")
        );
      })
      .finally(() => setLoading(false));
  };

  const refundPayment = () => {
    if (!window.confirm("Ви впевнені, що хочете зробити повне повернення коштів?")) {
      return;
    }
    setSyncMsg("");
    setLoading(true);

    api
      .post(`/payment/payments/${id}/refund/`, {
        amount: data.amount,
        reason: 'Refund requested from frontend',
      })
      .then((r) => {
        setSyncMsg(
          r.data.id
            ? 'Повернення створено успішно. Перевірте статус платежу.'
            : 'Повернення виконано.'
        );
        loadPayment();
      })
      .catch((e) => {
        setSyncMsg(
          getApiErrorMessage(e.response?.data, 'Не вдалося зробити повернення коштів'),
        );
      })
      .finally(() => setLoading(false));
  };

  if (error) return <div className="payments-page">{error}</div>;
  if (!data) return <p className="payments-page">Завантаження…</p>;

  return (
    <div className="payments-page">
      <p>
        <Link to="/payments">← Назад</Link>
      </p>
      <h1>Платіж #{data.id}</h1>
      <p>
        Сума: {data.amount} {data.currency} · Статус: <strong>{data.status}</strong>
      </p>
      {data.description ? <p>{data.description}</p> : null}
      {data.subscription_info ? (
        <p>Підписка: {data.subscription_info.plan_name}</p>
      ) : null}
      <div className="payment-actions">
        <button type="button" onClick={syncStatus} disabled={loading}>
          Оновити статус із Stripe
        </button>
        {data.is_pending && (
          <button
            type="button"
            onClick={cancelPayment}
            disabled={loading}
            className="btn-cancel"
          >
            Скасувати платіж
          </button>
        )}
        {data.can_be_refunded && !data.is_pending && data.amount > 0 && (
          <button
            type="button"
            onClick={refundPayment}
            disabled={loading}
            className="btn-refund"
          >
            Повернути кошти
          </button>
        )}
      </div>
      {syncMsg ? <p className="payment-message">{syncMsg}</p> : null}
    </div>
  );
};
