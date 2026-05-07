import { Link } from "react-router-dom";
import "./NotFound.css";

export const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-card">
        <p className="not-found-code">404</p>
        <h1>Сторінку не знайдено</h1>
        <p>Можливо, посилання застаріло або сторінка була видалена.</p>
        <Link to="/" className="not-found-link">
          Повернутися на головну
        </Link>
      </div>
    </div>
  );
};
