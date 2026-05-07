import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../utils/formValidation";
import "./MyComments.css";

export const MyComments = () => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/comments/my-comments/")
      .then((r) => {
        const list = r.data.results ?? r.data ?? [];
        setRows(Array.isArray(list) ? list : []);
      })
      .catch((e) =>
        setError(getApiErrorMessage(e.response?.data, "Не вдалося завантажити коментарі")),
      );
  }, []);

  return (
    <div className="my-comments-page">
      <h1>Мої коментарі</h1>
      {error ? <p className="err">{error}</p> : null}
      {rows.length === 0 && !error ? (
        <p className="muted">Немає коментарів.</p>
      ) : null}
      <ul>
        {rows.map((c) => (
          <li key={c.id}>
            <div className="row-top">
              {c.post_slug ? (
                <Link to={`/posts/${c.post_slug}`}>
                  {c.post_title || "Пост"}
                </Link>
              ) : (
                <span>Пост #{c.post}</span>
              )}
              <time dateTime={c.created_at}>
                {new Date(c.created_at).toLocaleString("uk-UA")}
              </time>
            </div>
            <p>{c.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
