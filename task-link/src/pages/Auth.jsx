import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Link2, Mail, Lock, User, ArrowRight,
  Eye, EyeOff, Briefcase, Users, AlertCircle, ShieldCheck,
} from 'lucide-react';
import { CosmicBackground } from '../components/landing/CosmicBackground';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { login, register, clearError, setUserType } from '../features/auth/authSlice';
import { addToast } from '../features/notifications/notificationsSlice';

const ROLES = [
  {
    id: 'client',
    label: 'Client',
    sub: 'Post tasks, hire talent',
    Icon: Briefcase,
    active: 'border-fuchsia-400/60 shadow-lg shadow-fuchsia-500/20 bg-white/15',
    iconColor: 'text-fuchsia-400',
    btnGrad: 'from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500',
  },
  {
    id: 'worker',
    label: 'Worker',
    sub: 'Find work, earn money',
    Icon: Users,
    active: 'border-cyan-400/60 shadow-lg shadow-cyan-500/20 bg-white/15',
    iconColor: 'text-cyan-400',
    btnGrad: 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500',
  },
];

const EMAIL_RE = /\S+@\S+\.\S+/;

const redirectForRole = (role) => {
  if (role === 'admin')  return '/admin';
  if (role === 'client') return '/client/dashboard';
  return '/worker/dashboard';
};

const inputCls = (err, hasPadRight = false) =>
  `pl-9 ${hasPadRight ? 'pr-10' : ''} bg-white/8 border-white/15 text-white placeholder:text-white/25 focus:border-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl h-10 text-sm transition-colors ${err ? 'border-red-500/60' : ''}`;

const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <Label className="text-white/60 text-xs font-medium tracking-wide uppercase">{label}</Label>
    <div className="relative">{children}</div>
    {error && <p className="text-xs text-red-400/90">{error}</p>}
  </div>
);

const FieldIcon = ({ children }) => (
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
    {children}
  </span>
);

const EyeToggle = ({ show, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
  >
    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
);

const SubmitBtn = ({ loading, grad, label, loadingLabel }) => (
  <Button
    type="submit"
    disabled={loading}
    className={`w-full h-11 rounded-xl font-semibold text-sm group bg-gradient-to-r ${grad} text-white transition-all duration-200 mt-1 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'}`}
  >
    {loading ? (
      <>
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 inline-block" />
        {loadingLabel}
      </>
    ) : (
      <>
        {label}
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
      </>
    )}
  </Button>
);

const Auth = () => {
  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  const { loading, error, isAuthenticated, user } = useSelector((s) => s.auth);

  const [role,             setRole]             = useState(searchParams.get('role') || 'client');
  const [showPassword,     setShowPassword]     = useState(false);
  const [showConfirmPwd,   setShowConfirmPwd]   = useState(false);
  const [isLogin,          setIsLogin]          = useState(true);
  const [mounted,          setMounted]          = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: false });
  const [registerForm, setRegisterForm] = useState({
    firstName: '', lastName: '', email: '', password: '', passwordConfirmation: '',
  });

  useEffect(() => { setMounted(true); }, []);

  // FIX: read real role from server response, not from UI selector
  useEffect(() => {
    if (isAuthenticated && user) {
      const realRole = user.role || user.userType;
      navigate(redirectForRole(realRole), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => { dispatch(setUserType(role)); }, [role, dispatch]);

  useEffect(() => {
    dispatch(clearError());
    setValidationErrors({});
  }, [isLogin, role, dispatch]);

  const validateLogin = () => {
    const e = {};
    if (!loginForm.email)                     e.email    = 'Email is required';
    else if (!EMAIL_RE.test(loginForm.email)) e.email    = 'Invalid email address';
    if (!loginForm.password)                  e.password = 'Password is required';
    else if (loginForm.password.length < 6)   e.password = 'Min 6 characters';
    setValidationErrors(e);
    return !Object.keys(e).length;
  };

  const validateRegister = () => {
    const e = {};
    if (!registerForm.firstName || registerForm.firstName.length < 2)    e.firstName            = 'Min 2 characters';
    if (!registerForm.lastName  || registerForm.lastName.length  < 2)    e.lastName             = 'Min 2 characters';
    if (!registerForm.email)                                              e.email                = 'Email is required';
    else if (!EMAIL_RE.test(registerForm.email))                          e.email                = 'Invalid email address';
    if (!registerForm.password || registerForm.password.length < 6)      e.password             = 'Min 6 characters';
    if (!registerForm.passwordConfirmation)                               e.passwordConfirmation = 'Please confirm your password';
    else if (registerForm.password !== registerForm.passwordConfirmation) e.passwordConfirmation = 'Passwords do not match';
    setValidationErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    try {
      await dispatch(login({ email: loginForm.email, password: loginForm.password })).unwrap();
      dispatch(addToast({ title: 'Welcome back!', description: 'Redirecting to your dashboard…', variant: 'default' }));
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
      await dispatch(register({
        firstName: registerForm.firstName,
        lastName:  registerForm.lastName,
        email:     registerForm.email,
        password:  registerForm.password,
        role,
      })).unwrap();
      dispatch(addToast({ title: 'Account created!', description: 'Welcome to TaskLink!', variant: 'default' }));
    } catch (err) {
      dispatch(addToast({
        title: 'Registration failed',
        description: typeof err === 'string' ? err : 'Please try again.',
        variant: 'destructive',
      }));
    }
  };

  const updateLogin    = (f, v) => { setLoginForm(p    => ({ ...p, [f]: v })); setValidationErrors(p => ({ ...p, [f]: '' })); };
  const updateRegister = (f, v) => { setRegisterForm(p => ({ ...p, [f]: v })); setValidationErrors(p => ({ ...p, [f]: '' })); };

  const currentRole = ROLES.find((r) => r.id === role) || ROLES[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden flex items-center justify-center p-4">
      <CosmicBackground />

      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="glass-card p-2.5 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <Link2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">TaskLink</span>
        </Link>

        {/* Role Selector */}
        <div className="flex gap-3 mb-5">
          {ROLES.map(({ id, label, sub, Icon, active, iconColor }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRole(id)}
              className={`flex-1 glass-card p-4 text-center rounded-2xl border transition-all duration-300 ${
                role === id ? active : 'border-white/10 hover:bg-white/8'
              }`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${role === id ? iconColor : 'text-white/40'}`} />
              <span className={`text-sm font-semibold block ${role === id ? 'text-white' : 'text-white/50'}`}>{label}</span>
              <span className="text-xs text-white/30 mt-0.5 block leading-tight">{sub}</span>
            </button>
          ))}
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-2xl p-7 border border-white/10 backdrop-blur-xl bg-white/5">

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300 leading-snug">{error}</p>
            </div>
          )}

          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/8 p-1 rounded-xl border border-white/10">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/50 rounded-lg text-sm font-medium transition-all"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/50 rounded-lg text-sm font-medium transition-all"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="Email" error={validationErrors.email}>
                  <FieldIcon><Mail className="w-4 h-4" /></FieldIcon>
                  <Input id="email" type="email" value={loginForm.email} disabled={loading}
                    onChange={(e) => updateLogin('email', e.target.value)}
                    placeholder="you@example.com" className={inputCls(validationErrors.email)} />
                </Field>

                <Field label="Password" error={validationErrors.password}>
                  <FieldIcon><Lock className="w-4 h-4" /></FieldIcon>
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={loginForm.password} disabled={loading}
                    onChange={(e) => updateLogin('password', e.target.value)}
                    placeholder="••••••••" className={inputCls(validationErrors.password, true)} />
                  <EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                </Field>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={loginForm.rememberMe}
                      onChange={(e) => updateLogin('rememberMe', e.target.checked)}
                      className="rounded border-white/20 bg-white/10 accent-fuchsia-500" />
                    <span className="text-xs text-white/50">Remember me</span>
                  </label>
                  <button type="button"
                    onClick={() => dispatch(addToast({ title: 'Coming soon', description: 'Password reset coming soon!', variant: 'default' }))}
                    className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                    Forgot password?
                  </button>
                </div>

                <SubmitBtn loading={loading} grad={currentRole.btnGrad} label="Sign In" loadingLabel="Signing In…" />
              </form>
            </TabsContent>

            {/* REGISTER */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" error={validationErrors.firstName}>
                    <FieldIcon><User className="w-4 h-4" /></FieldIcon>
                    <Input id="firstName" type="text" value={registerForm.firstName} disabled={loading}
                      onChange={(e) => updateRegister('firstName', e.target.value)}
                      placeholder="John" className={inputCls(validationErrors.firstName)} />
                  </Field>
                  <Field label="Last Name" error={validationErrors.lastName}>
                    <FieldIcon><User className="w-4 h-4" /></FieldIcon>
                    <Input id="lastName" type="text" value={registerForm.lastName} disabled={loading}
                      onChange={(e) => updateRegister('lastName', e.target.value)}
                      placeholder="Doe" className={inputCls(validationErrors.lastName)} />
                  </Field>
                </div>

                <Field label="Email" error={validationErrors.email}>
                  <FieldIcon><Mail className="w-4 h-4" /></FieldIcon>
                  <Input id="reg-email" type="email" value={registerForm.email} disabled={loading}
                    onChange={(e) => updateRegister('email', e.target.value)}
                    placeholder="you@example.com" className={inputCls(validationErrors.email)} />
                </Field>

                <Field label="Password" error={validationErrors.password}>
                  <FieldIcon><Lock className="w-4 h-4" /></FieldIcon>
                  <Input id="reg-password" type={showPassword ? 'text' : 'password'} value={registerForm.password} disabled={loading}
                    onChange={(e) => updateRegister('password', e.target.value)}
                    placeholder="••••••••" className={inputCls(validationErrors.password, true)} />
                  <EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                </Field>

                <Field label="Confirm Password" error={validationErrors.passwordConfirmation}>
                  <FieldIcon><Lock className="w-4 h-4" /></FieldIcon>
                  <Input id="password-confirmation" type={showConfirmPwd ? 'text' : 'password'} value={registerForm.passwordConfirmation} disabled={loading}
                    onChange={(e) => updateRegister('passwordConfirmation', e.target.value)}
                    placeholder="••••••••" className={inputCls(validationErrors.passwordConfirmation, true)} />
                  <EyeToggle show={showConfirmPwd} onToggle={() => setShowConfirmPwd(!showConfirmPwd)} />
                </Field>

                <SubmitBtn loading={loading} grad={currentRole.btnGrad} label="Create Account" loadingLabel="Creating Account…" />
              </form>
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-white/30 bg-transparent">Or continue with</span>
            </div>
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            {['Google', 'GitHub'].map((p) => (
              <button key={p} type="button"
                onClick={() => dispatch(addToast({ title: 'Coming soon', description: `${p} login coming soon!`, variant: 'default' }))}
                className="glass-card py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/15 transition-all text-sm font-medium border border-white/10">
                {p}
              </button>
            ))}
          </div>

          {/* Admin hint */}
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/8">
            <ShieldCheck className="w-4 h-4 text-white/30 shrink-0" />
            <p className="text-xs text-white/30 leading-snug">
              Admin accounts are created by the system administrator and redirect automatically.
            </p>
          </div>

          <p className="text-center text-xs text-white/25 mt-4">
            By continuing, you agree to our{' '}
            <a href="#" className="text-fuchsia-400/80 hover:text-fuchsia-300 underline underline-offset-2">Terms</a>
            {' & '}
            <a href="#" className="text-fuchsia-400/80 hover:text-fuchsia-300 underline underline-offset-2">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;