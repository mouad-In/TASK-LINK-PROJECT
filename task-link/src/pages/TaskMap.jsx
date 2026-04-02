import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { fetchTasks, setFilters } from '../features/tasks/tasksSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to update map center
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const TaskMap = () => {
  const dispatch = useDispatch();
  const { filteredTasks, filters, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [selectedTask, setSelectedTask] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState(50); // km

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Filter tasks that have coordinates
  const tasksWithCoords = filteredTasks.filter(task => task.coordinates);

  // Default center (New York)
  const defaultCenter = [40.7128, -74.0060];
  const defaultZoom = 11;

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'assigned': return 'secondary';
      case 'published': return 'warning';
      default: return 'default';
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Task Map</h1>
        
        {/* Distance Filter */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">Filter by distance:</label>
          <select
            value={distanceFilter}
            onChange={(e) => setDistanceFilter(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden" className="!p-0">
            <div className="h-[600px]">
              <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={defaultCenter} zoom={defaultZoom} />
                
                {tasksWithCoords.map((task) => (
                  <Marker
                    key={task.id}
                    position={[task.coordinates.lat, task.coordinates.lng]}
                    eventHandlers={{
                      click: () => handleTaskClick(task),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <h3 className="font-semibold text-gray-800 mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{task.description?.substring(0, 100)}...</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">${task.budget}</span>
                          <Badge variant={getStatusBadgeVariant(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <Link 
                          to={`/tasks/${task.id}`}
                          className="block mt-2 text-center text-sm text-primary hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </Card>
        </div>

        {/* Task List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Tasks ({tasksWithCoords.length})
          </h2>
          
          <div className="max-h-[550px] overflow-y-auto space-y-3">
            {tasksWithCoords.map((task) => (
              <Card 
                key={task.id}
                hover
                onClick={() => handleTaskClick(task)}
                className={selectedTask?.id === task.id ? 'ring-2 ring-primary' : ''}
              >
                <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">{task.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{task.location}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">${task.budget}</span>
                  <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <h3 className="font-semibold text-gray-800 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">Published</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">Assigned</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaskMap;

