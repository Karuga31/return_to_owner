import React, { useState, useEffect } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get the JWT from your authentication context/storage
  const getToken = () => {
    // Replace with actual logic to retrieve the token (e.g., from localStorage)
    return localStorage.getItem('token'); 
  };

  // --- API Call to Backend ---
  const fetchUsers = async () => {
    const token = getToken();
    if (!token) {
      setError("Not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/users', { // Assuming this is your GET endpoint
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Pass the JWT for authentication
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403) {
         throw new Error("Permission Denied: You do not have the required role.");
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch user list.');
      }

      const data = await response.json();
      setUsers(data);
      setError(null);

    } catch (err) {
      setError(err.message || 'An error occurred while fetching users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  // --- Action Handler Example ---
  const handleSuspend = async (userId) => {
    const token = getToken();
    if (!token) return;

    // Call the secured PUT endpoint defined in your admin_routes.py
    const response = await fetch(`/api/admin/users/${userId}/suspend`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      alert(`User ${userId} suspended.`);
      fetchUsers(); // Refresh the list
    } else {
      alert('Failed to suspend user. Check backend logs/permissions.');
    }
  };


  // --- Rendering UI ---
  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-600 font-semibold">Error: {error}</p>;

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">👤 User Management ({users.length} Total)</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <button 
                  onClick={() => handleSuspend(user.id)}
                  className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600">
                  Suspend
                </button>
                {/* Add other buttons for Approve, Reject, etc. */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}