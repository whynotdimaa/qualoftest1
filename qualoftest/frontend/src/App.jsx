import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Post } from "./pages/Post";
import { Profile } from "./pages/Profile";
import { CreatePost } from "./pages/CreatePost";
import { MyPosts } from "./pages/MyPosts";
import { EditPost } from "./pages/EditPost";
import { Subscribe } from "./pages/Subscribe";
import { SubscriptionSuccess } from "./pages/SubscriptionSuccess";
import { Payments } from "./pages/Payments";
import { PaymentDetail } from "./pages/PaymentDetail";
import { MyComments } from "./pages/MyComments";
import { Categories } from "./pages/Categories";
import { CategoryPosts } from "./pages/CategoryPosts";
import { PrivateRoute } from "./components/PrivateRoute";
import { NotFound } from "./pages/NotFound";

export const App = () => {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<CategoryPosts />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route
              path="/subscription/success"
              element={<SubscriptionSuccess />}
            />
            <Route
              path="/posts/create"
              element={
                <PrivateRoute>
                  <CreatePost />
                </PrivateRoute>
              }
            />
            <Route path="/posts/:slug" element={<Post />} />
            <Route
              path="/posts/:slug/edit"
              element={
                <PrivateRoute>
                  <EditPost />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-posts"
              element={
                <PrivateRoute>
                  <MyPosts />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-comments"
              element={
                <PrivateRoute>
                  <MyComments />
                </PrivateRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <PrivateRoute>
                  <Payments />
                </PrivateRoute>
              }
            />
            <Route
              path="/payments/:id"
              element={
                <PrivateRoute>
                  <PaymentDetail />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
