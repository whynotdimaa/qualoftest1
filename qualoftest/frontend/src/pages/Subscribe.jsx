import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../utils/formValidation";
import "./Subscribe.css";

export const Subscribe = () => {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [subscriptionError, setSubscriptionError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [canceling, setCanceling] = useState(false);

  const loadSubscription = async () => {
    setSubscriptionError("");
    try {
      const { data } = await api.get("/subscribe/my-subscription/");
      setSubscription(data);
    } catch (e) {
      if (e.response?.status === 404) {
        setSubscription(null);
      } else {
        setSubscriptionError(getApiErrorMessage(e.response?.data, "Не вдалося завантажити підписку"));
      }
    }
  };

  useEffect(() => {
    api
      .get("/subscribe/plans/")
      .then((r) =>
        setPlans(
          Array.isArray(r.data) ? r.data : (r.data.results ?? []),
        ),
      )
      .catch((e) =>
        setError(getApiErrorMessage(e.response?.data, "Не вдалося завантажити плани")),
      );

    loadSubscription();
  }, []);

  const startCheckout = async (planId) => {
    setError("");
    setSubscriptionMessage("");
    setSubscriptionError("");
    setBusyId(planId);
    try {
      const origin = window.location.origin;
      const { data } = await api.post("/payment/create-checkout-session/", {
        subscription_plan_id: planId,
        success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/subscribe`,
      });
      if (data.payment_id) {
        sessionStorage.setItem("pending_payment_id", String(data.payment_id));
      }
      if (data.checkout_url) {
        window.location.assign(data.checkout_url);
      } else {
        setError("Stripe не повернув посилання на оплату.");
      }
    } catch (e) {
      setError(
        getApiErrorMessage(
          e.response?.data,
          "Не вдалося створити сесію оплати",
        ),
      );
    } finally {
      setBusyId(null);
    }
  };

  const cancelSubscription = async () => {
    if (!window.confirm("Ви впевнені, що хочете скасувати підписку?")) {
      return;
    }
    setSubscriptionMessage("");
    setSubscriptionError("");
    setCanceling(true);
    try {
      const { data } = await api.post("/subscribe/cancel/");
      setSubscriptionMessage(data.message ?? "Підписку скасовано.");
      await loadSubscription();
    } catch (e) {
      setSubscriptionError(
        getApiErrorMessage(e.response?.data, "Не вдалося скасувати підписку"),
      );
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="subscribe-page">
      <h1>Плани підписки</h1>
      <p className="subscribe-lede">
        Після успішної оплати з’явиться доступ до закріплення власних постів.{" "}
        <Link to="/payments">Мої платежі</Link>
      </p>
      {subscription ? (
        <div className="subscription-card">
          <h2>Моя підписка</h2>
          <p>
            План: <strong>{subscription.plan_info?.name ?? subscription.plan}</strong>
          </p>
          <p>
            Статус: <strong>{subscription.status}</strong>
            {subscription.is_active ? ` · ${subscription.days_remaining} днів залишилось` : ''}
          </p>
          {subscriptionMessage ? (
            <p className="subscribe-message">{subscriptionMessage}</p>
          ) : null}
          {subscriptionError ? (
            <p className="subscribe-error">{subscriptionError}</p>
          ) : null}
          {subscription.is_active ? (
            <button
              type="button"
              className="cancel-subscription-button"
              disabled={canceling}
              onClick={cancelSubscription}
            >
              {canceling ? 'Скасовується…' : 'Скасувати підписку'}
            </button>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="subscribe-error">{error}</p> : null}
      <div className="plan-grid">
        {plans.map((p) => (
          <article key={p.id} className="plan-card">
            <h2>{p.name}</h2>
            <p className="plan-price">
              {p.price === 0 ? 'Безкоштовно' : `$${p.price}`}
            </p>
            <p className="plan-days">{p.duration_days} днів</p>
            {Array.isArray(p.features) && p.features.length > 0 ? (
              <ul className="plan-features">
                {p.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              disabled={busyId === p.id}
              onClick={() => startCheckout(p.id)}
            >
              {busyId === p.id ? "Перехід…" : "Оформити"}
            </button>
          </article>
        ))}
      </div>
      {plans.length === 0 && !error ? (
        <p className="muted">Планів поки немає.</p>
      ) : null}
    </div>
  );
};
