import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, bootstrapped } = useSelector((state) => state.auth);
  const location = useLocation();

  // Jab tak app ye check nahi kar leta ki user logged-in hai ya nahi
  // (silent refresh cookie se), kuch render mat karo — warna login page
  // flash ho jaayega ek second ke liye
  if (!bootstrapped) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
