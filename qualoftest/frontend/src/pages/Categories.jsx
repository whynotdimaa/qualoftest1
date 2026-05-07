import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../utils/formValidation";
import "./Categories.css";

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/posts/categories/")
      .then((r) => {
        const list = r.data.results ?? r.data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch((e) =>
        setError(
          getApiErrorMessage(e.response?.data, "Не вдалося завантажити категорії"),
        ),
      );
  }, []);

  return (
    <div className="categories-page">
      <h1>Категорії</h1>
      {error ? <p className="err">{error}</p> : null}
      <div className="cat-grid">
        {categories.map((c) => (
          <Link key={c.slug} to={`/categories/${c.slug}`} className="cat-card">
            <h2>{c.name}</h2>
            <p>{c.posts_count ?? 0} публікацій</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
