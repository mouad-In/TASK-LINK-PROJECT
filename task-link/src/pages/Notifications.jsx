import React from 'react';
import { useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { toasts } = useSelector((state) => state.notifications);

  const recentNotifications = toasts.slice(0, 20).reverse(); // Recent first

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell size={32} className="text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600">{user?.role === 'client' ? 'Task & application updates' : 'Applications & assignments'}</p>
        </div>
      </div>

      {recentNotifications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications</h3>
            <p className="text-gray-600">You'll see updates here when applications are submitted or tasks are updated</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recentNotifications.map((notif) => (
            <Card key={notif.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Badge 
                  variant={notif.type === 'success' ? 'success' : notif.type === 'error' ? 'error' : 'info'}
                  className="flex-shrink-0 mt-0.5"
                >
                  {notif.type.toUpperCase()}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 mb-1 leading-tight">{notif.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Notifications;

