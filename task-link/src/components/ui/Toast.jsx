import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, X } from 'lucide-react';
import { removeToast } from '../../features/notifications/notificationsSlice';
import Button from './Button';

const Toast = ({ id, message, type, duration, createdAt }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(removeToast(id));
    }, duration);

    return () => clearTimeout(timeout);
  }, [id, duration, dispatch]);

  const getVariant = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white border-green-400 shadow-lg shadow-green-200/50';
      case 'error': return 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-200/50';
      case 'warning': return 'bg-yellow-500 text-white border-yellow-400 shadow-lg shadow-yellow-200/50';
      case 'info': return 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-200/50';
      default: return 'bg-gray-500 text-white border-gray-400 shadow-lg shadow-gray-200/50';
    }
  };

  return (
    <div className={`flex items-start gap-3 p-4 border-l-4 rounded-lg shadow-xl backdrop-blur-sm transform translate-y-0 animate-in slide-in-from-top-2 duration-300 ease-out ${getVariant(type)} max-w-md mx-4`}>
      <Bell size={20} className="flex-shrink-0 mt-0.5 opacity-90" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight pr-2">{message}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 ml-1 p-1 hover:text-white/80 -m-1"
        onClick={() => dispatch(removeToast(id))}
      >
        <X size={16} />
      </Button>
    </div>
  );
};

const ToastContainer = () => {
  const toasts = useSelector((state) => state.notifications?.toasts || []);

  if (toasts.length === 0) return null;

  return (
    <>
      {/* Fixed toast stack */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
      
      {/* Backdrop blur */}
      <div className="fixed inset-0 z-[9998] pointer-events-none bg-black/5 backdrop-blur-sm" />
    </>
  );
};

export default ToastContainer;

