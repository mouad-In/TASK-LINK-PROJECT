import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Grid3X3,
  List,
  Heart,
  SlidersHorizontal,
  Briefcase,
  TrendingUp,
  Zap,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import { cn } from '@/components/lib/utils';

import {
  fetchPublishedTasks,
  setFilters,
  clearFilters,
} from '@/features/tasks/tasksSlice';

import {
  fetchSavedTasks,
  saveTask,
  unsaveTask,
} from '@/features/tasks/savedTasksSlice';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Cleaning', 'Repairs', 'Moving', 'IT Help', 'Gardening', 'Photography', 'Pet Care'];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Highest Budget', value: 'budget-high' },
  { label: 'Nearest', value: 'nearest' },
  { label: 'Most Urgent', value: 'urgent' },
];

const CATEGORY_COLORS = {
  Cleaning: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Repairs: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Moving: 'bg-primary/20 text-primary border-primary/30',
  'IT Help': 'bg-secondary/20 text-secondary border-secondary/30',
  Gardening: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Photography: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  'Pet Care': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

// ── Component ──────────────────────────────────────────────────────────────────

const FindTasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Redux state ──
  const filteredTasks = useSelector((state) => state.tasks.filteredTasks);
  const allTasks = useSelector((state) => state.tasks.tasks);
  const isLoading = useSelector((state) => state.tasks.isLoading);
  const error = useSelector((state) => state.tasks.error);
  const filters = useSelector((state) => state.tasks.filters);

  // Saved tasks state
  const savedTasks = useSelector((state) => state.savedTasks.items);

  // ── Local UI state ──
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Per-task saving state: Set of taskIds currently being saved/unsaved
  const [pendingTaskIds, setPendingTaskIds] = useState(new Set());

  // ── Fetch on mount ──
  useEffect(() => {
    dispatch(fetchPublishedTasks());
    dispatch(fetchSavedTasks());
    return () => dispatch(clearFilters());
  }, [dispatch]);

  // ── Sync search input → slice filter ──
  const handleSearch = (e) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  // ── Sync category pill → slice filter ──
  const handleCategory = (cat) => {
    setSelectedCategory(cat);
    dispatch(setFilters({ category: cat === 'All' ? '' : cat }));
  };

  // ── Save/Unsave task (per-task loading) ──
  const handleSaveTask = async (e, taskId, isSaved) => {
    e.stopPropagation();

    // Prevent double-click while in flight
    if (pendingTaskIds.has(taskId)) return;

    setPendingTaskIds((prev) => new Set(prev).add(taskId));

    try {
      if (isSaved) {
        await dispatch(unsaveTask(taskId));
      } else {
        await dispatch(saveTask(taskId));
      }
    } finally {
      setPendingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  // Helper function to extract numeric value from budget string
  const getBudgetValue = (budgetStr) => {
    if (!budgetStr) return 0;
    const match = budgetStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Helper function to extract numeric value from distance string
  const getDistanceValue = (distanceStr) => {
    if (!distanceStr) return Infinity;
    const match = distanceStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : Infinity;
  };

  // ── Client-side sort ──
  const sorted = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'budget-high') {
      const aValue = getBudgetValue(a.budget) || (a.budgetValue ?? 0);
      const bValue = getBudgetValue(b.budget) || (b.budgetValue ?? 0);
      return bValue - aValue;
    }
    if (sortBy === 'nearest') {
      const aDist = getDistanceValue(a.distance);
      const bDist = getDistanceValue(b.distance);
      return aDist - bDist;
    }
    if (sortBy === 'urgent') {
      return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
    }
    return 0; // newest — preserve server order
  });

  const urgentCount = allTasks.filter((t) => t.urgent).length;

  // Check if a task is saved
  const isTaskSaved = (taskId) => savedTasks.some((task) => task.id === taskId);

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardLayout userType="worker">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <DashboardLayout userType="worker">
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <div className="text-destructive text-6xl mb-2">⚠️</div>
          <p className="text-destructive font-medium text-lg">Failed to load tasks</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => dispatch(fetchPublishedTasks())} className="mt-2">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <DashboardLayout userType="worker">
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Find Tasks
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Browse available tasks near you and start earning
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/30 text-primary gap-1.5 py-1.5 px-3">
              <Zap className="w-3.5 h-3.5" />
              {urgentCount} urgent
            </Badge>
            <Badge variant="outline" className="border-border text-muted-foreground gap-1.5 py-1.5 px-3">
              <Briefcase className="w-3.5 h-3.5" />
              {allTasks.length} available
            </Badge>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks by title, category, or location..."
              className="pl-10 bg-muted/50 border-border focus:bg-background transition-colors"
              value={filters.search || ''}
              onChange={handleSearch}
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
            <div className="relative">
              <Button variant="outline" className="border-border gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-0 outline-none text-sm cursor-pointer appearance-none pr-4"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Button>
            </div>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-muted/50'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{sorted.length}</span> tasks
          </p>
          {sorted.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategory('All');
                dispatch(clearFilters());
                setSortBy('newest');
              }}
              className="text-xs"
            >
              Clear all filters
            </Button>
          )}
        </div>

        {/* Task Cards */}
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
            : 'space-y-4'
        )}>
          {sorted.map((task) => {
            const isSaved = isTaskSaved(task.id);
            const isPending = pendingTaskIds.has(task.id);

            return (
              <Card
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className={cn(
                  'border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer group overflow-hidden',
                  viewMode === 'list' && 'flex flex-row'
                )}
              >
                <CardContent className={cn('p-5', viewMode === 'list' && 'flex gap-6 items-center w-full')}>
                  <div className={cn('flex-1', viewMode === 'list' && 'min-w-0')}>

                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn('text-xs border', CATEGORY_COLORS[task.category] || 'bg-muted text-muted-foreground')}>
                          {task.category}
                        </Badge>
                        {task.urgent && (
                          <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs animate-pulse">
                            🚨 Urgent
                          </Badge>
                        )}
                      </div>

                      {/* ── Heart button: spins only for THIS task ── */}
                      <button
                        onClick={(e) => handleSaveTask(e, task.id, isSaved)}
                        disabled={isPending}
                        className={cn(
                          'transition-all shrink-0 transform active:scale-95',
                          isPending
                            ? 'opacity-50 cursor-not-allowed'
                            : 'text-muted-foreground hover:text-destructive hover:scale-110'
                        )}
                        aria-label={isSaved ? 'Unsave task' : 'Save task'}
                      >
                        {isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Heart
                            className={cn(
                              'w-5 h-5 transition-all',
                              isSaved && 'fill-destructive text-destructive'
                            )}
                          />
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

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
                      {task.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {task.location}
                        </span>
                      )}
                      {task.distance && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {task.distance}
                        </span>
                      )}
                      {task.postedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {task.postedAt}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {task.applicationsCount ?? task.proposals ?? 0} proposals
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-xs font-semibold shadow-md">
                          {task.postedBy?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{task.postedBy || 'Anonymous'}</p>
                          {task.rating && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {task.rating} ({task.reviews || 0} reviews)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          {task.budget}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Apply button */}
                  <div className={cn(viewMode === 'list' ? 'shrink-0' : 'mt-4')}>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-md hover:shadow-lg transition-all"
                      onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}`); }}
                    >
                      <Zap className="w-4 h-4" />
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {sorted.length === 0 && (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Try adjusting your search or filters to find available tasks
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSelectedCategory('All');
                dispatch(clearFilters());
                setSortBy('newest');
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FindTasks;