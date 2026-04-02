import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Star, 
  TrendingUp,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';
import { fetchUsers } from '../features/users/usersSlice';
import { fetchTasks } from '../features/tasks/tasksSlice';
import { fetchReviews } from '../features/reviews/reviewsSlice';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Admin = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.users);
  const { tasks } = useSelector((state) => state.tasks);
  const { reviews } = useSelector((state) => state.reviews);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchTasks());
    dispatch(fetchReviews());
  }, [dispatch]);

  // Calculate statistics
  const clients = users.filter(u => u.role === 'client');
  const workers = users.filter(u => u.role === 'worker');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const activeTasks = tasks.filter(t => ['published', 'assigned', 'in_progress'].includes(t.status));
  const totalEarnings = completedTasks.reduce((sum, t) => sum + t.budget, 0);

  // Category distribution
  const categoryStats = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value
  }));

  // Status distribution
  const statusStats = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-fuchsia-100 rounded-lg">
            <Users size={24} className="text-fuchsia-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-secondary/10 rounded-lg">
            <Briefcase size={24} className="text-secondary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-success/10 rounded-lg">
            <Activity size={24} className="text-success" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Tasks</p>
            <p className="text-2xl font-bold text-gray-800">{activeTasks.length}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <DollarSign size={24} className="text-accent" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">${totalEarnings}</p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <Card title="User Distribution">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <Users size={20} className="text-primary" />
                </div>
                <span className="font-medium text-gray-800">Clients</span>
              </div>
              <span className="font-bold text-gray-800">{clients.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                  <Briefcase size={20} className="text-secondary" />
                </div>
                <span className="font-medium text-gray-800">Workers</span>
              </div>
              <span className="font-bold text-gray-800">{workers.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                  <Star size={20} className="text-accent" />
                </div>
                <span className="font-medium text-gray-800">Reviews</span>
              </div>
              <span className="font-bold text-gray-800">{reviews.length}</span>
            </div>
          </div>
        </Card>

        {/* Task Status */}
        <Card title="Task Status">
          <div className="space-y-4">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Badge 
                    variant={
                      status === 'completed' ? 'success' : 
                      status === 'in_progress' ? 'primary' : 
                      status === 'assigned' ? 'secondary' : 
                      status === 'published' ? 'warning' : 'default'
                    }
                  >
                    {status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                    <div 
                      className={`h-2 rounded-full ${
                        status === 'completed' ? 'bg-success' : 
                        status === 'in_progress' ? 'bg-primary' : 
                        status === 'assigned' ? 'bg-secondary' : 
                        status === 'published' ? 'bg-accent' : 'bg-gray-400'
                      }`}
                      style={{ width: `${(count / totalTasks) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-gray-800 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card title="Tasks by Category">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoryData.map((cat) => (
            <div key={cat.name} className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">{cat.value}</p>
              <p className="text-sm text-gray-600">{cat.name}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Users */}
      <Card title="Recent Users">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <Link to={`/profile/${user.id}`} className="font-medium text-gray-800 hover:text-primary">
                      {user.firstName} {user.lastName}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={user.role === 'client' ? 'primary' : user.role === 'worker' ? 'secondary' : 'default'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Admin;

