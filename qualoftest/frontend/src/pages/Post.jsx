import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { mediaUrl } from "../utils/backendMeta";
import { getApiErrorMessage, validateMinLength } from "../utils/formValidation";
import "./Post.css";

function CommentBranch({ comment, depth, replyParentId, setReplyParent }) {
  const isReplying = replyParentId === comment.id;
  const avatar = comment.author_info?.avatar;

  return (
    <div
      className="comment-branch"
      style={{ marginLeft: depth > 0 ? Math.min(depth * 16, 72) : 0 }}
    >
      <div className="comment">
        <div className="comment-author-row">
          {avatar ? (
            <img
              className="comment-avatar"
              src={mediaUrl(avatar)}
              alt=""
            />
          ) : null}
          <strong>{comment.author_info?.username}</strong>
        </div>
        <p>{comment.content}</p>
        <div className="comment-actions">
          <button
            type="button"
            className="btn-linkish"
            onClick={() =>
              setReplyParent(isReplying ? null : comment.id)
            }
          >
            {isReplying ? "Скасувати" : "Відповісти"}
          </button>
        </div>
      </div>
      {(comment.replies ?? []).map((r) => (
        <CommentBranch
          key={r.id}
          comment={r}
          depth={depth + 1}
          replyParentId={replyParentId}
          setReplyParent={setReplyParent}
        />
      ))}
    </div>
  );
}

export const Post = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyParentId, setReplyParentId] = useState(null);
  const [commentError, setCommentError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [pinHelp, setPinHelp] = useState(null);
  const [pinMessage, setPinMessage] = useState("");
  const isAuth = !!localStorage.getItem("access");
  const navigate = useNavigate();

  const loadComments = useCallback(async (postId) => {
    const r = await api.get(`/comments/post/${postId}/`);
    setComments(r.data.comments ?? []);
  }, []);

  const reloadPost = useCallback(async () => {
    const res = await api.get(`/posts/${slug}/`);
    setPost(res.data);
    return res.data;
  }, [slug]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const p = await reloadPost();
      if (!alive || !p?.id) return;
      try {
        await loadComments(p.id);
      } catch {
        setComments([]);
      }
      if (isAuth && alive) {
        try {
          const prof = await api.get("/auth/profile/");
          setCurrentUser(prof.data);
        } catch {
          setCurrentUser(null);
        }
      }
      if (!isAuth || !alive || !p?.id) return;

      try {
        const chk = await api.get(`/subscribe/pinned-post/${p.id}/`);
        setPinHelp(chk.data);
      } catch {
        setPinHelp(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug, reloadPost, loadComments, isAuth]);

  const handleDelete = async () => {
    if (!globalThis.confirm("Видалити пост?")) return;
    await api.delete(`/posts/${slug}/`);
    navigate("/");
  };

  const handlePinToggle = async () => {
    if (!post?.id) return;
    setPinMessage("");
    try {
      if (post.is_pinned) {
        await api.post("/subscribe/unpin-post/", {});
        setPinMessage("Закріплення знято.");
      } else {
        await api.post("/subscribe/pin-post/", { post_id: post.id });
        setPinMessage("Пост закріплено.");
      }
      const next = await reloadPost();
      const chk = await api.get(`/subscribe/pinned-post/${next.id}/`);
      setPinHelp(chk.data);
      await loadComments(next.id);
    } catch (err) {
      setPinMessage(
        getApiErrorMessage(err.response?.data, "Не вдалося змінити закріплення"),
      );
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const textError = validateMinLength(text, "Коментар", 2);
    if (textError) {
      setCommentError(textError);
      return;
    }
    try {
      const body = {
        post: post.id,
        content: text,
        ...(replyParentId ? { parent: replyParentId } : {}),
      };
      await api.post("/comments/", body);
      setText("");
      setReplyParentId(null);
      setCommentError("");
      await loadComments(post.id);
    } catch (err) {
      setCommentError(
        getApiErrorMessage(err.response?.data, "Не вдалося надіслати коментар"),
      );
    }
  };

  if (!post) return <p>Завантаження...</p>;

  const isAuthor = currentUser?.id === post.author_info?.id;
  const showPinControl =
    isAuthor &&
    post.status === "published" &&
    (post.is_pinned || !!pinHelp?.can_pin);

  return (
    <div className="post-page">
      {post.image ? (
        <img
          className="post-hero-img"
          src={mediaUrl(post.image)}
          alt=""
        />
      ) : null}
      <h1>{post.title}</h1>
      <div className="post-meta">
        Автор: {post.author_info?.username} · Переглядів: {post.views_count}
        {" · Категорія: "}
        {post.category_info?.slug ? (
          <Link to={`/categories/${post.category_info.slug}`}>
            {post.category_info.name}
          </Link>
        ) : (
          "—"
        )}
      </div>
      <p className="post-content">{post.content}</p>

      {post.is_pinned ? (
        <p className="post-pinned-banner">📌 Цей пост закріплений у стрічці.</p>
      ) : null}

      {isAuthor ? (
        <div className="post-actions">
          <Link to={`/posts/${slug}/edit`}>Редагувати</Link>
          <button type="button" onClick={handleDelete}>
            Видалити
          </button>
          {showPinControl ? (
            <button type="button" onClick={handlePinToggle}>
              {post.is_pinned ? "Відкріпити" : "Закріпити"}
            </button>
          ) : null}
        </div>
      ) : null}

      {isAuthor &&
      post.status === "published" &&
      !post.is_pinned &&
      pinHelp &&
      !pinHelp.can_pin ? (
        <div className="pin-diagnostics muted">
          Закріплення недоступне: активна підписка та власність посту — перевірено (
          {!pinHelp.checks?.has_subscription ? "немає підписки" : ""}{" "}
          {pinHelp.checks?.has_subscription && !pinHelp.checks?.subscription_active
            ? "підписка неактивна"
            : ""}{" "}
          {pinHelp.checks?.is_own_post === false ? "це не ваш пост" : ""}).
        </div>
      ) : null}
      {pinMessage ? (
        <p className={`pin-msg ${pinMessage.includes("Не") ? "err" : "ok"}`}>
          {pinMessage}
        </p>
      ) : null}

      <div className="comments-section">
        <h2>Коментарі</h2>
        {comments.map((c) => (
          <CommentBranch
            key={c.id}
            comment={c}
            depth={0}
            replyParentId={replyParentId}
            setReplyParent={setReplyParentId}
          />
        ))}

        {isAuth ? (
          <div className="comment-form">
            {replyParentId ? (
              <p className="reply-hint">
                Відповідь на коментар #{replyParentId}.{" "}
                <button type="button" className="btn-linkish" onClick={() => setReplyParentId(null)}>
                  Скасувати
                </button>
              </p>
            ) : null}
            <form onSubmit={handleComment}>
              <textarea
                placeholder="Ваш коментар..."
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setCommentError("");
                }}
                aria-invalid={Boolean(commentError)}
              />
              {commentError ? (
                <p className="form-error">{commentError}</p>
              ) : null}
              <button type="submit">Надіслати</button>
            </form>
          </div>
        ) : (
          <p className="muted">
            <Link to="/login">Увійдіть</Link>, щоб коментувати.
          </p>
        )}
      </div>
    </div>
  );
};
