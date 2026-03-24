import { Navigate } from "react-router-dom";
import { getProfile } from "../hooks/useAuth";

const RoleGuard = ({ allowedRoles, children, redirectTo = "/pdv" }) => {
  const profile = getProfile();
  const role = profile?.role ?? "";
  if (!allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

export default RoleGuard;
