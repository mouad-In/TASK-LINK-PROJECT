// MyTasks.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import  DashboardLayout  from '@/layouts/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Search,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Grid3X3,
  List,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock3,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Users,
  Loader2,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { cn } from '@/components/lib/utils';

// Redux actions from existing tasksSlice
import { 
  fetchTasks, 
  updateTask, 
  deleteTask,
  clearError 
} from '@/features/tasks/tasksSlice';
import { addToast } from '@/features/notifications/notificationsSlice';
import { fetchFavoriteTasks, addToFavorites, removeFromFavorites } from '@/features/favorite/favoritesSlice';

const CATEGORIES = ['All', 'Cleaning', 'Repairs', 'Moving', 'IT Help', 'Gardening', 'Photography'];

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Clock3 },
  in_progress: { label: 'In Progress', color: 'bg-primary/20 text-primary border-primary/30', icon: Clock3 },
  assigned: { label: 'Assigned', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Users },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  pending_approval: { label: 'Pending Approval', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock3 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

const CATEGORY_COLORS = {
  Cleaning: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Repairs: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Moving: 'bg-primary/20 text-primary border-primary/30',
  'IT Help': 'bg-secondary/20 text-secondary border-secondary/30',
  Gardening: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Photography: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
};

const MyTasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state selectors
  const { tasks, isLoading, error, pagination } = useSelector((state) => state.tasks);
  const { profile } = useSelector((state) => state.client);
  
  // Local state
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('myTasksViewMode') || 'grid';
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Fetch tasks on component mount and when filters change
  useEffect(() => {
    if (profile?.id) {
      const filters = {
        client_id: profile.id,
        page: currentPage,
        per_page: 12,
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
        sort: sortBy,
      };
      dispatch(fetchTasks(filters));
    }
  }, [dispatch, profile?.id, currentPage, selectedCategory, statusFilter, searchQuery, sortBy]);
  
  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('myTasksViewMode', viewMode);
  }, [viewMode]);
  
  const handleViewTask = (taskId) => {
    navigate(`/client/tasks/${taskId}`);
  };
  
  const handleEditTask = (taskId, e) => {
    e.stopPropagation();
    navigate(`/client/tasks/${taskId}/edit`);
  };
  
  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        dispatch(addToast({
          message: 'Task deleted successfully',
          type: 'success'
        }));
      } catch (err) {
        dispatch(addToast({
          message: 'Failed to delete task',
          type: 'error'
        }));
      }
    }
  };
  
  const handleViewProposals = (taskId, e) => {
    e.stopPropagation();
    navigate(`/client/tasks/${taskId}/proposals`);
  };
  
  const handleMessageWorker = (workerId, e) => {
    e.stopPropagation();
    navigate('/client/messages', { state: { recipientId: workerId } });
  };
  
  const handleRetry = () => {
    dispatch(clearError());
    const filters = {
      client_id: profile?.id,
      page: currentPage,
      per_page: 12,
      ...(selectedCategory !== 'All' && { category: selectedCategory }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(searchQuery && { search: searchQuery }),
    };
    dispatch(fetchTasks(filters));
  };
  
  const getStatusIcon = (status) => {
    const config = STATUS_CONFIG[status];
    if (config) {
      const Icon = config.icon;
      return <Icon className="w-3.5 h-3.5" />;
    }
    return null;
  };
  
  const formatBudget = (task) => {
    if (task.budget_type === 'Fixed Price') {
      return `$${task.budget}`;
    }
    return `$${task.budget}/hr`;
  };
  
  // Calculate stats
  const stats = {
    open: tasks.filter(t => t.status === 'open').length,
    in_progress: tasks.filter(t => t.status === 'in_progress' || t.status === 'assigned').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    total_proposals: tasks.reduce((acc, t) => acc + (t.applicationsCount || 0), 0),
  };
  
  // Loading state
  if (isLoading && tasks.length === 0) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your tasks...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (error && tasks.length === 0) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Error loading tasks: {error}</p>
            <Button onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="client">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your posted tasks and track proposals
            </p>
          </div>
          <Link to="/client/tasks/create">
            <Button className="gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500">
              <Plus className="w-4 h-4" />
              Post New Task
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.open}</p>
                  <p className="text-xs text-muted-foreground">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.in_progress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_proposals}</p>
                  <p className="text-xs text-muted-foreground">Total Proposals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your tasks..."
              className="pl-10 bg-muted/50 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-border gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'newest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('newest')}
            >
              Newest First
            </Button>
            <Button
              variant={sortBy === 'oldest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('oldest')}
            >
              Oldest First
            </Button>
            <Button
              variant={sortBy === 'budget_high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('budget_high')}
            >
              Highest Budget
            </Button>
          </div>
          {isLoading && tasks.length > 0 && (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground'
            )}
          >
            All
          </button>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5',
                statusFilter === status
                  ? config.color
                  : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground'
              )}
            >
              {getStatusIcon(status)}
              {config.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{tasks.length}</span> tasks
          {pagination.total > 0 && ` of ${pagination.total} total`}
        </p>

        {/* Task Cards */}
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'space-y-3'
          )}
        >
          {tasks.map((task) => {
            const statusConfig = STATUS_CONFIG[task.status];
            const StatusIcon = statusConfig?.icon || Clock3;
            const categoryColor = CATEGORY_COLORS[task.category] || 'bg-muted text-muted-foreground';
            
            return (
              <Card
                key={task.id}
                className={cn(
                  'border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer group',
                  viewMode === 'list' && 'flex flex-row'
                )}
                onClick={() => handleViewTask(task.id)}
              >
                <CardContent className={cn('p-5', viewMode === 'list' && 'flex gap-6 items-center w-full')}>
                  <div className={cn('flex-1', viewMode === 'list' && 'min-w-0')}>
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn('text-xs border', categoryColor)}>
                          {task.category}
                        </Badge>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1', statusConfig?.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig?.label}
                        </span>
                        {task.urgency === 'high' && (
                          <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs animate-pulse">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1"
                          onClick={(e) => handleEditTask(task.id, e)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                          onClick={(e) => handleDeleteTask(task.id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                      {task.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {task.fullDescription || task.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {task.location || 'Location not specified'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {task.postedAt ? new Date(task.postedAt).toLocaleDateString() : 'Recently'}
                      </span>
                      {task.assigned_worker && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {task.assigned_worker.name}
                        </span>
                      )}
                      {!task.assigned_worker && task.status === 'open' && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {task.applicationsCount || 0} proposals
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-base font-bold text-foreground">
                          {formatBudget(task)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTask(task.id);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                        {task.status === 'open' && task.applicationsCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1"
                            onClick={(e) => handleViewProposals(task.id, e)}
                          >
                            <Users className="w-3.5 h-3.5" />
                            {task.applicationsCount}
                          </Button>
                        )}
                        {task.status === 'in_progress' && task.assigned_worker && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1"
                            onClick={(e) => handleMessageWorker(task.assigned_worker.id, e)}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Chat
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {tasks.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No tasks found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery || selectedCategory !== 'All' || statusFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "You haven't posted any tasks yet"}
            </p>
            {(searchQuery || selectedCategory !== 'All' || statusFilter !== 'all') ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link to="/client/tasks/create">
                <Button>Post Your First Task</Button>
              </Link>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {pagination.lastPage > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
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
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;