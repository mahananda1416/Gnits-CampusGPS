import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      alert(`Access denied for ${user.role}s!!`);
    }
  }, [user, allowedRoles]);

  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role))
    return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;