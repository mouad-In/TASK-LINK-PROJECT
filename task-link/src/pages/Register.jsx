import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { register, clearError } from '../features/auth/authSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const urlRole = searchParams.get('role') || 'client';
  const [role, setRole] = useState(urlRole);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const { register: registerForm, handleSubmit, formState: { errors } } = useForm();

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
    dispatch(register({ ...data, role }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
      <p className="text-gray-600 mb-6">Join TaskLink and start connecting</p>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      {/* Role Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">I want to:</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="client"
              checked={role === 'client'}
              onChange={(e) => setRole(e.target.value)}
              className="mr-2"
            />
            <span className="text-gray-700">Hire Workers</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="worker"
              checked={role === 'worker'}
              onChange={(e) => setRole(e.target.value)}
              className="mr-2"
            />
            <span className="text-gray-700">Find Work</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            error={errors.firstName?.message}
            {...registerForm('firstName', {
              required: 'First name is required'
            })}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...registerForm('lastName', {
              required: 'Last name is required'
            })}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...registerForm('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />

        <Input
          label="Phone"
          type="tel"
          placeholder="+1 234 567 8900"
          error={errors.phone?.message}
          {...registerForm('phone', {
            required: 'Phone is required'
          })}
        />

        <Input
          label="Location"
          placeholder="New York, NY"
          error={errors.location?.message}
          {...registerForm('location', {
            required: 'Location is required'
          })}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            error={errors.password?.message}
            {...registerForm('password', {
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

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full mt-4"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-fuchsia-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

