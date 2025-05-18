import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // or check from context/state

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
