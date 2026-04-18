// AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, AlertCircle, RefreshCw, TrendingUp, TrendingDown, DollarSign, Users, Briefcase, Star } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Redux actions
import { 
  fetchDashboardStats, 
  fetchRevenueData, 
  fetchCategoryData, 
  fetchWeeklyActivity,
  fetchAnalytics 
} from '@/features/admin/adminSlice';
import { addToast } from '@/features/notifications/notificationsSlice';

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { 
    stats: kpis,
    revenueData,
    categoryData,
    weeklyActivity,
    analytics,
    isLoading,
    error 
  } = useSelector((state) => state.admin);
  
  const [dateRange, setDateRange] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch analytics data on component mount and when date range changes
  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchDashboardStats({ range: dateRange })),
      dispatch(fetchRevenueData({ range: dateRange })),
      dispatch(fetchCategoryData()),
      dispatch(fetchWeeklyActivity()),
      dispatch(fetchAnalytics({ range: dateRange }))
    ]);
    setIsRefreshing(false);
  };

  const handleRefresh = async () => {
    await fetchData();
    dispatch(addToast({
      message: 'Analytics data refreshed',
      type: 'success'
    }));
  };

  // Transform revenue data for the chart
  const revenueChartData = revenueData?.map(item => ({
    month: item.month,
    revenue: item.revenue || 0,
    expenses: item.expenses || Math.round((item.revenue || 0) * 0.55) // Example: expenses ~55% of revenue
  })) || [];

  // Transform user growth data from weekly activity or create from analytics
  const userGrowthData = weeklyActivity?.map((item, index) => ({
    month: item.day,
    clients: item.clients || 0,
    workers: item.workers || 0
  })) || [];

  // Transform category revenue data
  const categoryRevenueData = categoryData?.map(item => ({
    name: item.name,
    revenue: Math.round((item.value / 100) * (analytics?.totalRevenue || 100000))
  })) || [];

  // Satisfaction data (could come from API or be calculated)
  const satisfactionData = [
    { name: '5 Stars', value: 45, color: 'hsl(142, 71%, 45%)' },
    { name: '4 Stars', value: 30, color: 'hsl(217, 91%, 60%)' },
    { name: '3 Stars', value: 15, color: 'hsl(38, 92%, 50%)' },
    { name: '2 Stars', value: 7, color: 'hsl(25, 95%, 53%)' },
    { name: '1 Star', value: 3, color: 'hsl(0, 84%, 60%)' },
  ];

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.75rem',
    fontSize: '12px',
    color: 'hsl(var(--foreground))',
  };

  // Loading state
  if (isLoading && !kpis) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error && !kpis) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Error loading analytics: {error}</p>
            <Button onClick={() => fetchData()}>
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics">
      {/* Header with Date Range Selector and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Platform performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            disabled={isRefreshing}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis?.map((kpi) => (
          <Card key={kpi.label} className="border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${kpi.up ? 'text-emerald-600' : 'text-destructive'}`}>
                    {kpi.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {kpi.change} vs last month
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                  {kpi.icon === 'Users' && <Users className="w-5 h-5 text-white" />}
                  {kpi.icon === 'DollarSign' && <DollarSign className="w-5 h-5 text-white" />}
                  {kpi.icon === 'ClipboardList' && <Briefcase className="w-5 h-5 text-white" />}
                  {kpi.icon === 'Activity' && <Star className="w-5 h-5 text-white" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue vs Expenses */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="hsl(142, 71%, 45%)" fill="url(#gRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" name="Expenses ($)" stroke="hsl(0, 84%, 60%)" fill="url(#gExp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">User Growth</CardTitle>
            <CardDescription>Cumulative user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="clients" name="Clients" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="workers" name="Workers" stroke="hsl(258, 90%, 66%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No user growth data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Revenue & Satisfaction */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue by Category</CardTitle>
            <CardDescription>Top performing service categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryRevenueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-muted-foreground" fontSize={12} />
                  <YAxis dataKey="name" type="category" className="text-muted-foreground" fontSize={12} width={80} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="hsl(217, 91%, 60%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No category revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">User Satisfaction</CardTitle>
            <CardDescription>Rating distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={satisfactionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label>
                  {satisfactionData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Share']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Summary */}
      {analytics && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Platform Summary</CardTitle>
            <CardDescription>Key platform metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{analytics.totalUsers?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{analytics.totalTasks?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{analytics.completionRate || 0}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">${analytics.totalRevenue?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;