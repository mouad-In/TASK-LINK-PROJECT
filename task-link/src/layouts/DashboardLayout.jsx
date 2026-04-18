import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Link2, LayoutDashboard, ClipboardList, MessageSquare, 
  Heart, Settings, LogOut, Menu, X, Bell, Search, 
  Plus, User, Briefcase, Star
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logout, setUserType } from '@/features/auth/authSlice';  // ✅ حذف updateUser
import { fetchUnreadCount, markNotificationsAsRead } from '@/features/notifications/notificationsSlice';

const clientNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/client/dashboard' },
  { icon: ClipboardList, label: 'My Tasks', path: '/client/tasks' },
  { icon: MessageSquare, label: 'Messages', path: '/client/messages' },
  { icon: Heart, label: 'Favorites', path: '/client/favorites' },
  { icon: Settings, label: 'Settings', path: '/client/settings' },
];

const workerNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/worker/dashboard' },
  { icon: ClipboardList, label: 'Find Tasks', path: '/worker/tasks' },
  { icon: MessageSquare, label: 'Messages', path: '/worker/messages' },
  { icon: Heart, label: 'Saved', path: '/worker/saved' },,
  { icon: Star, label: 'Reviews', path: '/worker/reviews' },
  { icon: Settings, label: 'Settings', path: '/worker/settings' },
];

const DashboardLayout = ({ children, userType: propUserType }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, userType: storeUserType, isAuthenticated } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const userType = propUserType || storeUserType || 'client';
  const navItems = userType === 'client' ? clientNavItems : workerNavItems;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${userType}/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (unreadCount > 0) {
      dispatch(markNotificationsAsRead());
    }
  };

  // ✅ إصلاح: استخدام first_name و last_name بدل name
  const getUserInitials = () => {
    const firstName = user?.first_name || '';
    const lastName = user?.last_name || '';
    if (!firstName && !lastName) return 'JD';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getUserDisplayName = () => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return 'John Doe';
  };

  const getUserTypeColor = () => {
    return userType === 'client' 
      ? 'from-fuchsia-500 to-purple-600' 
      : 'from-cyan-500 to-blue-600';
  };

  const getActiveLinkClass = (path) => {
    const isActive = location.pathname === path;
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200";
    if (!isActive) {
      return `${baseClass} text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`;
    }
    if (userType === 'client') {
      return `${baseClass} bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 text-fuchsia-600 dark:text-fuchsia-400 font-medium`;
    }
    return `${baseClass} bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400 font-medium`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-6 border-b border-slate-200 dark:border-slate-800">
            <Link to="/" className="flex items-center gap-2">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${getUserTypeColor()}`}>
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">TaskLink</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} className={getActiveLinkClass(item.path)} onClick={() => setSidebarOpen(false)}>
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${getUserTypeColor()}`}>
                <span className="text-white text-sm font-semibold">{getUserInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                {/* ✅ إصلاح: استخدام getUserDisplayName */}
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userType}</p>
              </div>
            </div>
            
            {userType === 'worker' && user?.stats && (
              <div className="px-4 py-2 mb-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Rating</span>
                  <span className="text-amber-500 font-medium">{user.stats.rating || 4.8} ★</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-slate-500">Tasks</span>
                  <span className="text-slate-700 dark:text-slate-300">{user.stats.tasksCompleted || 0}</span>
                </div>
              </div>
            )}
            
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 px-4 lg:px-8 py-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <Menu className="w-6 h-6" />
            </button>

            <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder={`Search ${userType === 'client' ? 'workers' : 'tasks'}...`}
                className="pl-10 bg-slate-100 dark:bg-slate-800 border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="flex-1 sm:hidden" />

            <div className="flex items-center gap-3">
              {userType === 'client' && (
                <Button 
                  className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate('/client/tasks/new')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Post Task</span>
                </Button>
              )}
              
              <div className="relative">
                <button 
                  className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  onClick={handleNotificationClick}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
              {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {unreadCount === 0 ? (
                        <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                          No new notifications
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                            <p className="text-sm text-slate-700 dark:text-slate-300">New message from Sarah Chen</p>
                            <p className="text-xs text-slate-500 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                      <button 
                        className="text-sm text-fuchsia-600 dark:text-fuchsia-400 hover:underline w-full text-center"
                        onClick={() => navigate('/notifications')}
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <ThemeToggle />

              <button className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="sm:hidden px-4 pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  placeholder={`Search ${userType === 'client' ? 'workers' : 'tasks'}...`}
                  className="pl-10 bg-slate-100 dark:bg-slate-800 border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;