import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { username, password, role });
      alert("Registered — please log in");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Register failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-3">Register</h2>
      <form onSubmit={submit}>
        <input required placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full border p-2 mb-3" />
        <input required placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-2 mb-3" />
        <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border p-2 mb-3">
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="guard">Guard</option>
          <option value="admin">Admin</option>
        </select>
        <button className="bg-green-600 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  );
}
