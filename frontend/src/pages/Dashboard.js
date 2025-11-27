import React from "react";

export default function Dashboard() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-2">Welcome, {username}!</h2>
      <p className="mb-2 text-gray-700">Your role: <span className="font-semibold text-indigo-600">{role}</span></p>

      {/* Quick Actions based on role */}
      {role === "user" && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <ul className="list-disc ml-6 text-gray-600">
            <li>Report a lost item</li>
            <li>View found items</li>
            <li>Check status of your reports</li>
          </ul>
        </div>
      )}
      {(role === "admin" || role === "super_admin") && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Admin Quick Actions</h3>
          <ul className="list-disc ml-6 text-gray-600">
            <li>Review and approve lost item submissions</li>
            <li>Manage users and roles</li>
            <li>View system analytics and audit logs</li>
            <li>Report lost items for others</li>
          </ul>
        </div>
      )}
      {role === "moderator" && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Moderator Actions</h3>
          <ul className="list-disc ml-6 text-gray-600">
            <li>Review pending item claims</li>
            <li>Assist with item verification</li>
          </ul>
        </div>
      )}

      <p className="mt-6 text-sm text-gray-500">Use the menu to navigate to your role-specific pages and features.</p>
    </div>
  );
}
