// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardList, BarChart3, Settings, LogOut,
  Menu, X, Bell, TrendingUp, TrendingDown, DollarSign, UserPlus,
  Activity, Eye, MoreHorizontal, Search, Shield, Link2, Loader2,
  AlertCircle, Filter, Download, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Redux actions
import { 
  fetchDashboardStats,
  fetchRevenueData,
  fetchCategoryData,
  fetchWeeklyActivity,
  fetchUsers,
  updateUserStatus,
  deleteUser,
  fetchRecentTasks,
  fetchAnalytics
} from '@/features/admin/adminSlice';
import { addToast } from '@/features/notifications/notificationsSlice';
import { useLocation } from "react-router-dom";



const adminNav = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: ClipboardList, label: 'Tasks', path: '/admin/tasks' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state selectors
  const { 
    stats: kpis,
    revenueData,
    categoryData,
    weeklyActivity,
    users,
    recentTasks,
    analytics,
    isLoading,
    error,
    pagination
  } = useSelector((state) => state.admin);
  
  const { notifications } = useSelector((state) => state.notifications);
  
  // Local state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState('month');
  
  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, [currentPage, dateRange]);
  
  const fetchAllData = () => {
    dispatch(fetchDashboardStats({ range: dateRange }));
    dispatch(fetchRevenueData({ range: dateRange }));
    dispatch(fetchCategoryData());
    dispatch(fetchWeeklyActivity());
    dispatch(fetchUsers({ page: currentPage, search: searchQuery }));
    dispatch(fetchRecentTasks());
    dispatch(fetchAnalytics({ range: dateRange }));
  };
  
  const handleRefresh = () => {
    fetchAllData();
    dispatch(addToast({
      message: 'Dashboard data refreshed',
      type: 'success'
    }));
  };
  
  const handleExportData = () => {
    // Implement CSV export
    dispatch(addToast({
      message: 'Export started. Download will begin shortly.',
      type: 'info'
    }));
  };
  
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await dispatch(updateUserStatus({ userId, status: newStatus })).unwrap();
      dispatch(addToast({
        message: `User status updated to ${newStatus}`,
        type: 'success'
      }));
    } catch (error) {
      dispatch(addToast({
        message: error.message || 'Failed to update user status',
        type: 'error'
      }));
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        dispatch(addToast({
          message: 'User deleted successfully',
          type: 'success'
        }));
      } catch (error) {
        dispatch(addToast({
          message: error.message || 'Failed to delete user',
          type: 'error'
        }));
      }
    }
  };
  
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getTaskStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  const location = useLocation();
  
  // Loading state
  if (isLoading && !kpis) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-6 border-b border-border">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Admin Panel</span>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {adminNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 dark:text-red-400 font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 px-4 py-3 w-full text-muted-foreground hover:bg-muted rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              Back to Site
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-4 px-4 lg:px-8 py-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Dashboard Overview</h1>
            <div className="flex-1" />
            
            {/* Date Range Selector */}
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1 rounded-lg border border-border bg-background text-sm"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
              <option value="year">Last 12 months</option>
            </select>
            
            <button 
              onClick={handleRefresh}
              className="p-2 text-muted-foreground hover:bg-muted rounded-xl"
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              onClick={handleExportData}
              className="p-2 text-muted-foreground hover:bg-muted rounded-xl"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-xl">
              <Bell className="w-5 h-5" />
              {notifications?.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-8 space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive flex-1">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>Retry</Button>
            </div>
          )}
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis?.map((kpi) => (
              <Card key={kpi.label} className="border-border overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{kpi.label}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{kpi.value}</p>
                      <div className={`flex items-center gap-1 mt-2 text-sm ${kpi.up ? 'text-emerald-600' : 'text-destructive'}`}>
                        {kpi.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {kpi.change} vs last month
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                      <kpi.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="xl:col-span-2 border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Revenue & Tasks Overview</CardTitle>
                <CardDescription>Monthly revenue and task completion trends</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(258, 90%, 66%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(258, 90%, 66%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                      <XAxis dataKey="month" stroke="hsl(215, 16%, 47%)" fontSize={12} />
                      <YAxis stroke="hsl(215, 16%, 47%)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(0, 0%, 100%)',
                          border: '1px solid hsl(214, 32%, 91%)',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="hsl(217, 91%, 60%)" fill="url(#colorRevenue)" strokeWidth={2} />
                      <Area type="monotone" dataKey="tasks" name="Tasks" stroke="hsl(258, 90%, 66%)" fill="url(#colorTasks)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Pie */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Task Categories</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(0, 0%, 100%)',
                          border: '1px solid hsl(214, 32%, 91%)',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`${value}%`, 'Share']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity Bar Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Weekly User Activity</CardTitle>
              <CardDescription>New registrations by day (clients vs workers)</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyActivity ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis dataKey="day" stroke="hsl(215, 16%, 47%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 16%, 47%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(0, 0%, 100%)',
                        border: '1px solid hsl(214, 32%, 91%)',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="clients" name="Clients" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="workers" name="Workers" fill="hsl(258, 90%, 66%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px]">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Tasks Table */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-foreground">Recent Tasks</CardTitle>
                  <CardDescription>Latest tasks posted on the platform</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/tasks')}>
                  View All Tasks
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Task</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Category</TableHead>
                    <TableHead className="text-muted-foreground">Budget</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Posted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTasks?.slice(0, 5).map((task) => (
                    <TableRow key={task.id} className="border-border cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/tasks/${task.id}`)}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground">by {task.client?.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{task.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">${task.budget}</TableCell>
                      <TableCell>{getTaskStatusBadge(task.status)}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {task.postedAt ? new Date(task.postedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* User Management Table */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-foreground">User Management</CardTitle>
                  <CardDescription>Manage platform users and roles</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9 bg-muted border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Tasks</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Joined</TableHead>
                    <TableHead className="text-muted-foreground w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                            {user.avatar || user.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Worker' ? 'secondary' : 'outline'} className="text-xs">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-foreground">{user.tasks}</TableCell>
                      <TableCell>
                        <select
                          value={user.status?.toLowerCase()}
                          onChange={(e) => handleUpdateUserStatus(user.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded border border-border bg-background"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="pending">Pending</option>
                        </select>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {user.joined}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {pagination?.lastPage > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {pagination.lastPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(pagination.lastPage, p + 1))}
                    disabled={currentPage === pagination.lastPage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;