// WorkerDashboard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import  DashboardLayout  from '@/layouts/DashboardLayout';
import { 
  ClipboardList, 
  DollarSign, 
  Star,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  MapPin,
  Zap,
  Briefcase,
  Users,
  ThumbsUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';

// Redux actions from your existing slices
import { fetchTasks, assignWorker } from '@/features/tasks/tasksSlice';
import { fetchWorkerStats, fetchPerformanceMetrics } from '@/features/worker/workerSlice';

const WorkerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Selectors for tasks
  const { tasks, isLoading: tasksLoading, error: tasksError } = useSelector((state) => state.tasks);
  const { profile, stats, performance, isLoading: workerLoading } = useSelector((state) => state.worker);
  
  // Filter available tasks (open for applications)
  const availableTasks = tasks.filter(task => 
    task.status === 'open' || task.status === 'pending' || !task.assigned_worker_id
  ).slice(0, 3);
  
  // Filter my active tasks (assigned to current worker)
  const myTasks = tasks.filter(task => 
    task.assigned_worker_id === profile?.id && 
    task.status !== 'completed' && 
    task.status !== 'cancelled'
  ).slice(0, 3);
  
  useEffect(() => {
    // Fetch data on component mount
    dispatch(fetchTasks({ status: 'open', per_page: 10 }));
    dispatch(fetchWorkerStats(profile?.id));
    dispatch(fetchPerformanceMetrics(profile?.id));
  }, [dispatch, profile?.id]);
  
  const handleApplyForTask = async (taskId) => {
    try {
      await dispatch(assignWorker({ taskId, workerId: profile?.id })).unwrap();
      // Refresh tasks after assignment
      dispatch(fetchTasks({ status: 'open', per_page: 10 }));
    } catch (error) {
      console.error('Failed to apply for task:', error);
    }
  };
  
  const handleViewAllTasks = () => {
    navigate('/worker/tasks');
  };
  
  const handleViewTaskDetails = (taskId) => {
    navigate(`/worker/tasks/${taskId}`);
  };
  
  // Loading state
  if (tasksLoading || workerLoading) {
    return (
      <DashboardLayout userType="worker">
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
      <DashboardLayout userType="worker">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive">Error loading dashboard: {tasksError}</p>
            <Button 
              onClick={() => {
                dispatch(fetchTasks({ status: 'open', per_page: 10 }));
                dispatch(fetchWorkerStats(profile?.id));
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
  
  // Transform stats for display
  const displayStats = [
    { 
      label: 'Active Tasks', 
      value: myTasks.length.toString(), 
      change: `+${myTasks.filter(t => t.status === 'in_progress').length}`,
      icon: ClipboardList, 
      color: 'from-cyan-500 to-blue-600' 
    },
    { 
      label: 'Earnings (Month)', 
      value: `$${stats?.monthlyEarnings?.toLocaleString() || '0'}`, 
      change: `+${stats?.earningsGrowth || 0}%`,
      icon: DollarSign, 
      color: 'from-green-500 to-emerald-600' 
    },
    { 
      label: 'Avg Rating', 
      value: stats?.averageRating?.toFixed(1) || '0', 
      change: `+${stats?.ratingChange || 0}`,
      icon: Star, 
      color: 'from-amber-500 to-orange-600' 
    },
    { 
      label: 'Completion Rate', 
      value: `${performance?.completionRate || 0}%`, 
      change: `+${performance?.completionRateChange || 0}%`,
      icon: Zap, 
      color: 'from-fuchsia-500 to-purple-600' 
    },
  ];
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'in_progress':
        return { label: 'In Progress', icon: Clock, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      case 'assigned':
        return { label: 'Assigned', icon: Users, className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
      case 'completed':
        return { label: 'Completed', icon: CheckCircle2, className: 'bg-green-500/10 text-green-600 border-green-500/20' };
      default:
        return { label: 'Scheduled', icon: Calendar, className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    }
  };
  
  return (
    <DashboardLayout userType="worker">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {profile?.firstName || 'Worker'}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            You have {availableTasks.length} new task opportunities nearby
          </p>
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
          {/* Available Tasks */}
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Available Near You</CardTitle>
              <button 
                onClick={handleViewAllTasks}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableTasks.length > 0 ? (
                  availableTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                      onClick={() => handleViewTaskDetails(task.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-slate-900 dark:text-white">{task.title}</h4>
                          <Badge variant="outline" className="text-xs">{task.category}</Badge>
                          {task.urgency === 'high' && (
                            <Badge className="bg-red-500/10 text-red-600 text-xs">Urgent</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {task.location || 'Remote'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {task.postedAt ? new Date(task.postedAt).toLocaleDateString() : 'Recently'}
                          </span>
                          {task.applicationsCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" /> {task.applicationsCount} applied
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-bold text-lg text-slate-900 dark:text-white">
                            ${task.budget}
                          </span>
                          <p className="text-xs text-muted-foreground">{task.budgetType}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyForTask(task.id);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No available tasks at the moment</p>
                    <p className="text-sm text-muted-foreground mt-1">Check back later for new opportunities</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Active Tasks */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">My Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myTasks.length > 0 ? (
                  myTasks.map((task) => {
                    const statusConfig = getStatusBadge(task.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div 
                        key={task.id}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        onClick={() => handleViewTaskDetails(task.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-slate-900 dark:text-white flex-1">
                            {task.title}
                          </h4>
                          <Badge className={`${statusConfig.className} text-xs ml-2`}>
                            <StatusIcon className="w-3 h-3 mr-1" /> 
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-slate-600 dark:text-slate-400">
                            Client: {task.client?.name || 'Client'}
                          </span>
                          <span className="font-medium text-green-600">
                            ${task.budget}
                          </span>
                        </div>
                        {task.due_date && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No active tasks</p>
                    <p className="text-sm text-muted-foreground mt-1">Apply for tasks to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Section */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Performance This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Completion Rate</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {performance?.completionRate || 0}%
                  </span>
                </div>
                <Progress value={performance?.completionRate || 0} className="h-2" />
                {performance?.completedTasks && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {performance.completedTasks} of {performance.totalTasks} tasks completed
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">On-Time Delivery</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {performance?.onTimeRate || 0}%
                  </span>
                </div>
                <Progress value={performance?.onTimeRate || 0} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Client Satisfaction</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {performance?.satisfactionRate || 0}%
                  </span>
                </div>
                <Progress value={performance?.satisfactionRate || 0} className="h-2" />
                <div className="flex items-center gap-1 mt-1">
                  <ThumbsUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-muted-foreground">
                    Based on {performance?.totalReviews || 0} reviews
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WorkerDashboard;