import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import SecondaryNavbar from '../components/common/SecondaryNavbar';
import ToastContainer from '../components/ui/Toast';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <SecondaryNavbar />
      
      {/* Main Content */}
      <main 
        className="pt-20"
      >
        <div className="p-6">
          <Outlet />
        </div>
        <ToastContainer />
      </main>
    </div>
  );
};

export default MainLayout;

