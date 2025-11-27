import React, { useState, useEffect } from 'react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // --- Fetch Audit Logs ---
  const fetchLogs = async () => {
    const token = getToken();
    try {
      // Endpoint: /api/admin/logs
      const response = await fetch('/api/admin/logs', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 403) {
         throw new Error("Permission Denied: Requires Super Admin role.");
      }
      if (!response.ok) throw new Error('Failed to fetch audit logs.');

      let logData;
      try {
        logData = await response.json();
      } catch (e) {
        throw new Error('Invalid JSON response. Backend may have returned HTML or an error page.');
      }
      setLogs(logData);
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <p>Loading audit logs...</p>;
  if (error) return <p className="text-red-600 font-semibold">Error: {error}</p>;

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Audit Logs (Sensitive Actions)</h3>
      <ul className="space-y-2 max-h-96 overflow-y-auto border p-3">
        {logs.length === 0 && <p>No logs found.</p>}
        {logs.map((log, index) => (
          <li key={index} className="text-sm border-b pb-1">
            <span className="font-medium text-gray-700">[{log.timestamp}]</span>
            <span className="font-bold ml-2 text-indigo-600">{log.admin_user}</span>: 
            <span className="ml-1">{log.action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}