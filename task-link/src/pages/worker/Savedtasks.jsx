import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import {
  MapPin,
  Star,
  Clock,
  Grid3X3,
  List,
  Heart,
  Briefcase,
  TrendingUp,
  Zap,
  BookmarkX,
  Loader2,
} from 'lucide-react';
import { cn } from '@/components/lib/utils';
import {
  fetchSavedTasks,
  unsaveTask,
} from '@/features/tasks/savedTasksSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

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

const SavedTasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: savedTasks = [], isLoading, error } = useSelector(
    (state) => state.savedTasks ?? {}
  );

  const [viewMode, setViewMode] = useState('grid');

  // Per-task pending state: Set of taskIds currently being removed
  const [pendingTaskIds, setPendingTaskIds] = useState(new Set());

  useEffect(() => {
    dispatch(fetchSavedTasks());
  }, [dispatch]);

  const handleUnsave = async (e, taskId) => {
    e.stopPropagation();

    // Prevent double-click while in flight
    if (pendingTaskIds.has(taskId)) return;

    setPendingTaskIds((prev) => new Set(prev).add(taskId));

    try {
      await dispatch(unsaveTask(taskId)).unwrap();
      // On success the item is removed from Redux state — no local cleanup needed
    } catch {
      // Revert pending on failure so the button becomes usable again
    } finally {
      setPendingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardLayout userType="worker">
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground animate-pulse">Loading saved tasks…</p>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <DashboardLayout userType="worker">
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <p className="text-destructive font-medium">Failed to load saved tasks</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => dispatch(fetchSavedTasks())}>
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
            <h1 className="text-2xl font-bold text-foreground">Saved Tasks</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tasks you bookmarked — apply before they're gone
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-border text-muted-foreground gap-1.5 py-1.5 px-3">
              <Heart className="w-3.5 h-3.5 fill-destructive text-destructive" />
              {savedTasks.length} saved
            </Badge>
            {/* View toggle */}
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

        {/* Task Cards */}
        {savedTasks.length > 0 ? (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'space-y-3'
            )}
          >
            {savedTasks.map((task) => {
              const isPending = pendingTaskIds.has(task.id);

              return (
                <Card
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className={cn(
                    'border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer group',
                    isPending && 'opacity-50 pointer-events-none',
                    viewMode === 'list' && 'flex flex-row'
                  )}
                >
                  <CardContent className={cn('p-5', viewMode === 'list' && 'flex gap-6 items-center w-full')}>
                    <div className={cn('flex-1', viewMode === 'list' && 'min-w-0')}>

                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={cn(
                              'text-xs border',
                              CATEGORY_COLORS[task.category] || 'bg-muted text-muted-foreground'
                            )}
                          >
                            {task.category}
                          </Badge>
                          {task.urgent && (
                            <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs animate-pulse">
                              Urgent
                            </Badge>
                          )}
                        </div>

                        {/* Unsave button — spins only for THIS task */}
                        <button
                          onClick={(e) => handleUnsave(e, task.id)}
                          disabled={isPending}
                          className={cn(
                            'shrink-0 transition-all',
                            isPending
                              ? 'opacity-50 cursor-not-allowed'
                              : 'text-destructive hover:text-destructive/70 hover:scale-110 active:scale-95'
                          )}
                          aria-label="Remove from saved"
                          title="Remove from saved"
                        >
                          {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin text-destructive" />
                          ) : (
                            <Heart className="w-5 h-5 fill-destructive" />
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
                        {task.location  && <span className="flex items-center gap-1"><MapPin     className="w-3.5 h-3.5" />{task.location}</span>}
                        {task.distance  && <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{task.distance}</span>}
                        {task.postedAt  && <span className="flex items-center gap-1"><Clock      className="w-3.5 h-3.5" />{task.postedAt}</span>}
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
                            {task.rating && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="w-3 h-3 text-accent fill-accent" />
                                {task.rating} ({task.reviews})
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-foreground">{task.budget}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={cn('flex gap-2', viewMode === 'list' ? 'shrink-0 flex-col' : 'mt-4')}>
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                        onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}`); }}
                      >
                        <Zap className="w-4 h-4" />
                        Apply Now
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isPending}
                        className={cn(
                          'w-full border-border gap-2',
                          isPending
                            ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                            : 'text-muted-foreground hover:text-destructive hover:border-destructive/40'
                        )}
                        onClick={(e) => handleUnsave(e, task.id)}
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <BookmarkX className="w-4 h-4" />
                        )}
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No saved tasks</h3>
            <p className="text-muted-foreground text-sm">
              Browse tasks and tap the heart icon to save them here
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/tasks')}
            >
              Browse Tasks
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedTasks;