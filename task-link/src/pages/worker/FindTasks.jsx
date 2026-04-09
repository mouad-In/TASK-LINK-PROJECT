import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';
import { cn } from '@/components/lib/utils';

import {
  fetchTasks,
  setFilters,
  clearFilters,
} from '@/features/tasks/tasksSlice'; // ← adjust path to your slice

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Cleaning', 'Repairs', 'Moving', 'IT Help', 'Gardening', 'Photography', 'Pet Care'];

const SORT_OPTIONS = [
  { label: 'Newest',         value: 'newest' },
  { label: 'Highest Budget', value: 'budget-high' },
  { label: 'Nearest',        value: 'nearest' },
  { label: 'Most Urgent',    value: 'urgent' },
];

const CATEGORY_COLORS = {
  Cleaning:    'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Repairs:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Moving:      'bg-primary/20 text-primary border-primary/30',
  'IT Help':   'bg-secondary/20 text-secondary border-secondary/30',
  Gardening:   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Photography: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  'Pet Care':  'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

// ── Component ──────────────────────────────────────────────────────────────────

const FindTasks = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // ── Redux state ──
  const filteredTasks = useSelector((state) => state.tasks.filteredTasks);
  const allTasks      = useSelector((state) => state.tasks.tasks);
  const isLoading     = useSelector((state) => state.tasks.isLoading);
  const error         = useSelector((state) => state.tasks.error);
  const filters       = useSelector((state) => state.tasks.filters);

  // ── Local UI state ──
  const [viewMode,         setViewMode]         = useState('grid'); // 'grid' | 'list'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy,           setSortBy]           = useState('newest');
  const [showFilters,      setShowFilters]       = useState(false);
  const [savedTasks,       setSavedTasks]       = useState([]);

  // ── Fetch on mount ──
  useEffect(() => {
    dispatch(fetchTasks());
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

  // ── Client-side sort (doesn't touch Redux — purely presentational) ──
  const sorted = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'budget-high') return (b.budgetValue ?? 0) - (a.budgetValue ?? 0);
    if (sortBy === 'nearest')     return parseFloat(a.distance ?? 0) - parseFloat(b.distance ?? 0);
    if (sortBy === 'urgent')      return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
    return 0; // newest — preserve server order
  });

  const urgentCount = allTasks.filter((t) => t.urgent).length;

  const toggleSave = (id) => {
    setSavedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardLayout userType="worker">
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground animate-pulse">Loading tasks…</p>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <DashboardLayout userType="worker">
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <p className="text-destructive font-medium">Failed to load tasks</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => dispatch(fetchTasks())}>
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <DashboardLayout userType="worker">
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Find Tasks</h1>
            <p className="text-muted-foreground text-sm mt-1">Browse available tasks near you and start earning</p>
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
              className="pl-10 bg-muted/50 border-border"
              value={filters.search}
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

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
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

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{sorted.length}</span> tasks
        </p>

        {/* Task Cards */}
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
            : 'space-y-3'
        )}>
          {sorted.map((task) => (
            <Card
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className={cn(
                'border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer group',
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
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(task.id); }}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <Heart className={cn('w-5 h-5', savedTasks.includes(task.id) && 'fill-destructive text-destructive')} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                    {task.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
                    {task.location  && <span className="flex items-center gap-1"><MapPin    className="w-3.5 h-3.5" />{task.location}</span>}
                    {task.distance  && <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{task.distance}</span>}
                    {task.postedAt  && <span className="flex items-center gap-1"><Clock     className="w-3.5 h-3.5" />{task.postedAt}</span>}
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {task.applicationsCount ?? task.proposals ?? 0} proposals
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                        {task.postedBy?.charAt(0) ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{task.postedBy}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-accent fill-accent" />
                          {task.rating} ({task.reviews})
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-foreground">{task.budget}</p>
                    </div>
                  </div>
                </div>

                {/* Apply button */}
                <div className={cn(viewMode === 'list' ? 'shrink-0' : 'mt-4')}>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                    onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}`); }}
                  >
                    <Zap className="w-4 h-4" />
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {sorted.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No tasks found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSelectedCategory('All'); dispatch(clearFilters()); }}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FindTasks;