import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  Activity
} from 'lucide-react';
import { fetchTasks } from '../features/tasks/tasksSlice';
import { fetchApplications } from '../features/applications/applicationsSlice';
import { fetchReviews } from '../features/reviews/reviewsSlice';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

// Client Dashboard
const ClientDashboard = ({ tasks }) => {
  const activeTasks = tasks.filter(t => ['published', 'assigned', 'in_progress'].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalSpent = completedTasks.reduce((sum, t) => sum + t.budget, 0);

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Welcome back!</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Briefcase size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Tasks</p>
            <p className="text-2xl font-bold text-gray-800">{activeTasks.length}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-success/10 rounded-lg">
            <CheckCircle size={24} className="text-success" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-800">{completedTasks.length}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <DollarSign size={24} className="text-accent" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold text-gray-800">${totalSpent}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-secondary/10 rounded-lg">
            <Star size={24} className="text-secondary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Rating</p>
            <p className="text-2xl font-bold text-gray-800">4.8</p>
          </div>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card title="Recent Tasks">
        <div className="space-y-4">
          {recentTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Link to={`/tasks/${task.id}`} className="font-medium text-gray-800 hover:text-fuchsia-500">
                  {task.title}
                </Link>
                <p className="text-sm text-gray-500">${task.budget} • {task.category}</p>
              </div>
              <Badge variant={
                task.status === 'completed' ? 'success' : 
                task.status === 'in_progress' ? 'primary' : 
                task.status === 'assigned' ? 'secondary' : 'warning'
              }>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link to="/tasks" className="text-fuchsia-600 hover:text-fuchsia-500 hover:underline">View all tasks</Link>
        </div>
      </Card>
    </div>
  );
};

// Worker Dashboard
const WorkerDashboard = ({ tasks, applications, reviews }) => {
  const myTasks = tasks.filter(t => t.workerId === '2'); // For demo
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const totalEarnings = myTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.budget, 0);
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : 'N/A';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Welcome back!</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Briefcase size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-gray-800">{inProgressTasks.length}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-success/10 rounded-lg">
            <CheckCircle size={24} className="text-success" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-800">{myTasks.filter(t => t.status === 'completed').length}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <DollarSign size={24} className="text-accent" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-800">${totalEarnings}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-secondary/10 rounded-lg">
            <Star size={24} className="text-secondary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Rating</p>
            <p className="text-2xl font-bold text-gray-800">{averageRating}</p>
          </div>
        </Card>
      </div>

      {/* Available Tasks */}
      <Card title="Available Tasks" subtitle="Browse new tasks and apply">
        <div className="space-y-4">
          {tasks.filter(t => t.status === 'published').slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Link to={`/tasks/${task.id}`} className="font-medium text-gray-800 hover:text-fuchsia-500">
                  {task.title}
                </Link>
                <p className="text-sm text-gray-500">${task.budget} • {task.category}</p>
              </div>
              <Badge variant="success">Open</Badge>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link to="/tasks" className="text-fuchsia-600 hover:text-fuchsia-500 hover:underline">Browse all tasks</Link>
        </div>
      </Card>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = ({ tasks, users, reviews }) => {
  const totalUsers = users.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const activeTasks = tasks.filter(t => ['published', 'assigned', 'in_progress'].includes(t.status)).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Users size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
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
            <p className="text-2xl font-bold text-gray-800">{activeTasks}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <TrendingUp size={24} className="text-accent" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-800">{completedTasks}</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Tasks">
          <div className="space-y-4">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.category}</p>
                </div>
                <Badge variant={
                  task.status === 'completed' ? 'success' : 
                  task.status === 'in_progress' ? 'primary' : 
                  task.status === 'assigned' ? 'secondary' : 'warning'
                }>
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="System Overview">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Clients</span>
              <span className="font-medium">{users.filter(u => u.role === 'client').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Workers</span>
              <span className="font-medium">{users.filter(u => u.role === 'worker').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Reviews</span>
              <span className="font-medium">{reviews.length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks } = useSelector((state) => state.tasks);
  const { applications } = useSelector((state) => state.applications);
  const { reviews } = useSelector((state) => state.reviews);
  const { users } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchApplications());
    dispatch(fetchReviews());
  }, [dispatch]);

  switch (user?.role) {
    case 'client':
      return <ClientDashboard tasks={tasks} />;
    case 'worker':
      return <WorkerDashboard tasks={tasks} applications={applications} reviews={reviews} />;
    case 'admin':
      return <AdminDashboard tasks={tasks} users={users} reviews={reviews} />;
    default:
      return <ClientDashboard tasks={tasks} />;
  }
};

export default Dashboard;

