import React, { useState, useEffect, useContext } from 'react';
// CORRECTED IMPORTS: Components are typically in the '../components' folder.
import UserManagement from '../components/UserManagement'; 
import ItemReview from '../components/ItemReview';
import Analytics from '../components/Analytics';
import AuditLogs from '../components/AuditLogs';
import { AuthContext } from '../context/authcontext'; 

// --------------------------------------------------

const AdminDashboard = () => {
  // ✅ 1. ALL HOOKS ARE CALLED AT THE TOP, UNCONDITIONALLY
  const { user } = useContext(AuthContext); 
  const [activeTab, setActiveTab] = useState('user-management');
  
  // Define the hasPermission function locally since it is missing from AuthContext.
  const hasPermission = (requiredRoles) => {
    const userRole = user?.role;
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
  };

  // Define tabs and their required roles for access
  const dashboardTabs = [
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
      case 'user-management':
        return <UserManagement userRole={userRole} />;
      case 'item-review':
        return <ItemReview userRole={userRole} />; 
      case 'analytics':
        return <Analytics userRole={userRole} />;
      case 'audit-logs':
        return <AuditLogs userRole={userRole} />;
      default:
        // If the activeTab was set to null because of lack of permissions
        return <p>No accessible content. Select a tab or check permissions.</p>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {dashboardTabs.map(tab => 
          // Only show tabs the user has permission for
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
      
    </div>
  );
};

export default AdminDashboard;