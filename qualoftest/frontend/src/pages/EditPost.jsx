import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { mediaUrl } from "../utils/backendMeta";
import { getApiErrorMessage, validateMinLength } from "../utils/formValidation";
import "./Form.css";

export const EditPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("published");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api
      .get("/posts/categories/")
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data.results;
        setCategories(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    api
      .get(`/posts/${slug}/`)
      .then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
        const cid =
          typeof res.data.category === "number"
            ? res.data.category
            : res.data.category?.id ??
              res.data.category_info?.id ??
              "";
        setCategoryId(cid ? String(cid) : "");
        setStatus(res.data.status || "published");
        setExistingImageUrl(
          typeof res.data.image === "string" ? res.data.image : "",
        );
      })
      .catch((err) => {
        setErrors({
          general: getApiErrorMessage(
            err.response?.data,
            "Не вдалося завантажити пост",
          ),
        });
      });
  }, [slug]);

  const validate = () => {
    const newErrors = {};
    const titleError = validateMinLength(title, "Заголовок", 3);
    const contentError = validateMinLength(content, "Текст поста", 10);
    if (titleError) newErrors.title = titleError;
    if (contentError) newErrors.content = contentError;
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors((prev) => ({ ...prev, general: "" }));
    setLoading(true);
    setSuccess("");

    try {
      let res;
      if (imageFile) {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("content", content);
        fd.append("status", status);
        if (categoryId) fd.append("category", categoryId);
        fd.append("image", imageFile);
        res = await api.patch(`/posts/${slug}/`, fd);
      } else {
        res = await api.patch(`/posts/${slug}/`, {
          title,
          content,
          status,
          category: categoryId ? Number(categoryId) : null,
        });
      }
      const newSlug = res.data?.slug || slug;
      setSuccess("Пост успішно збережено!");
      setLoading(false);
      setTimeout(() => {
        navigate(`/posts/${newSlug}`);
      }, 1000);
    } catch (err) {
      setLoading(false);
      setErrors({
        general: getApiErrorMessage(
          err.response?.data,
          "Не вдалося зберегти зміни",
        ),
      });
    }
  };

  return (
    <div className="form-page">
      <h1>Редагувати пост</h1>
      {errors.general ? <p className="form-error">{errors.general}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((p) => ({ ...p, title: "", general: "" }));
          }}
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title ? <p className="form-error">{errors.title}</p> : null}
        <textarea
          placeholder="Текст поста"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setErrors((p) => ({ ...p, content: "", general: "" }));
          }}
          aria-invalid={Boolean(errors.content)}
        />
        {errors.content ? (
          <p className="form-error">{errors.content}</p>
        ) : null}
        <label className="form-label" htmlFor="cat">
          Категорія
        </label>
        <select
          id="cat"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Без категорії</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="form-label" htmlFor="stat">
          Статус
        </label>
        <select
          id="stat"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="published">Опубліковано</option>
          <option value="draft">Чернетка</option>
        </select>
        {existingImageUrl ? (
          <p className="form-hint">
            Поточне зображення:{" "}
            <img
              className="form-thumb-preview"
              src={mediaUrl(existingImageUrl)}
              alt=""
            />
          </p>
        ) : null}
        <label className="form-label" htmlFor="img">
          Нове зображення (необов’язково)
        </label>
        <input
          id="img"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
        />
        <button type="submit">Зберегти</button>
      </form>
    </div>
  );
};
