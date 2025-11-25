import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <div className="p-6 bg-white shadow rounded">Forbidden</div>;
  }

  return children;
}
