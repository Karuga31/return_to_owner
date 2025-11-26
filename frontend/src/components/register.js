import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // FIX 1: Default role set to 'user'
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { username, password, role });
      // FIX 2: Replace alert() with a custom message box or log in a production app
      console.log("Registered — please log in"); 
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data?.error || "Register failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-3">Register</h2>
      <form onSubmit={submit}>
        <input required placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full border p-2 mb-3" />
        <input required placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-2 mb-3" />
        <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border p-2 mb-3">
          {/* FIX 3: Consolidated roles */}
          <option value="user">User (Standard)</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  );
}