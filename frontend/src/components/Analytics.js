import React, { useState, useEffect } from 'react';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // --- Fetch analytics data ---
  const fetchAnalytics = async () => {
    const token = getToken();
    try {
      // Endpoint: /api/admin/analytics
      const response = await fetch('/api/admin/analytics', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 403) {
         throw new Error("Permission Denied: Requires Analyst or Admin role.");
      }
      if (!response.ok) throw new Error('Failed to fetch analytics.');

      const analyticsData = await response.json();
      setData(analyticsData);

    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <p>Loading system analytics...</p>;
  if (error) return <p className="text-red-600 font-semibold">Error: {error}</p>;
  if (!data) return <p>No analytics data available.</p>;

  return (
    <div className="p-4 grid grid-cols-3 gap-6">
      <h3 className="col-span-3 text-xl font-semibold mb-4">📈 System Analytics Overview</h3>
      
      <div className="bg-blue-100 p-4 rounded shadow">
        <p className="text-3xl font-bold">{data.total_users || 0}</p>
        <p className="text-sm text-blue-800">Total Registered Users</p>
      </div>
      
      <div className="bg-yellow-100 p-4 rounded shadow">
        <p className="text-3xl font-bold">{data.pending_submissions || 0}</p>
        <p className="text-sm text-yellow-800">Items Awaiting Review</p>
      </div>

      <div className="bg-green-100 p-4 rounded shadow">
        <p className="text-3xl font-bold">{data.resolved_items || 0}</p>
        <p className="text-sm text-green-800">Items Successfully Released</p>
      </div>
      
      {/* You would add charts or detailed graphs here */}
    </div>
  );
}