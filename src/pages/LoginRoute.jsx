import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "./LoginPage";

export default function LoginRoute() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) return <Navigate to="/events" replace />;

  const from = location.state?.from?.pathname || "/events";

  return (
    <LoginPage
      onLogin={(username) => {
        login(username);
        navigate(from, { replace: true });
      }}
    />
  );
}

