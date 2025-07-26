import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: ReactNode;
  roles?: ("student" | "admin")[]; // if provided, user must have one of these roles
}

const PrivateRoute = ({ children, roles }: Props) => {
  const { user } = useAuth();
  // If we might still be hydrating from localStorage token, return null to avoid premature redirect
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!user) {
    if (token) return null; // wait for AuthContext to decode and set user
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default PrivateRoute;
