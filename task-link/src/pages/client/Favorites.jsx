// Favorites.jsx - Task Favorites Only
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Search,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Grid3X3,
  List,
  Heart,
  SlidersHorizontal,
  Eye,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3,
  Users,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/components/lib/utils';

// Redux actions
import { fetchFavoriteTasks, removeFromFavorites } from '@/features/favorite/favoritesSlice';
import { addToast } from '@/features/notifications/notificationsSlice';

const CATEGORIES = ['All', 'Cleaning', 'Repairs', 'Moving', 'IT Help', 'Gardening', 'Photography'];

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Clock3 },
  in_progress: { label: 'In Progress', color: 'bg-primary/20 text-primary border-primary/30', icon: Clock3 },
  assigned: { label: 'Assigned', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Users },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  pending_approval: { label: 'Pending Approval', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock3 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
  published: { label: 'Published', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Clock3 },
};

const CATEGORY_COLORS = {
  Cleaning: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Repairs: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Moving: 'bg-primary/20 text-primary border-primary/30',
  'IT Help': 'bg-secondary/20 text-secondary border-secondary/30',
  Gardening: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Photography: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
};

const Favorites = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state selectors
  const { favoriteTasks = [], isLoading, error } = useSelector((state) => state.taskFavorites ?? {});
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // Local state
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('taskFavoritesViewMode') || 'grid';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    minBudget: 0,
    maxBudget: 10000,
    urgentOnly: false,
  });
  const [pendingRemovalIds, setPendingRemovalIds] = useState(new Set());
  
  // Fetch favorite tasks on component mount
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchFavoriteTasks(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);
  
  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('taskFavoritesViewMode', viewMode);
  }, [viewMode]);
  
  // Filter favorite tasks based on search, category, status, and filters
  const filteredFavorites = favoriteTasks.filter((task) => {
    // Search filter
    const matchesSearch = !searchQuery ||
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'All' || 
      task.category === selectedCategory;
    
    // Status filter
    const matchesStatus = selectedStatus === 'all' || 
      task.status === selectedStatus;
    
    // Budget filter
    const taskBudget = task.budget || 0;
    const matchesBudget = taskBudget >= filterOptions.minBudget && 
                         taskBudget <= filterOptions.maxBudget;
    
    // Urgent filter
    const matchesUrgent = !filterOptions.urgentOnly || task.urgency === 'high';
    
    return matchesSearch && matchesCategory && matchesStatus && matchesBudget && matchesUrgent;
  });
  
  const handleRemoveFromFavorites = async (taskId) => {
    if (pendingRemovalIds.has(taskId)) return;
    
    setPendingRemovalIds(prev => new Set(prev).add(taskId));
    try {
      await dispatch(removeFromFavorites({ 
        clientId: currentUser?.id, 
        taskId 
      })).unwrap();
      dispatch(addToast({
        message: 'Task removed from favorites',
        type: 'success'
      }));
    } catch (err) {
      dispatch(addToast({
        message: 'Failed to remove from favorites',
        type: 'error'
      }));
    } finally {
      setPendingRemovalIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };
  
  const handleViewTask = (taskId) => {
    navigate(`/client/tasks/${taskId}`);
  };
  
  const handleViewProposals = (taskId) => {
    navigate(`/client/tasks/${taskId}/proposals`);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('all');
    setFilterOptions({
      minBudget: 0,
      maxBudget: 10000,
      urgentOnly: false,
    });
  };
  
  const formatBudget = (task) => {
    if (task.budget_type === 'Fixed Price') {
      return `$${task.budget}`;
    }
    return `$${task.budget}/hr`;
  };
  
  // Loading state
  if (isLoading && favoriteTasks.length === 0) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your favorite tasks...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (error && favoriteTasks.length === 0) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Error loading favorites: {error}</p>
            <Button onClick={() => dispatch(fetchFavoriteTasks(currentUser?.id))}>
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
            <h1 className="text-2xl font-bold text-foreground">Favorite Tasks</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tasks you've saved for later reference
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary gap-1.5 py-1.5 px-3">
            <Heart className="w-3.5 h-3.5 fill-primary" />
            {favoriteTasks.length} saved tasks
          </Badge>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search favorite tasks by title, description, or category..."
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
              {(filterOptions.minBudget > 0 || filterOptions.urgentOnly) && (
                <Badge variant="secondary" className="ml-1">Active</Badge>
              )}
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
        
        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-4 border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filter Options</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Min Budget ($)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 rounded-lg border border-border bg-background"
                    value={filterOptions.minBudget}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions,
                      minBudget: parseInt(e.target.value) || 0
                    })}
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Max Budget ($)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 rounded-lg border border-border bg-background"
                    value={filterOptions.maxBudget}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions,
                      maxBudget: parseInt(e.target.value) || 10000
                    })}
                    min="0"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterOptions.urgentOnly}
                      onChange={(e) => setFilterOptions({
                        ...filterOptions,
                        urgentOnly: e.target.checked
                      })}
                      className="rounded border-border"
                    />
                    <span className="text-sm">Urgent Tasks Only</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        )}

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

        {/* Status Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedStatus('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              selectedStatus === 'all' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-transparent text-muted-foreground border-border'
            )}
          >
            All Status
          </button>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status === selectedStatus ? 'all' : status)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5',
                  selectedStatus === status ? config.color : 'bg-transparent text-muted-foreground border-border'
                )}
              >
                <Icon className="w-3 h-3" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredFavorites.length}</span> favorite tasks
        </p>

        {/* Favorites Grid/List */}
        {isLoading && favoriteTasks.length > 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredFavorites.map((task) => {
              const statusConfig = STATUS_CONFIG[task.status];
              const StatusIcon = statusConfig?.icon || Clock3;
              const categoryColor = CATEGORY_COLORS[task.category] || 'bg-muted text-muted-foreground';
              const isPendingRemoval = pendingRemovalIds.has(task.id);
              
              return (
                <Card
                  key={task.id}
                  className="border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer group"
                  onClick={() => handleViewTask(task.id)}
                >
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn('text-xs border', categoryColor)}>
                          {task.category}
                        </Badge>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1', statusConfig?.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig?.label ?? task.status}
                        </span>
                        {task.urgency === 'high' && (
                          <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs animate-pulse">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromFavorites(task.id);
                        }}
                        disabled={isPendingRemoval}
                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        {isPendingRemoval ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                      {task.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {task.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {task.location || 'Location not specified'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {task.applicationsCount || 0} proposals
                      </span>
                    </div>

                    {/* Budget */}
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
                        {task.status === 'open' && (
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProposals(task.id);
                            }}
                          >
                            View Proposals
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFavorites.map((task) => {
              const statusConfig = STATUS_CONFIG[task.status];
              const StatusIcon = statusConfig?.icon || Clock3;
              const isPendingRemoval = pendingRemovalIds.has(task.id);
              
              return (
                <Card
                  key={task.id}
                  className="border-border hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => handleViewTask(task.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Task Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      
                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {task.title}
                          </h3>
                          {task.urgency === 'high' && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <Badge className={cn('text-xs', CATEGORY_COLORS[task.category] || 'bg-muted')}>
                            {task.category}
                          </Badge>
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1', statusConfig?.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig?.label ?? task.status}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {task.location || 'Location not specified'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                      
                      {/* Budget */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-lg font-bold text-foreground">
                          {formatBudget(task)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {task.applicationsCount || 0} proposals
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleViewTask(task.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {task.status === 'open' && (
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleViewProposals(task.id)}
                          >
                            Proposals
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveFromFavorites(task.id)}
                          disabled={isPendingRemoval}
                        >
                          {isPendingRemoval ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredFavorites.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No favorite tasks found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'all' || filterOptions.minBudget > 0 || filterOptions.urgentOnly
                ? "Try adjusting your search or filters"
                : "Start saving tasks you're interested in to see them here"}
            </p>
            {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'all' || filterOptions.minBudget > 0 || filterOptions.urgentOnly) && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            {!searchQuery && selectedCategory === 'All' && selectedStatus === 'all' && !filterOptions.minBudget && !filterOptions.urgentOnly && favoriteTasks.length === 0 && (
              <Button 
                className="mt-4 gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600"
                onClick={() => navigate('/client/tasks/browse')}
              >
                Browse Available Tasks
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Favorites;