import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const { isAuthenticated, userType } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedUserTypes.length > 0 && userType && !allowedUserTypes.includes(userType)) {
    const redirectPath = userType === 'client' ? '/client/dashboard' : '/worker/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

export const RouteWrapper = ({ children, allowedUserTypes = [] }) => (
  <ProtectedRoute allowedUserTypes={allowedUserTypes}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;