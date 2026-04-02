import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, ListTodo, Users, Briefcase,
  MessageSquare, Star, BarChart3, Search
} from 'lucide-react';

const SecondaryNavbar = () => {
  const { user } = useSelector((state) => state.auth);

  const clientLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: ListTodo, label: 'My Tasks' },
    { to: '/workers', icon: Users, label: 'Find Workers' },
    { to: '/tasks/create', icon: Briefcase, label: 'Create Task' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/reviews', icon: Star, label: 'Reviews' },
  ];

  const workerLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/browse', icon: Search, label: 'Browse Tasks' },
    { to: '/tasks', icon: ListTodo, label: 'My Tasks' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: `/profile/${user?.id || ''}`, icon: Star, label: 'Reviews' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/tasks', icon: ListTodo, label: 'Tasks' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'client': return clientLinks;
      case 'worker': return workerLinks;
      case 'admin': return adminLinks;
      default: return clientLinks;
    }
  };

  return (
    <nav className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-30">
      <div className="px-6 flex items-stretch overflow-x-auto scrollbar-hide">
        {getLinks().map((link, index) => (
          <NavLink
            key={`${link.to}-${link.label}-${index}`}
            to={link.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 h-12 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150 flex-shrink-0 ` +
              (isActive
                ? 'text-fuchsia-600 border-fuchsia-600'
                : 'text-gray-500 border-transparent hover:text-fuchsia-600')
            }
          >
            {({ isActive }) => (
              <>
                <link.icon
                  size={15}
                  className={isActive ? 'text-fuchsia-600' : 'text-gray-400'}
                />
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default SecondaryNavbar;