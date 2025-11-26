import React, { useState, useEffect, useCallback } from 'react';
// import ItemForm from './ItemForm'; 

export default function ItemReview({ userRole }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // --- CHECK USER ROLE FOR CONDITIONAL RENDERING ---
  const isModeratorOrAdmin = userRole === 'super_admin' || userRole === 'moderator';

  // --- Define the Report Item Form (Placeholder remains the same) ---
  const ReportItemForm = (
      <div className="report-form-container bg-blue-50 p-4 rounded mb-6">
          <h2>Report Lost Item (Form Placeholder)</h2>
          <p>This is where the Report Lost Item form JSX/component goes.</p>
      </div>
  );
  
  // --- Define fetchSubmissions using useCallback for dependency stability ---
  // Define it *before* useEffect and *inside* the component function.
  const fetchSubmissions = useCallback(async () => {
    const token = getToken();
    if (!token) return setError("Not authenticated.");

    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 403) {
         throw new Error("Permission Denied: Requires Moderator or Admin role.");
      }
      if (!response.ok) throw new Error('Failed to fetch submissions.');

      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array because getToken is stable and not a state/prop

  // --- Action Handler (Ensure this is also defined before it's used) ---
  const handleAction = async (itemId, action) => {
    // ... (Your existing handleAction logic that calls fetchSubmissions after success)
    const token = getToken();
    if (!token) return setError("Not authenticated for action.");

    try {
        const response = await fetch(`/api/items/${itemId}/status`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: action }) // 'approved', 'pending', or 'rejected'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update item status.');
        }

        alert(`Item ${itemId} marked as ${action}. Notification triggered.`);
        fetchSubmissions(); // Re-fetch list
    } catch (err) {
        setError(err.message || 'An error occurred during status update.');
    }
 };


  // --- useEffect calls the defined function ---
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]); // Dependency on fetchSubmissions (stable via useCallback)


  if (loading) return <p>Loading review queue...</p>;
  if (error) return <p className="text-red-600 font-semibold">Error: {error}</p>;

  return (
    // ... (rest of the JSX remains the same) ...
    <div className="p-4">
        {!isModeratorOrAdmin && ReportItemForm} 

      <h3 className="text-xl font-semibold mb-4">📝 Item Review & Claim Verification</h3>
      
      {submissions.map(item => (
        <div key={item.id} className="border p-3 mb-2 flex justify-between items-center">
          <span>{item.name} - Status: **{item.status}**</span>
          <div>
            <button onClick={() => handleAction(item.id, 'approved')} className="bg-green-500 text-white p-1 text-sm mr-2">Approve Item (Found)</button>
            <button onClick={() => handleAction(item.id, 'pending')} className="bg-yellow-500 text-white p-1 text-sm mr-2">Set Pending Review</button>
            <button onClick={() => handleAction(item.id, 'rejected')} className="bg-red-500 text-white p-1 text-sm">Reject Item</button>
          </div>
        </div>
      ))}
    </div>
  );
}