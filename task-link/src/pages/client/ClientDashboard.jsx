// ClientDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import  DashboardLayout  from '@/layouts/DashboardLayout';
import { 
  ClipboardList, 
  Users, 
  DollarSign, 
  Star,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Plus,
  MoreVertical,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Redux actions from your existing slices
import { fetchTasks, updateTask, deleteTask } from '@/features/tasks/tasksSlice';
import { fetchClientStats, fetchBudgetAnalytics } from '@/features/client/clientSlice';

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  
  // Selectors from Redux store
  const { tasks, isLoading: tasksLoading, error: tasksError } = useSelector((state) => state.tasks);
  const { profile, stats, budgetAnalytics, isLoading: clientLoading } = useSelector((state) => state.client);
  
  useEffect(() => {
    // Fetch data on component mount
    dispatch(fetchTasks({ client_id: profile?.id, per_page: 10 }));
    dispatch(fetchClientStats(profile?.id));
    dispatch(fetchBudgetAnalytics(profile?.id));
  }, [dispatch, profile?.id]);
  
  // Filter tasks based on active tab
  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'in-progress':
        return tasks.filter(task => task.status === 'in_progress' || task.status === 'assigned');
      case 'pending':
        return tasks.filter(task => task.status === 'pending' || task.status === 'open');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      default:
        return tasks;
    }
  };
  
  const filteredTasks = getFilteredTasks();
  const recentTasks = filteredTasks.slice(0, 4);
  
  const handleViewAllTasks = () => {
    navigate('/client/tasks');
  };
  
  const handleCreateTask = () => {
    navigate('/client/tasks/create');
  };
  
  const handleTaskClick = (taskId) => {
    navigate(`/client/tasks/${taskId}`);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
      case 'assigned':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Clock className="w-3 h-3 mr-1" /> In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      case 'pending':
      case 'open':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <AlertCircle className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Transform stats for display
  const displayStats = [
    { 
      label: 'Active Tasks', 
      value: stats?.activeTasks?.toString() || '0', 
      change: `+${stats?.activeTasksChange || 0}`,
      icon: ClipboardList, 
      color: 'from-fuchsia-500 to-purple-600' 
    },
    { 
      label: 'Workers Hired', 
      value: stats?.workersHired?.toString() || '0', 
      change: `+${stats?.workersHiredChange || 0}`,
      icon: Users, 
      color: 'from-cyan-500 to-blue-600' 
    },
    { 
      label: 'Total Spent', 
      value: `$${stats?.totalSpent?.toLocaleString() || '0'}`, 
      change: `+${stats?.spentChange || 0}%`,
      icon: DollarSign, 
      color: 'from-green-500 to-emerald-600' 
    },
    { 
      label: 'Avg Rating Given', 
      value: stats?.averageRating?.toFixed(1) || '0', 
      change: `+${stats?.ratingChange || 0}`,
      icon: Star, 
      color: 'from-amber-500 to-orange-600' 
    },
  ];
  
  // Loading state
  if (tasksLoading || clientLoading) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (tasksError) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive">Error loading dashboard: {tasksError}</p>
            <Button 
              onClick={() => {
                dispatch(fetchTasks({ client_id: profile?.id, per_page: 10 }));
                dispatch(fetchClientStats(profile?.id));
              }}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="client">
      <div className="space-y-8">
        {/* Welcome Section with Create Task Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Welcome back, {profile?.firstName || 'Client'}!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Here's what's happening with your tasks
            </p>
          </div>
          <Button 
            onClick={handleCreateTask}
            className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Task
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayStats.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      {stat.change} from last month
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-lg">Recent Tasks</CardTitle>
              <div className="flex items-center gap-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="in-progress">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm" onClick={handleViewAllTasks}>
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-slate-900 dark:text-white">{task.title}</h4>
                          {task.urgency === 'high' && (
                            <Badge className="bg-red-500/10 text-red-600 text-xs">Urgent</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {task.assigned_worker && (
                            <span>Worker: {task.assigned_worker?.name || 'Assigned'}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> 
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                          </span>
                          {task.applicationsCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" /> 
                              {task.applicationsCount} applicants
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            ${task.budget}
                          </span>
                          <p className="text-xs text-muted-foreground">{task.budgetType}</p>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No tasks found</p>
                    <Button 
                      onClick={handleCreateTask}
                      variant="outline" 
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first task
                    </Button>
                  </div>
                )}
              </div>
              
              {tasks.length > 4 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" onClick={handleViewAllTasks}>
                    View All Tasks
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Analytics */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Budget Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Monthly Budget Spent</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    ${budgetAnalytics?.spent?.toLocaleString() || '0'} / ${budgetAnalytics?.total?.toLocaleString() || '5000'}
                  </span>
                </div>
                <Progress 
                  value={budgetAnalytics?.percentage || 0} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {budgetAnalytics?.remaining ? `$${budgetAnalytics.remaining.toLocaleString()} remaining` : 'Budget tracking'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Spending by Category
                </h4>
                {budgetAnalytics?.categories?.length > 0 ? (
                  budgetAnalytics.categories.map((category, index) => {
                    const colors = ['fuchsia', 'cyan', 'amber', 'green', 'purple', 'blue', 'orange', 'pink'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-slate-900 dark:text-white">
                            ${category.amount.toLocaleString()}
                          </span>
                          <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No spending data available</p>
                  </div>
                )}
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => navigate('/client/budget')}>
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions Section */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={handleCreateTask}>
                <Plus className="w-5 h-5" />
                <span>Post New Task</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/client/workers')}>
                <Users className="w-5 h-5" />
                <span>Find Workers</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/client/messages')}>
                <Clock className="w-5 h-5" />
                <span>View Messages</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/client/reviews')}>
                <Star className="w-5 h-5" />
                <span>Leave Reviews</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;