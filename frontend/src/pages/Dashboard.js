import React from "react";

export default function Dashboard() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <p className="mt-2">Welcome, {username} — Role: {role}</p>
      <p className="mt-3 text-sm text-gray-500">Use the menu to navigate to role-specific pages.</p>
    </div>
  );
}
