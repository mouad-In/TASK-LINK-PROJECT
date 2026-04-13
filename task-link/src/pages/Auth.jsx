import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Link2, Mail, Lock, User, ArrowRight, Eye, EyeOff, Briefcase, Users, AlertCircle } from 'lucide-react';
import { CosmicBackground } from '../components/landing/CosmicBackground';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { login, register, clearError, setUserType } from '../features/auth/authSlice';
import { addToast } from '../features/notifications/notificationsSlice';

const Auth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ إصلاح 1: loading بدل isLoading
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const initialRole = searchParams.get('role') || 'client';
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // ✅ إصلاح 2: firstName و lastName بدل name
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = role === 'client' ? '/client/dashboard' : '/worker/dashboard';
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, role]);

  useEffect(() => {
    dispatch(setUserType(role));
  }, [role, dispatch]);

  useEffect(() => {
    dispatch(clearError());
    setValidationErrors({});
  }, [isLogin, role, dispatch]);

  const validateLogin = () => {
    const errors = {};
    if (!loginForm.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errors.email = 'Email is invalid';
    if (!loginForm.password) errors.password = 'Password is required';
    else if (loginForm.password.length < 6) errors.password = 'Password must be at least 6 characters';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = () => {
    const errors = {};
    // ✅ إصلاح 3: validate firstName و lastName
    if (!registerForm.firstName) errors.firstName = 'First name is required';
    else if (registerForm.firstName.length < 2) errors.firstName = 'First name must be at least 2 characters';
    if (!registerForm.lastName) errors.lastName = 'Last name is required';
    else if (registerForm.lastName.length < 2) errors.lastName = 'Last name must be at least 2 characters';
    if (!registerForm.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(registerForm.email)) errors.email = 'Email is invalid';
    if (!registerForm.password) errors.password = 'Password is required';
    else if (registerForm.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!registerForm.passwordConfirmation) errors.passwordConfirmation = 'Please confirm your password';
    else if (registerForm.password !== registerForm.passwordConfirmation) errors.passwordConfirmation = 'Passwords do not match';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    try {
      await dispatch(login({
        email: loginForm.email,
        password: loginForm.password,
      })).unwrap();

      dispatch(addToast({
        title: 'Welcome back!',
        description: 'Redirecting to your dashboard...',
        variant: 'default',
      }));
    } catch (err) {
      dispatch(addToast({
        title: 'Login failed',
        description: typeof err === 'string' ? err : 'Please check your credentials.',
        variant: 'destructive',
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    try {
      // ✅ إصلاح 4: إرسال firstName و lastName و role للـ API
      await dispatch(register({
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        email: registerForm.email,
        password: registerForm.password,
        role: role,
      })).unwrap();
      dispatch(addToast({
        title: 'Account created!',
        description: 'Welcome to TaskLink!',
        variant: 'default',
      }));
    } catch (err) {
      dispatch(addToast({
        title: 'Registration failed',
        description: typeof err === 'string' ? err : 'Please try again.',
        variant: 'destructive',
      }));
    }
  };

  const handleSocialLogin = (provider) => {
    dispatch(addToast({
      title: 'Coming soon',
      description: `${provider} login coming soon!`,
      variant: 'default',
    }));
  };

  const handleForgotPassword = () => {
    dispatch(addToast({
      title: 'Coming soon',
      description: 'Password reset feature coming soon!',
      variant: 'default',
    }));
  };

  const updateLoginField = (field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) setValidationErrors(prev => ({ ...prev, [field]: '' }));
  };

  const updateRegisterField = (field, value) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) setValidationErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden flex items-center justify-center p-4">
      <CosmicBackground />

      <div className={`relative z-10 w-full max-w-md transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="glass-card p-3 group-hover:rotate-12 transition-transform duration-300">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">TaskLink</span>
        </Link>

        {/* Role Selector */}
        <div className="flex gap-4 mb-6">
          <button type="button" onClick={() => setRole('client')}
            className={`flex-1 glass-card p-4 text-center transition-all duration-300 ${role === 'client' ? 'border-fuchsia-400/60 shadow-lg shadow-fuchsia-500/30 bg-white/20' : 'hover:bg-white/10'
              }`}>
            <Briefcase className={`w-6 h-6 mx-auto mb-2 ${role === 'client' ? 'text-fuchsia-400' : 'text-white/60'}`} />
            <span className={`font-medium ${role === 'client' ? 'text-white' : 'text-white/60'}`}>Client</span>
            <p className="text-xs text-white/40 mt-1">Post tasks, hire talent</p>
          </button>
          <button type="button" onClick={() => setRole('worker')}
            className={`flex-1 glass-card p-4 text-center transition-all duration-300 ${role === 'worker' ? 'border-cyan-400/60 shadow-lg shadow-cyan-500/30 bg-white/20' : 'hover:bg-white/10'
              }`}>
            <Users className={`w-6 h-6 mx-auto mb-2 ${role === 'worker' ? 'text-cyan-400' : 'text-white/60'}`} />
            <span className={`font-medium ${role === 'worker' ? 'text-white' : 'text-white/60'}`}>Worker</span>
            <p className="text-xs text-white/40 mt-1">Find work, earn money</p>
          </button>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 p-1 rounded-lg">
              <TabsTrigger value="login" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 rounded-md transition-all">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 rounded-md transition-all">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* ── Login Form ── */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input id="email" type="email" value={loginForm.email}
                      onChange={(e) => updateLoginField('email', e.target.value)}
                      placeholder="you@example.com" disabled={loading}
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary ${validationErrors.email ? 'border-red-500' : ''}`} />
                  </div>
                  {validationErrors.email && <p className="text-xs text-red-400">{validationErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} value={loginForm.password}
                      onChange={(e) => updateLoginField('password', e.target.value)}
                      placeholder="••••••••" disabled={loading}
                      className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary ${validationErrors.password ? 'border-red-500' : ''}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.password && <p className="text-xs text-red-400">{validationErrors.password}</p>}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                    <input type="checkbox" checked={loginForm.rememberMe}
                      onChange={(e) => updateLoginField('rememberMe', e.target.checked)}
                      className="rounded border-white/20 bg-white/10" />
                    Remember me
                  </label>
                  <button type="button" onClick={handleForgotPassword}
                    className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" disabled={loading}
                  className={`w-full group ${role === 'client'
                    ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Signing In...</>
                  ) : (
                    <>Sign In<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ── Register Form ── */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">

                {/* ✅ إصلاح 5: حقلان منفصلان firstName و lastName */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white/80">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <Input id="firstName" type="text" value={registerForm.firstName}
                        onChange={(e) => updateRegisterField('firstName', e.target.value)}
                        placeholder="John" disabled={loading}
                        className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary ${validationErrors.firstName ? 'border-red-500' : ''}`} />
                    </div>
                    {validationErrors.firstName && <p className="text-xs text-red-400">{validationErrors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white/80">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <Input id="lastName" type="text" value={registerForm.lastName}
                        onChange={(e) => updateRegisterField('lastName', e.target.value)}
                        placeholder="Doe" disabled={loading}
                        className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary ${validationErrors.lastName ? 'border-red-500' : ''}`} />
                    </div>
                    {validationErrors.lastName && <p className="text-xs text-red-400">{validationErrors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-white/80">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input id="reg-email" type="email" value={registerForm.email}
                      onChange={(e) => updateRegisterField('email', e.target.value)}
                      placeholder="you@example.com" disabled={loading}
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary ${validationErrors.email ? 'border-red-500' : ''}`} />
                  </div>
                  {validationErrors.email && <p className="text-xs text-red-400">{validationErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-white/80">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input id="reg-password" type={showPassword ? 'text' : 'password'} value={registerForm.password}
                      onChange={(e) => updateRegisterField('password', e.target.value)}
                      placeholder="••••••••" disabled={loading}
                      className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary ${validationErrors.password ? 'border-red-500' : ''}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.password && <p className="text-xs text-red-400">{validationErrors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-confirmation" className="text-white/80">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input id="password-confirmation" type={showConfirmPassword ? 'text' : 'password'}
                      value={registerForm.passwordConfirmation}
                      onChange={(e) => updateRegisterField('passwordConfirmation', e.target.value)}
                      placeholder="••••••••" disabled={loading}
                      className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary ${validationErrors.passwordConfirmation ? 'border-red-500' : ''}`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.passwordConfirmation && <p className="text-xs text-red-400">{validationErrors.passwordConfirmation}</p>}
                </div>

                <Button type="submit" disabled={loading}
                  className={`w-full group ${role === 'client'
                    ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Creating Account...</>
                  ) : (
                    <>Create Account<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white/40">Or continue with</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleSocialLogin('Google')}
                className="glass-card py-2.5 text-white/80 hover:bg-white/20 transition-all font-medium text-sm">Google</button>
              <button type="button" onClick={() => handleSocialLogin('GitHub')}
                className="glass-card py-2.5 text-white/80 hover:bg-white/20 transition-all font-medium text-sm">GitHub</button>
            </div>
          </div>

          <p className="text-center text-xs text-white/40 mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-fuchsia-400 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-fuchsia-400 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;