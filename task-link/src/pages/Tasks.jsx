import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  ChevronDown,
  LayoutGrid,
  List,
  Heart,
  Briefcase,
  SlidersHorizontal,
  ArrowUpDown,
  Loader
} from 'lucide-react';
import {
  fetchTasks,
  setFilters,
  clearFilters,
  assignWorker
} from '../features/tasks/tasksSlice';
import { addToast } from '../features/notifications/notificationsSlice';

const categories = ['All', 'Cleaning', 'Repairs', 'Moving', 'IT Help', 'Gardening', 'Photography'];

const categoryConfig = {
  Cleaning:    { color: '#0ea5e9', bg: '#e0f2fe' },
  Repairs:     { color: '#f97316', bg: '#ffedd5' },
  Moving:      { color: '#6366f1', bg: '#e0e7ff' },
  'IT Help':   { color: '#8b5cf6', bg: '#ede9fe' },
  Gardening:   { color: '#22c55e', bg: '#dcfce7' },
  Photography: { color: '#ec4899', bg: '#fce7f3' },
};

const avatarColors = [
  '#0ea5e9', '#6366f1', '#f97316', '#22c55e', '#ec4899', '#8b5cf6'
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'budget_high', label: 'Budget: High to Low' },
  { value: 'budget_low', label: 'Budget: Low to High' },
  { value: 'distance', label: 'Distance: Nearest First' },
];

const Tasks = () => {
  const dispatch = useDispatch();
  const { tasks, filteredTasks, isLoading, error, filters, pagination } = useSelector((state) => state.tasks);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('taskViewMode') || 'grid';
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteTasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [minBudget, setMinBudget] = useState(filters.minBudget || '');
  const [maxBudget, setMaxBudget] = useState(filters.maxBudget || '');
  const [urgency, setUrgency] = useState(filters.urgency || '');
  const [applyingFor, setApplyingFor] = useState(null);

  // Load tasks on mount
  useEffect(() => {
    dispatch(fetchTasks({
      page: pagination.currentPage,
      category: filters.category,
      search: filters.search,
    }));
  }, [dispatch, pagination.currentPage, filters.category, filters.search]);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem('taskViewMode', viewMode);
  }, [viewMode]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteTasks', JSON.stringify(favorites));
  }, [favorites]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        dispatch(setFilters({ search: localSearch }));
        dispatch(fetchTasks({ search: localSearch, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch, filters.search]);

  const toggleFavorite = (taskId) => {
    setFavorites(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
    dispatch(addToast({
      message: favorites.includes(taskId) ? 'Removed from favorites' : 'Added to favorites',
      type: 'info'
    }));
  };

  const handleCategoryChange = (category) => {
    const newCategory = category === 'All' ? '' : category;
    setSelectedCategory(category);
    dispatch(setFilters({ category: newCategory }));
    dispatch(fetchTasks({ category: newCategory, page: 1 }));
  };

  const handleApplyFilters = () => {
    const filterParams = {
      minBudget: minBudget || '',
      maxBudget: maxBudget || '',
      urgency: urgency || '',
    };
    dispatch(setFilters(filterParams));
    dispatch(fetchTasks({ ...filterParams, page: 1 }));
    setShowFilters(false);
    dispatch(addToast({ message: 'Filters applied', type: 'success' }));
  };

  const handleClearFilters = () => {
    setMinBudget('');
    setMaxBudget('');
    setUrgency('');
    setSelectedCategory('All');
    setLocalSearch('');
    dispatch(clearFilters());
    dispatch(fetchTasks({ page: 1 }));
    dispatch(addToast({ message: 'Filters cleared', type: 'info' }));
  };

  const handleApply = async (taskId) => {
    if (!isAuthenticated) {
      dispatch(addToast({ message: 'Please login to apply for tasks', type: 'error' }));
      return;
    }
    
    setApplyingFor(taskId);
    try {
      await dispatch(assignWorker({ taskId, workerId: user?.id })).unwrap();
      dispatch(addToast({ message: 'Application submitted successfully!', type: 'success' }));
    } catch (error) {
      dispatch(addToast({ message: error || 'Failed to apply for task', type: 'error' }));
    } finally {
      setApplyingFor(null);
    }
  };

  const getSortedTasks = () => {
    const tasksToSort = filteredTasks.length > 0 ? filteredTasks : tasks;
    
    switch(sortBy) {
      case 'newest':
        return [...tasksToSort].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
      case 'oldest':
        return [...tasksToSort].sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt));
      case 'budget_high':
        return [...tasksToSort].sort((a, b) => b.budget - a.budget);
      case 'budget_low':
        return [...tasksToSort].sort((a, b) => a.budget - b.budget);
      case 'distance':
        return [...tasksToSort].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      default:
        return tasksToSort;
    }
  };

  const displayTasks = getSortedTasks();

  if (isLoading && tasks.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <Loader className="animate-spin" style={styles.spinner} />
        <p style={styles.loadingText}>Loading tasks...</p>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
        <button onClick={() => dispatch(fetchTasks())} style={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Top Navigation */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          {/* Logo */}
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}>
              <Briefcase style={styles.logoIconSvg} />
            </div>
            <span style={styles.logoText}>TaskBoard</span>
          </Link>

          {/* Search */}
          <div style={styles.searchContainer}>
            <Search style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Search tasks by title or location..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={styles.headerActions}>
            <button 
              style={styles.filterButton}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal style={styles.filterButtonIcon} />
              Filters
            </button>
            <Link to="/client/tasks/new" style={styles.postButton}>
              Post a task
            </Link>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <div style={styles.filterPanel}>
          <div style={styles.filterPanelContent}>
            <h3 style={styles.filterTitle}>Filter Tasks</h3>
            <div style={styles.filterGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Min Budget ($)</label>
                <input
                  type="number"
                  style={styles.filterInput}
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  placeholder="Min"
                />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Max Budget ($)</label>
                <input
                  type="number"
                  style={styles.filterInput}
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="Max"
                />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Urgency</label>
                <select
                  style={styles.filterSelect}
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="urgent">Urgent</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>
            <div style={styles.filterActions}>
              <button onClick={handleClearFilters} style={styles.clearFilterButton}>
                Clear All
              </button>
              <button onClick={handleApplyFilters} style={styles.applyFilterButton}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={styles.main}>
        {/* Toolbar */}
        <div style={styles.toolbar}>
          {/* Categories */}
          <div style={styles.categoriesContainer}>
            {categories.map(cat => (
              <button
                key={cat}
                style={{
                  ...styles.categoryButton,
                  ...(selectedCategory === cat ? styles.categoryButtonActive : {})
                }}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div style={styles.rightControls}>
            <div style={styles.sortContainer}>
              <select
                style={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div style={styles.viewToggle}>
              <button
                style={{
                  ...styles.viewButton,
                  ...(viewMode === 'grid' ? styles.viewButtonActive : {})
                }}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid style={styles.viewButtonIcon} />
              </button>
              <button
                style={{
                  ...styles.viewButton,
                  ...(viewMode === 'list' ? styles.viewButtonActive : {})
                }}
                onClick={() => setViewMode('list')}
              >
                <List style={styles.viewButtonIcon} />
              </button>
            </div>
          </div>
        </div>

        {/* Count */}
        <p style={styles.countText}>
          <strong style={styles.countStrong}>{displayTasks.length}</strong> tasks available
          {isLoading && <span style={styles.loadingBadge}> (loading...)</span>}
        </p>

        {/* Loading Overlay for pagination */}
        {isLoading && tasks.length > 0 && (
          <div style={styles.loadingOverlay}>
            <Loader className="animate-spin" style={styles.loadingOverlayIcon} />
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div style={styles.gridContainer}>
            {displayTasks.map((task, i) => {
              const cfg = categoryConfig[task.category] || { color: '#6b7280', bg: '#f3f4f6' };
              const isFav = favorites.includes(task.id);
              const isApplying = applyingFor === task.id;
              
              return (
                <div key={task.id} style={styles.gridCard}>
                  {/* Top row */}
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTags}>
                      <span style={{ ...styles.categoryPill, color: cfg.color, background: cfg.bg }}>
                        {task.category}
                      </span>
                      {task.urgency === 'urgent' && (
                        <span style={styles.urgentPill}>
                          <span style={styles.urgentDot} />
                          Urgent
                        </span>
                      )}
                    </div>
                    <button 
                      style={{ ...styles.favButton, color: isFav ? '#ef4444' : '#d1d5db' }}
                      onClick={() => toggleFavorite(task.id)}
                    >
                      <Heart style={{ width: 17, height: 17, fill: isFav ? '#ef4444' : 'none' }} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 style={styles.cardTitle}>{task.title}</h3>

                  {/* Description */}
                  <p style={styles.cardDescription}>{task.fullDescription || task.description}</p>

                  {/* Meta */}
                  <div style={styles.cardMeta}>
                    <span style={styles.metaTag}>
                      <MapPin style={styles.metaIcon} />
                      {task.location}
                    </span>
                    <div style={styles.divider} />
                    <span style={styles.metaTag}>
                      <Clock style={styles.metaIcon} />
                      {task.postedAt}
                    </span>
                  </div>

                  {/* Footer */}
                  <div style={styles.cardFooter}>
                    <div style={styles.userInfo}>
                      <div style={{ ...styles.avatar, background: avatarColors[i % avatarColors.length] }}>
                        {task.client?.initials || 'JD'}
                      </div>
                      <div>
                        <p style={styles.userName}>{task.client?.name || 'Client'}</p>
                        <div style={styles.stars}>
                          <Star style={styles.starIcon} />
                          <span style={styles.rating}>{task.client?.rating || 4.5} <span style={styles.reviewCount}>({task.client?.reviews || 0})</span></span>
                        </div>
                      </div>
                    </div>
                    <div style={styles.budgetInfo}>
                      <p style={styles.budgetText}>${task.budget}</p>
                      <p style={styles.distanceText}>{task.distance || 'Near you'}</p>
                    </div>
                  </div>

                  <button
                    style={styles.applyButton}
                    onClick={() => handleApply(task.id)}
                    disabled={isApplying}
                  >
                    {isApplying ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div style={styles.listContainer}>
            {displayTasks.map((task, i) => {
              const cfg = categoryConfig[task.category] || { color: '#6b7280', bg: '#f3f4f6' };
              const isFav = favorites.includes(task.id);
              const isApplying = applyingFor === task.id;
              
              return (
                <div key={task.id} style={styles.listCard}>
                  {/* Avatar */}
                  <div style={{ ...styles.listAvatar, background: avatarColors[i % avatarColors.length] }}>
                    {task.client?.initials || 'JD'}
                  </div>

                  {/* Main content */}
                  <div style={styles.listContent}>
                    <div style={styles.listHeader}>
                      <div style={styles.listInfo}>
                        <div style={styles.listTags}>
                          <span style={{ ...styles.categoryPill, color: cfg.color, background: cfg.bg }}>
                            {task.category}
                          </span>
                          {task.urgency === 'urgent' && (
                            <span style={styles.urgentPill}>
                              <span style={styles.urgentDot} />
                              Urgent
                            </span>
                          )}
                        </div>
                        <h3 style={styles.listTitle}>{task.title}</h3>
                        <p style={styles.listDescription}>{task.fullDescription || task.description}</p>
                        <div style={styles.listMeta}>
                          <span style={styles.metaTag}>
                            <MapPin style={styles.metaIcon} />
                            {task.location} · {task.distance || 'Near you'}
                          </span>
                          <div style={styles.divider} />
                          <span style={styles.metaTag}>
                            <Clock style={styles.metaIcon} />
                            {task.postedAt}
                          </span>
                          <div style={styles.divider} />
                          <div style={styles.stars}>
                            <Star style={styles.starIcon} />
                            <span style={styles.rating}>{task.client?.rating || 4.5} ({task.client?.reviews || 0})</span>
                          </div>
                        </div>
                      </div>

                      {/* Right side */}
                      <div style={styles.listActions}>
                        <button 
                          style={{ ...styles.favButton, color: isFav ? '#ef4444' : '#d1d5db' }}
                          onClick={() => toggleFavorite(task.id)}
                        >
                          <Heart style={{ width: 16, height: 16, fill: isFav ? '#ef4444' : 'none' }} />
                        </button>
                        <p style={styles.listBudget}>${task.budget}</p>
                        <button
                          style={styles.listApplyButton}
                          onClick={() => handleApply(task.id)}
                          disabled={isApplying}
                        >
                          {isApplying ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.lastPage > 1 && (
          <div style={styles.pagination}>
            <button
              style={{
                ...styles.paginationButton,
                ...(pagination.currentPage === 1 && styles.paginationButtonDisabled)
              }}
              onClick={() => dispatch(fetchTasks({ page: pagination.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </button>
            <span style={styles.paginationInfo}>
              Page {pagination.currentPage} of {pagination.lastPage}
            </span>
            <button
              style={{
                ...styles.paginationButton,
                ...(pagination.currentPage === pagination.lastPage && styles.paginationButtonDisabled)
              }}
              onClick={() => dispatch(fetchTasks({ page: pagination.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.lastPage}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// Styles object
const styles = {
  container: {
    fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8f9fb',
    color: '#111827',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fb',
  },
  spinner: {
    width: 48,
    height: 48,
    color: '#6366f1',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fb',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 16,
  },
  retryButton: {
    padding: '8px 16px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 30,
  },
  headerContent: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  },
  logoIcon: {
    width: 32,
    height: 32,
    background: '#111827',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconSvg: {
    width: 16,
    height: 16,
    color: '#fff',
  },
  logoText: {
    fontSize: 17,
    fontWeight: 700,
    color: '#111827',
    letterSpacing: '-0.02em',
  },
  searchContainer: {
    flex: 1,
    maxWidth: 480,
    margin: '0 32px',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 16,
    height: 16,
    color: '#9ca3af',
  },
  searchInput: {
    width: '100%',
    height: 44,
    padding: '0 16px 0 44px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'inherit',
    background: '#fff',
    color: '#111827',
    outline: 'none',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  filterButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 16px',
    height: 44,
    background: '#fff',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  filterButtonIcon: {
    width: 15,
    height: 15,
  },
  postButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 20px',
    height: 44,
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  },
  filterPanel: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    zIndex: 29,
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  filterPanelContent: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
    color: '#111827',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 20,
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#6b7280',
  },
  filterInput: {
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 14,
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 14,
    background: '#fff',
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
  },
  clearFilterButton: {
    padding: '8px 16px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
  applyFilterButton: {
    padding: '8px 16px',
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
  main: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '32px 24px',
    position: 'relative',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
    flexWrap: 'wrap',
  },
  categoriesContainer: {
    display: 'flex',
    gap: 6,
    overflowX: 'auto',
    flexWrap: 'wrap',
  },
  categoryButton: {
    padding: '7px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    color: '#6b7280',
  },
  categoryButtonActive: {
    background: '#111827',
    color: '#fff',
    borderColor: '#111827',
  },
  rightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  sortContainer: {
    position: 'relative',
  },
  sortSelect: {
    padding: '0 16px',
    height: 44,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  viewToggle: {
    display: 'flex',
    gap: 4,
  },
  viewButton: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    background: '#fff',
    cursor: 'pointer',
    color: '#6b7280',
  },
  viewButtonActive: {
    background: '#111827',
    color: '#fff',
    borderColor: '#111827',
  },
  viewButtonIcon: {
    width: 15,
    height: 15,
  },
  countText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
  },
  countStrong: {
    color: '#111827',
  },
  loadingBadge: {
    fontSize: 12,
    color: '#6366f1',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingOverlayIcon: {
    width: 32,
    height: 32,
    color: '#6366f1',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 20,
  },
  gridCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 24,
    transition: 'all 0.2s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTags: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  categoryPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  urgentPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  urgentDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#dc2626',
    display: 'inline-block',
  },
  favButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 8,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  cardDescription: {
    fontSize: 13.5,
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: 16,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  metaTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12.5,
    color: '#6b7280',
  },
  metaIcon: {
    width: 13,
    height: 13,
  },
  divider: {
    width: 1,
    height: 16,
    background: '#e5e7eb',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTop: '1px solid #f3f4f6',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#111827',
  },
  stars: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  starIcon: {
    width: 11,
    height: 11,
    color: '#f59e0b',
    fill: '#f59e0b',
  },
  rating: {
    fontSize: 12,
    color: '#6b7280',
  },
  reviewCount: {
    color: '#9ca3af',
  },
  budgetInfo: {
    textAlign: 'right',
  },
  budgetText: {
    fontSize: 17,
    fontWeight: 700,
    color: '#111827',
    fontFamily: "'DM Serif Display', serif",
  },
  distanceText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  applyButton: {
    width: '100%',
    marginTop: 16,
    padding: '10px',
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  listCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 20,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 24,
  },
  listAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
    marginTop: 2,
  },
  listContent: {
    flex: 1,
    minWidth: 0,
  },
  listHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  listInfo: {
    flex: 1,
    minWidth: 0,
  },
  listTags: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  listTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 4,
    letterSpacing: '-0.01em',
  },
  listDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.5,
    marginBottom: 10,
  },
  listMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  listActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
    flexShrink: 0,
  },
  listBudget: {
    fontSize: 17,
    fontWeight: 700,
    color: '#111827',
    fontFamily: "'DM Serif Display', serif",
  },
  listApplyButton: {
    padding: '8px 16px',
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    height: 36,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 32,
    paddingTop: 24,
    borderTop: '1px solid #e5e7eb',
  },
  paginationButton: {
    padding: '8px 16px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
};

export default Tasks;