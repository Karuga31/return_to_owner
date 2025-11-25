import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authcontext";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="text-xl font-semibold">Return to Owner</Link>
        <nav className="space-x-4">
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              {user.role === "admin" && <Link to="/admin">Admin</Link>}
              {user.role === "guard" && <Link to="/guard">Guard</Link>}
              <button onClick={() => { logout(); navigate("/"); }} className="ml-2 text-sm bg-red-500 text-white px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-blue-600 text-white px-3 py-1 rounded">Login</Link>
              <Link to="/register" className="ml-2 bg-green-600 text-white px-3 py-1 rounded">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
