import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const { user, bootstrapped } = useSelector((state) => state.auth);

  if (!bootstrapped) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
