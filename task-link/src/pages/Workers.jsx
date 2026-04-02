import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Briefcase,
  Users
} from 'lucide-react';
import { fetchUsers } from '../features/users/usersSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
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

const Workers = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.users);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minRating: '',
    location: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const workers = users.filter(user => user.role === 'worker');

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch = !filters.search || 
      worker.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      worker.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      worker.bio.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || 
      worker.skills?.some(skill => skill.toLowerCase().includes(filters.category.toLowerCase()));
    
    const matchesRating = !filters.minRating || worker.rating >= parseFloat(filters.minRating);
    
    const matchesLocation = !filters.location || 
      worker.location.toLowerCase().includes(filters.location.toLowerCase());

    return matchesSearch && matchesCategory && matchesRating && matchesLocation;
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Find Workers</h1>
        <p className="text-gray-600">{filteredWorkers.length} workers available</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <Input
            placeholder="Search workers by name or skills..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Skills</option>
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                placeholder="e.g., 4.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="e.g., New York"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setFilters({ search: '', category: '', minRating: '', location: '' })}
              className="md:col-span-1"
            >
              Clear
            </Button>
          </div>
        )}
      </Card>

      {/* Workers List */}
      {filteredWorkers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No workers found</h3>
            <p className="text-gray-600 max-w-md mx-auto">Try adjusting your search or filters. There are many skilled workers available!</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <Link key={worker.id} to={`/profile/${worker.id}`} className="group">
              <Card className="h-full hover:shadow-xl transition-all group-hover:-translate-y-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {worker.firstName?.charAt(0)}{worker.lastName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-fuchsia-600 truncate">
                      {worker.firstName} {worker.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < (worker.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        {worker.rating?.toFixed(1) || 'No rating'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">Worker</Badge>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{worker.bio}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Briefcase size={14} className="mr-2" />
                    <span>{worker.completedTasks || 0} tasks completed</span>
                  </div>
                  {worker.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin size={14} className="mr-2" />
                      <span>{worker.location}</span>
                    </div>
                  )}
                </div>

                {worker.skills && worker.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-6">
                    {worker.skills.slice(0, 4).map((skill, idx) => (
                      <Badge key={idx} variant="default" size="sm">{skill}</Badge>
                    ))}
                    {worker.skills.length > 4 && (
                      <Badge variant="outline" size="sm">{worker.skills.length - 4} more</Badge>
                    )}
                  </div>
                )}

                <Button className="w-full group-hover:bg-fuchsia-600">
                  View Profile
                </Button>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workers;

