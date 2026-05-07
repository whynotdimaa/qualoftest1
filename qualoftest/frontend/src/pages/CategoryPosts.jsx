import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { mediaUrl } from "../utils/backendMeta";
import { getApiErrorMessage } from "../utils/formValidation";
import "./Categories.css";

export const CategoryPosts = () => {
  const { slug } = useParams();
  const [title, setTitle] = useState("");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/posts/categories/${slug}/posts/`)
      .then((res) => {
        setTitle(res.data.category?.name ?? slug);
        const list = res.data.posts ?? [];
        setPosts(Array.isArray(list) ? list : []);
      })
      .catch((e) =>
        setError(
          getApiErrorMessage(e.response?.data, "Не вдалося завантажити пости категорії"),
        ),
      );
  }, [slug]);

  return (
    <div className="categories-page">
      <p>
        <Link to="/categories">← Усі категорії</Link>
      </p>
      <h1>{title || slug}</h1>
      {error ? <p className="err">{error}</p> : null}
      {posts.map((post) => (
        <article key={post.id} className="cat-post-card">
          <Link to={`/posts/${post.slug}`} className="cat-post-link">
            {typeof post.image === "string" && post.image ? (
              <img src={mediaUrl(post.image)} alt="" className="cat-thumb" />
            ) : null}
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <span className="meta">
              Автор: {post.author} ·{" "}
              {new Date(post.created_at).toLocaleDateString("uk-UA")}
            </span>
          </Link>
        </article>
      ))}
      {posts.length === 0 && !error ? <p className="muted">Пости відсутні.</p> : null}
    </div>
  );
};
