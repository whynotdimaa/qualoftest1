import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { mediaUrl } from "../utils/backendMeta";
import "./Home.css";

const FEEDS = [
  { id: "all", label: "Усі пости" },
  { id: "featured", label: "Рекомендовані" },
  { id: "popular", label: "Популярні" },
  { id: "recent", label: "Нещодавні" },
  { id: "pinned", label: "Закріплені" },
];

function mergeFeatured(data) {
  const seen = new Set();
  const out = [];
  for (const p of data?.pinned_posts ?? []) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      out.push({ ...p, _kind: "pinned" });
    }
  }
  for (const p of data?.popular_posts ?? []) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      out.push({ ...p, _kind: "popular" });
    }
  }
  return out;
}

export const Home = () => {
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

  const feed = searchParams.get("feed") || "all";

  const parsedPage = Number(searchParams.get("page") || 1);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        if (feed === "all") {
          const params = { page: currentPage };
          if (searchQuery.trim()) params.search = searchQuery.trim();
          const res = await api.get("/posts/", { params });
          const body = res.data;
          const list = body.results ?? body ?? [];
          if (!cancelled) {
            setPosts(Array.isArray(list) ? list : []);
            setTotalCount(body.count ?? list.length);
          }
          return;
        }

        let res;
        if (feed === "featured") res = await api.get("/posts/featured/");
        else if (feed === "popular") res = await api.get("/posts/popular/");
        else if (feed === "recent") res = await api.get("/posts/recent/");
        else if (feed === "pinned") res = await api.get("/posts/pinned/");

        if (cancelled) return;

        if (feed === "featured") {
          setPosts(mergeFeatured(res.data));
          setTotalCount(mergeFeatured(res.data).length);
        } else if (feed === "pinned") {
          const body = res.data;
          const list = body.results ?? body ?? [];
          setPosts(Array.isArray(list) ? list : []);
          setTotalCount(body.count ?? list.length);
        } else {
          const list = res.data;
          const arr = Array.isArray(list) ? list : [];
          setPosts(arr);
          setTotalCount(arr.length);
        }
      } catch {
        if (!cancelled) {
          setPosts([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [currentPage, searchQuery, feed]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleSearch = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);

    if (searchInput.trim()) {
      nextParams.set("search", searchInput.trim());
    } else {
      nextParams.delete("search");
    }

    nextParams.set("page", "1");
    if (!nextParams.get("feed")) nextParams.set("feed", feed);
    setSearchParams(nextParams);
  };

  const setFeed = (nextFeed) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("feed", nextFeed);
    nextParams.delete("page");
    if (nextFeed !== "all") nextParams.delete("search");
    setSearchParams(nextParams);
  };

  const goToPage = (page) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(page));
    if (!nextParams.get("feed")) nextParams.set("feed", feed);
    if (searchQuery.trim()) {
      nextParams.set("search", searchQuery.trim());
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="home">
      <h1>Новини</h1>

      <div className="home-feed-tabs">
        {FEEDS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={feed === id ? "tab-active" : "tab"}
            onClick={() => setFeed(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {feed === "all" ? (
        <form className="home-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Пошук постів"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit">Шукати</button>
        </form>
      ) : null}

      {searchQuery && feed === "all" ? (
        <div className="home-search-meta">
          Результати для: <strong>{searchQuery}</strong>
        </div>
      ) : null}

      {loading ? <p className="home-empty">Завантаження…</p> : null}

      {!loading && posts.length === 0 ? (
        <p className="home-empty">Пости не знайдено.</p>
      ) : null}

      {!loading &&
        posts.map((post) => (
          <div key={`${post.id}-${post.slug}`} className="post-card">
            <Link to={`/posts/${post.slug}`} className="card-link">
              {typeof post.image === "string" && post.image ? (
                <img
                  className="post-card-thumb"
                  src={mediaUrl(post.image)}
                  alt=""
                  loading="lazy"
                />
              ) : null}
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              <div className="post-meta">
                Автор: {post.author} · Категорія:{" "}
                <span>{post.category || "—"}</span>
                {" · "}
                {new Date(post.created_at).toLocaleDateString("uk-UA")}
                {post.is_pinned ? " · 📌 закріплено" : null}
              </div>
            </Link>
          </div>
        ))}

      {feed === "all" && totalPages > 1 ? (
        <div className="home-pagination">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Попередня
          </button>
          <span>
            Сторінка {currentPage} з {totalPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Наступна
          </button>
        </div>
      ) : null}
    </div>
  );
};
