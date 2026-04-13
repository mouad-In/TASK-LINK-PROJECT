// Favorites.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import  DashboardLayout  from '@/layouts/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Star,
  MapPin,
  Clock,
  Briefcase,
  Grid3X3,
  List,
  Heart,
  Filter,
  SlidersHorizontal,
  X,
  MessageSquare,
  UserCheck,
  Loader2,
  Trash2,
  Eye,
} from 'lucide-react';
import { cn } from '@/components/lib/utils';

// Redux actions
import { fetchFavoriteWorkers, removeFromFavorites } from '@/features/favorite/favoritesSlice';
import { fetchTasks, createTask } from '@/features/tasks/tasksSlice';
import { addToast } from '@/features/notifications/notificationsSlice';

const CATEGORIES = ['All', 'Cleaning', 'Repairs', 'IT Help', 'Design', 'Moving', 'Gardening'];

const Favorites = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state selectors
  const { favorites, isLoading, error } = useSelector((state) => state.favorites);
  const { profile } = useSelector((state) => state.client);
  const { isLoading: tasksLoading } = useSelector((state) => state.tasks);
  
  // Local state
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('favoritesViewMode') || 'grid';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    minRating: 0,
    maxHourlyRate: 200,
    verifiedOnly: false,
  });
  
  // Fetch favorites on component mount
  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchFavoriteWorkers(profile.id));
    }
  }, [dispatch, profile?.id]);
  
  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('favoritesViewMode', viewMode);
  }, [viewMode]);
  
  // Filter favorites based on search, category, and filters
  const filteredFavorites = favorites.filter((worker) => {
    // Search filter
    const matchesSearch = !searchQuery ||
      worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = selectedCategory === 'All' || 
      worker.category === selectedCategory;
    
    // Rating filter
    const matchesRating = worker.rating >= filterOptions.minRating;
    
    // Hourly rate filter
    const matchesRate = (worker.hourlyRate || worker.rate) <= filterOptions.maxHourlyRate;
    
    // Verified filter
    const matchesVerified = !filterOptions.verifiedOnly || worker.verified;
    
    return matchesSearch && matchesCategory && matchesRating && matchesRate && matchesVerified;
  });
  
  const handleRemoveFromFavorites = async (workerId) => {
    try {
      await dispatch(removeFromFavorites({ clientId: profile?.id, workerId })).unwrap();
      dispatch(addToast({
        message: 'Worker removed from favorites',
        type: 'success'
      }));
    } catch (err) {
      dispatch(addToast({
        message: 'Failed to remove from favorites',
        type: 'error'
      }));
    }
  };
  
  const handleHireWorker = (worker) => {
    // Navigate to create task with worker pre-selected
    navigate('/client/tasks/create', {
      state: { preferredWorker: worker }
    });
  };
  
  const handleMessageWorker = (worker) => {
    navigate('/client/messages', {
      state: { recipient: worker }
    });
  };
  
  const handleViewProfile = (worker) => {
    navigate(`/client/workers/${worker.id}`);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setFilterOptions({
      minRating: 0,
      maxHourlyRate: 200,
      verifiedOnly: false,
    });
  };
  
  // Loading state
  if (isLoading && favorites.length === 0) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your favorites...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (error && favorites.length === 0) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Error loading favorites: {error}</p>
            <Button onClick={() => dispatch(fetchFavoriteWorkers(profile?.id))}>
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
            <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Workers you've saved for quick access
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary gap-1.5 py-1.5 px-3">
            <Heart className="w-3.5 h-3.5 fill-primary" />
            {favorites.length} saved
          </Badge>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search favorites by name, role, or skill..."
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
              {(filterOptions.minRating > 0 || filterOptions.verifiedOnly) && (
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
                    Minimum Rating
                  </label>
                  <select
                    className="w-full p-2 rounded-lg border border-border bg-background"
                    value={filterOptions.minRating}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions,
                      minRating: parseFloat(e.target.value)
                    })}
                  >
                    <option value="0">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Max Hourly Rate
                  </label>
                  <select
                    className="w-full p-2 rounded-lg border border-border bg-background"
                    value={filterOptions.maxHourlyRate}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions,
                      maxHourlyRate: parseInt(e.target.value)
                    })}
                  >
                    <option value="50">$50 or less</option>
                    <option value="100">$100 or less</option>
                    <option value="150">$150 or less</option>
                    <option value="200">$200 or less</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterOptions.verifiedOnly}
                      onChange={(e) => setFilterOptions({
                        ...filterOptions,
                        verifiedOnly: e.target.checked
                      })}
                      className="rounded border-border"
                    />
                    <span className="text-sm">Verified Workers Only</span>
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

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredFavorites.length}</span> favorites
        </p>

        {/* Favorites Grid/List */}
        {isLoading && favorites.length > 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredFavorites.map((worker) => (
              <Card
                key={worker.id}
                className="border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group"
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14 cursor-pointer" onClick={() => handleViewProfile(worker)}>
                        <AvatarImage src={worker.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-semibold">
                          {worker.initials || worker.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-foreground">{worker.name}</h3>
                          {worker.verified && (
                            <UserCheck className="w-4 h-4 text-primary fill-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{worker.role}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveFromFavorites(worker.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium">{worker.rating}</span>
                      <span className="text-muted-foreground">({worker.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span>{worker.completedTasks} tasks</span>
                    </div>
                  </div>

                  {/* Location & Rate */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{worker.location}</span>
                      <span>·</span>
                      <span>{worker.distance}</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      ${worker.hourlyRate || worker.rate}/hr
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {worker.skills?.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {worker.skills?.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{worker.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Response Time */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Response time: {worker.responseTime || '< 1 hour'}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => handleMessageWorker(worker)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Button>
                    <Button 
                      className="flex-1 gap-2"
                      onClick={() => handleHireWorker(worker)}
                      disabled={tasksLoading}
                    >
                      <Briefcase className="w-4 h-4" />
                      Hire
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFavorites.map((worker) => (
              <Card
                key={worker.id}
                className="border-border hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => handleViewProfile(worker)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={worker.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                        {worker.initials || worker.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-foreground">{worker.name}</h3>
                        {worker.verified && <UserCheck className="w-4 h-4 text-primary fill-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{worker.role}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {worker.location}
                        </span>
                        <span>•</span>
                        <span>{worker.distance}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>{worker.rating}</span>
                      </div>
                      <span className="text-muted-foreground">{worker.completedTasks} tasks</span>
                      <span className="font-bold">${worker.hourlyRate || worker.rate}/hr</span>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleMessageWorker(worker)}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleHireWorker(worker)}
                        disabled={tasksLoading}
                      >
                        <Briefcase className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveFromFavorites(worker.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredFavorites.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No favorites found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || selectedCategory !== 'All' || filterOptions.minRating > 0
                ? "Try adjusting your search or filters"
                : "Start saving workers you like to see them here"}
            </p>
            {(searchQuery || selectedCategory !== 'All' || filterOptions.minRating > 0) && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Favorites;