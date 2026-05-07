import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage, validateMinLength } from "../utils/formValidation";
import "./Form.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("published");
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateImageFile = (file) => {
    if (!file) return null;
    
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Допускаються лише файли: JPEG, PNG, GIF, WebP";
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return "Розмір файлу не повинен перевищувати 5MB";
    }
    
    return null;
  };

  useEffect(() => {
    api
      .get("/posts/categories/")
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data.results;
        setCategories(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setCategories([]));
  }, []);

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
    setErrors({});

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      fd.append("status", status);
      if (categoryId) fd.append("category", categoryId);
      if (imageFile) fd.append("image", imageFile);

      const res = await api.post("/posts/", fd);
      if (res.data?.slug) {
        navigate(`/posts/${res.data.slug}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      setErrors({
        general: getApiErrorMessage(
          err.response?.data,
          "Не вдалося створити пост",
        ),
      });
    }
  };

  return (
    <div className="form-page">
      <h1>Створити пост</h1>
      {errors.general ? <p className="form-error">{errors.general}</p> : null}
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
        <label className="form-label" htmlFor="img">
          Зображення (необов’язково)
        </label>
        <input
          id="img"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            const validationError = validateImageFile(file);
            if (validationError) {
              setErrors((p) => ({ ...p, image: validationError }));
              setImageFile(null);
            } else {
              setErrors((p) => ({ ...p, image: "" }));
              setImageFile(file);
            }
          }}
        />
        {errors.image && <p className="form-error">{errors.image}</p>}
        <button type="submit">Зберегти</button>
      </form>
    </div>
  );
};
