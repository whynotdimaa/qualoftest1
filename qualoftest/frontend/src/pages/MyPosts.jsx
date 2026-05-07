import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./MyPosts.css";

export const MyPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api
      .get("/posts/my-posts/")
      .then((res) => {
        console.log(res.data);

        setPosts(res.data.results || res.data);
      })
      .catch(() => setPosts([]));
  }, []);

  return (
    <div className="my-posts-page">
      <h1>Мої пости</h1>
      {posts.length === 0 && <p>Постів ще немає</p>}
      {posts.map((post) => (
        <div key={post.id} className="my-post-card">
          <div>
            <h2>
              <Link to={`/posts/${post.slug}`}>{post.title}</Link>
            </h2>
            <span className={`post-status ${post.status}`}>
              {post.status === "published" ? "Опубліковано" : "Чернетка"}
            </span>
          </div>
          <div className="my-post-actions">
            <Link to={`/posts/${post.slug}/edit`}>Редагувати</Link>
          </div>
        </div>
      ))}
    </div>
  );
};
