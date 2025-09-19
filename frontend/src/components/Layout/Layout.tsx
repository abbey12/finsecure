import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 overflow-auto focus:outline-none">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content */}
        <main className="flex-1 relative z-0 overflow-y-auto py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 