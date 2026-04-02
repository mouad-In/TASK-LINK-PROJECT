import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { login, clearError } from '../features/auth/authSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = (data) => {
    dispatch(login(data));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
      <p className="text-gray-600 mb-6">Sign in to continue to TaskLink</p>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            icon={<Mail size={18} className="text-gray-400" />}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
        </div>

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />
          <button
            type="button"
            className="absolute right-3 top-9"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={18} className="text-gray-400" />
            ) : (
              <Eye size={18} className="text-gray-400" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-fuchsia-600 hover:text-fuchsia-500 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-fuchsia-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
        <div className="text-xs text-gray-600 space-y-1">
          <p>Client: client@tasklink.com / password123</p>
          <p>Worker: worker@tasklink.com / password123</p>
          <p>Admin: admin@tasklink.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

