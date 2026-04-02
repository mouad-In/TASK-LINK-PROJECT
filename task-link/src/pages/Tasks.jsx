import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Edit2 as Edit,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { fetchTasks, setFilters, deleteTask } from '../features/tasks/tasksSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
const categories = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Moving Help',
  'Gardening',
  'Assembly',
  'Other',
];

const urgencyLevels = [
  { value: 'low', label: 'Low', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'red' },
];


const popularTags = [
  'logo design',
  'data entry',
  'video editing',
  'website development',
  'social media manager',
  'youtube thumbnail',
  'cleaning',
  'home repair',
];

const Tasks = () => {
  const dispatch = useDispatch();
  const { filteredTasks, filters, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'assigned': return 'secondary';
      case 'published': return 'warning';
      default: return 'default';
    }
  };

  const getUrgencyBadgeVariant = (urgency) => {
    switch (urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Filter tasks based on user role
  const displayedTasks = user?.role === 'client' 
    ? filteredTasks.filter(t => t.clientId === user.id)
    : user?.role === 'worker'
    ? filteredTasks.filter(t => t.status === 'published' || t.workerId === user.id)
    : filteredTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {user?.role === 'client' ? 'My Tasks' : 'Browse Tasks'}
        </h1>
        {user?.role === 'client' && (
          <Link to="/tasks/create">
            <Button>
              <Plus size={18} className="mr-2" />
              Create Task
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search with Popular Tags Dropdown */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="What service are you looking for today?"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Popular Tags Dropdown */}
            {showSearchDropdown && filters.search === '' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Popular right now
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onMouseDown={() => {
                        handleFilterChange('search', tag);
                        setShowSearchDropdown(false);
                      }}
                      className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter Toggle */}
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} className="mr-2" />
            Filters
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget</label>
              <input
                type="number"
                value={filters.minBudget}
                onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                placeholder="Min $"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget</label>
              <input
                type="number"
                value={filters.maxBudget}
                onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                placeholder="Max $"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
              <select
                value={filters.urgency}
                onChange={(e) => handleFilterChange('urgency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All</option>
                {urgencyLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Tasks List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      ) : displayedTasks.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your filters or create a new task.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTasks.map((task) => (
            <div key={task.id} className="group">
              <Link to={`/tasks/${task.id}`} className="block">
                <Card hover className="h-full group-hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={getStatusBadgeVariant(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant={getUrgencyBadgeVariant(task.urgency)}>
                      {task.urgency}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <DollarSign size={16} className="mr-2 text-success" />
                      <span className="font-medium text-gray-800">${task.budget}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2" />
                      <span>{task.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2" />
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <Badge variant="default">{task.category}</Badge>
                    {task.applicationsCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {task.applicationsCount} applications
                      </Badge>
                    )}
                  </div>
                </Card>
              </Link>
              {user?.role === 'client' && task.clientId === user.id && (
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all">
                  <Link to={`/tasks/edit/${task.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="error" 
                    className="w-24"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDeleteModal(true);
                      setTaskToDelete(task.id);
                    }}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <div className="text-center">
            <Trash2 size={48} className="mx-auto text-error mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Task?</h3>
            <p className="text-gray-600">This action cannot be undone. The task and all associated applications will be permanently deleted.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="error" 
              className="flex-1"
              onClick={() => {
                if (taskToDelete) {
                  dispatch(deleteTask(taskToDelete)).then(() => {
                    setShowDeleteModal(false);
                  });
                }
              }}
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;