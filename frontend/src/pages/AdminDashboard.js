// CORRECTED IMPORTS: Components are typically in the '../components' folder.
import React, { useState, useEffect, useContext } from 'react';
import UserManagement from '../components/UserManagement'; 
import ItemReview from '../components/ItemReview';
import Analytics from '../components/Analytics';
import AuditLogs from '../components/AuditLogs';
import ItemForm from '../components/ItemForm';
import ItemList from '../components/ItemList';
import { AuthContext } from '../context/authcontext'; 

// --------------------------------------------------

const AdminDashboard = () => {
  // ✅ 1. ALL HOOKS ARE CALLED AT THE TOP, UNCONDITIONALLY
  const { user } = useContext(AuthContext); 
	const [activeTab, setActiveTab] = useState('user-management');
	const [userCount, setUserCount] = useState(null);
  
  // Define the hasPermission function locally since it is missing from AuthContext.
  const hasPermission = (requiredRoles) => {
    const userRole = user?.role;
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
  };

  // Define tabs and their required roles for access
	const dashboardTabs = [
		{ id: 'overview', name: 'System Overview', roles: ['admin', 'super_admin'] },
		{ id: 'user-management', name: 'User Management', roles: ['admin', 'super_admin'] },
		{ id: 'item-review', name: 'Item Review & Claims', roles: ['admin', 'super_admin', 'moderator'] },
		{ id: 'analytics', name: 'System Analytics', roles: ['admin', 'super_admin', 'analyst'] },
		{ id: 'audit-logs', name: 'Audit Logs', roles: ['admin', 'super_admin'] },
	];

  // ✅ 2. useEffect (Hook) is placed *before* the conditional access check.
  useEffect(() => {
    const accessibleTabs = dashboardTabs.filter(tab => hasPermission(tab.roles));
    
    // Check if the current activeTab is accessible. If not, switch to the first accessible one.
    const currentTabInfo = dashboardTabs.find(tab => tab.id === activeTab);
    
    if (!currentTabInfo || !hasPermission(currentTabInfo.roles)) {
      if (accessibleTabs.length > 0) {
        setActiveTab(accessibleTabs[0].id);
      } else {
        // Optional: handle case where user logs in but has zero permissions
        setActiveTab(null); 
      }
    }
  }, [user, activeTab]); 

  // --------------------------------------------------
  // 3. CONDITIONAL ACCESS CHECK (Return) IS NOW SAFE
  // --------------------------------------------------
  
  // Get the list of all roles that can access *any* part of the dashboard
	const requiredRoles = ['admin', 'super_admin', 'moderator', 'analyst'];

  // If the user object or role is missing, or they don't have the base permission, deny access.
  if (!user || !user.role || !hasPermission(requiredRoles)) {
    return <div className="p-6 text-red-500">Access Denied. You do not have permission to view this page.</div>;
  }
  
	// Helper function remains outside of renderContent for cleanliness
	const renderContent = () => {
		// Get the role of the logged-in user for passing to children
		const userRole = user?.role || 'guest';

		switch (activeTab) {
			case 'overview':
				return (
					<div className="p-4">
						<h2 className="text-2xl font-bold mb-2">System Overview</h2>
						<p className="mb-4 text-gray-700">Welcome to the admin dashboard. Here you can manage users, review lost items, and monitor system analytics.</p>
						<ul className="list-disc ml-6 text-gray-600 mb-4">
							<li>Quickly access user management, item review, analytics, and audit logs using the tabs above.</li>
							<li>Admins and super admins can report lost items and approve/reject submissions.</li>
							<li>Use the analytics tab for system stats and trends.</li>
							<li>Audit logs track sensitive actions for transparency.</li>
						</ul>
						<div className="mt-6 p-4 bg-gray-100 rounded">
							<h3 className="font-semibold mb-2">Navigation Tips</h3>
							<ul className="list-disc ml-6 text-gray-600">
								<li>Switch tabs to view different admin features.</li>
								<li>Use the user management tab to suspend or update users.</li>
								<li>Review and approve lost item claims in the item review tab.</li>
								<li>Monitor system health and usage in analytics.</li>
							</ul>
						</div>
					</div>
				);
			case 'user-management':
				// Custom wrapper to get user count from UserManagement
				return <UserManagement userRole={userRole} setUserCount={setUserCount} />;
			case 'item-review':
				return (
					<>
						{(userRole === 'admin' || userRole === 'super_admin') && <ItemForm userRole={userRole} />}
						<ItemReview userRole={userRole} />
					</>
				);
			case 'analytics':
				return <Analytics userRole={userRole} />;
			case 'audit-logs':
				return <AuditLogs userRole={userRole} />;
			default:
				return <p>No accessible content. Select a tab or check permissions.</p>;
		}
	};

	return (
		<div className="bg-gray-50 min-h-screen p-8">
			<h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h1>

			{/* Quick Navigation Buttons for Admin/Super Admin */}
			{(user.role === 'admin' || user.role === 'super_admin') && (
				<div className="mb-6 flex flex-wrap gap-4">
					<button
						className={`bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded shadow ${activeTab === 'overview' ? 'ring-2 ring-indigo-400' : ''}`}
						onClick={() => setActiveTab('overview')}
					>
						System Overview
					</button>
					<button
						className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow relative ${activeTab === 'user-management' ? 'ring-2 ring-blue-400' : ''}`}
						onClick={() => setActiveTab('user-management')}
					>
						User Management
						{userCount !== null && (
							<span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
								{userCount}
							</span>
						)}
					</button>
					<button
						className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow ${activeTab === 'item-review' ? 'ring-2 ring-green-400' : ''}`}
						onClick={() => setActiveTab('item-review')}
					>
						Item Review & Claims
					</button>
					<button
						className={`bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded shadow ${activeTab === 'analytics' ? 'ring-2 ring-purple-400' : ''}`}
						onClick={() => setActiveTab('analytics')}
					>
						System Analytics
					</button>
					<button
						className={`bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded shadow ${activeTab === 'audit-logs' ? 'ring-2 ring-gray-400' : ''}`}
						onClick={() => setActiveTab('audit-logs')}
					>
						Audit Logs
					</button>
				</div>
			)}

			{/* Tab Navigation (still available for all roles) */}
			<div className="flex border-b border-gray-200 mb-6">
				{dashboardTabs.map(tab => 
					hasPermission(tab.roles) && (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`py-2 px-4 text-sm font-medium transition-colors duration-200 ${
								activeTab === tab.id
									? 'border-b-2 border-indigo-500 text-indigo-600'
									: 'text-gray-500 hover:text-gray-700'
							}`}
						>
							{tab.name}
						</button>
					)
				)}
			</div>

			{/* Main Content Area */}
			<div className="bg-white p-6 rounded-lg shadow-xl">
				{renderContent()}
			</div>

			{/* File Overview for Admin/Super Admin */}
			{(user.role === 'admin' || user.role === 'super_admin') && (
				<div className="mt-8 p-4 bg-gray-100 rounded-lg">
					<h2 className="text-lg font-semibold mb-2">Files Required for Each Tab</h2>
					<ul className="list-disc ml-6 text-gray-700">
						<li><b>System Overview:</b> <code>AdminDashboard.js</code></li>
						<li><b>User Management:</b> <code>UserManagement.js</code> (frontend), <code>admin_routes.py</code> (backend)</li>
						<li><b>Item Review & Claims:</b> <code>ItemReview.js</code>, <code>ItemForm.js</code> (frontend), <code>routes_items.py</code> (backend)</li>
						<li><b>System Analytics:</b> <code>Analytics.js</code> (frontend), <code>admin_routes.py</code> (backend)</li>
						<li><b>Audit Logs:</b> <code>AuditLogs.js</code> (frontend), <code>admin_routes.py</code> (backend)</li>
					</ul>
				</div>
			)}

		</div>
	);
};

export default AdminDashboard;