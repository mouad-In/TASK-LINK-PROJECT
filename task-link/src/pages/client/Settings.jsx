// Settings.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import  DashboardLayout  from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  Camera,
  Check,
  ChevronRight,
  Moon,
  Sun,
  Briefcase,
  Clock,
  DollarSign,
  Star,
  FileText,
  Loader2,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  Globe,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { Languages } from 'lucide-react';
import { cn } from '@/components/lib/utils';
import { useTheme } from '@/components/hooks/use-theme';

// Redux actions (to be defined in your slices)
import { 
  updateWorkerProfile, 
  updateWorkerSettings,
  updateWorkerAvailability,
  changePassword,
  deleteAccount,
} from '@/features/worker/workerSlice';
import { 
  updateClientProfile,
  updateClientSettings,
  updateNotificationSettings,
} from '@/features/client/clientSlice';
import { updateNotificationPrefs, toggleTheme } from '@/features/settings/settingsSlice';
import { addToast } from '@/features/notifications/notificationsSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const { userType, user } = useSelector((state) => state.auth);
  const { notificationPrefs } = useSelector((state) => state.settings);
  const { theme, toggleTheme } = useTheme();
  
  // Profile state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    hourlyRate: user?.hourlyRate || '',
    skills: user?.skills || [],
  });
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Availability state (for workers)
  const [availability, setAvailability] = useState({
    isAvailable: user?.isAvailable || true,
    workingHours: user?.workingHours || [
      { day: 'Monday', start: '09:00', end: '18:00', enabled: true },
      { day: 'Tuesday', start: '09:00', end: '18:00', enabled: true },
      { day: 'Wednesday', start: '09:00', end: '18:00', enabled: true },
      { day: 'Thursday', start: '09:00', end: '18:00', enabled: true },
      { day: 'Friday', start: '09:00', end: '18:00', enabled: true },
      { day: 'Saturday', start: '10:00', end: '16:00', enabled: true },
      { day: 'Sunday', start: '00:00', end: '00:00', enabled: false },
    ],
  });
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: notificationPrefs?.email ?? true,
    pushNotifications: notificationPrefs?.push ?? true,
    taskAlerts: notificationPrefs?.taskAlerts ?? true,
    newTaskAlerts: notificationPrefs?.newTaskAlerts ?? true,
    promotionalEmails: notificationPrefs?.promotionalEmails ?? false,
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync local darkMode with global theme
  const [darkMode, setDarkMode] = useState(theme === 'dark');
  
  useEffect(() => {
    setDarkMode(theme === 'dark');
  }, [theme]);
  
  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setProfileForm(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: null }));
  };
  
  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: null }));
  };
  
  const validateProfile = () => {
    const newErrors = {};
    if (!profileForm.firstName) newErrors.firstName = 'First name is required';
    if (!profileForm.lastName) newErrors.lastName = 'Last name is required';
    if (!profileForm.email) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(profileForm.email)) newErrors.email = 'Email is invalid';
    if (userType === 'worker' && profileForm.hourlyRate && profileForm.hourlyRate <= 0) {
      newErrors.hourlyRate = 'Hourly rate must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePassword = () => {
    const newErrors = {};
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    
    setIsLoading(true);
    try {
      const updateAction = userType === 'worker' 
        ? updateWorkerProfile(profileForm)
        : updateClientProfile(profileForm);
      
      await dispatch(updateAction).unwrap();
      dispatch(addToast({
        message: 'Profile updated successfully',
        type: 'success'
      }));
    } catch (error) {
      dispatch(addToast({
        message: error.message || 'Failed to update profile',
        type: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    
    setIsLoading(true);
    try {
      await dispatch(changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })).unwrap();
      
      dispatch(addToast({
        message: 'Password changed successfully',
        type: 'success'
      }));
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      dispatch(addToast({
        message: error.message || 'Failed to change password',
        type: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAvailability = async () => {
    if (userType !== 'worker') return;
    
    setIsLoading(true);
    try {
      await dispatch(updateWorkerAvailability(availability)).unwrap();
      dispatch(addToast({
        message: 'Availability updated successfully',
        type: 'success'
      }));
    } catch (error) {
      dispatch(addToast({
        message: error.message || 'Failed to update availability',
        type: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await dispatch(updateNotificationPrefs(notifications)).unwrap();
      dispatch(addToast({
        message: 'Notification preferences updated',
        type: 'success'
      }));
    } catch (error) {
      dispatch(addToast({
        message: error.message || 'Failed to update preferences',
        type: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleThemeToggle = () => {
    toggleTheme();
  };
  
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await dispatch(deleteAccount()).unwrap();
      dispatch(addToast({
        message: 'Account deleted successfully',
        type: 'success'
      }));
      // Redirect to logout or home page
      window.location.href = '/logout';
    } catch (error) {
      dispatch(addToast({
        message: error.message || 'Failed to delete account',
        type: 'error'
      }));
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  
  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account and {userType === 'worker' ? 'worker' : 'profile'} settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            {userType === 'worker' && (
              <TabsTrigger value="availability" className="gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Availability</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-semibold">
                        {profileForm.firstName?.[0]}{profileForm.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {profileForm.firstName} {profileForm.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">{userType}</p>
                    {user?.rating && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {user.rating} ({user.reviewCount} reviews)
                        </Badge>
                        {user?.verified && (
                          <Badge variant="outline">Verified</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {userType === 'worker' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="hourlyRate" 
                            type="number" 
                            value={profileForm.hourlyRate}
                            onChange={handleProfileChange}
                            className={`pl-10 ${errors.hourlyRate ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.hourlyRate && (
                          <p className="text-sm text-red-500">{errors.hourlyRate}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (comma separated)</Label>
                        <Input 
                          id="skills" 
                          value={profileForm.skills?.join(', ')}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            skills: e.target.value.split(',').map(s => s.trim())
                          })}
                          placeholder="Cleaning, Plumbing, Electrical, etc."
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="location" 
                        value={profileForm.location}
                        onChange={handleProfileChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio" 
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab (Worker only) */}
          {userType === 'worker' && (
            <TabsContent value="availability" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Settings</CardTitle>
                  <CardDescription>
                    Set your working hours and availability status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Availability Toggle */}
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        availability.isAvailable ? "bg-emerald-500/20" : "bg-muted"
                      )}>
                        <Briefcase className={cn(
                          "w-5 h-5",
                          availability.isAvailable ? "text-emerald-500" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium">Available for Work</p>
                        <p className="text-sm text-muted-foreground">
                          Clients can see you when you're available
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={availability.isAvailable} 
                      onCheckedChange={(checked) => setAvailability({
                        ...availability,
                        isAvailable: checked
                      })}
                    />
                  </div>

                  {/* Working Hours */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Working Hours</h4>
                    {availability.workingHours.map((schedule, index) => (
                      <div key={schedule.day} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                        <div className="w-24">
                          <span className="font-medium">{schedule.day}</span>
                        </div>
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={(checked) => {
                            const updated = [...availability.workingHours];
                            updated[index].enabled = checked;
                            setAvailability({ ...availability, workingHours: updated });
                          }}
                        />
                        {schedule.enabled && (
                          <>
                            <Input
                              type="time"
                              value={schedule.start}
                              onChange={(e) => {
                                const updated = [...availability.workingHours];
                                updated[index].start = e.target.value;
                                setAvailability({ ...availability, workingHours: updated });
                              }}
                              className="w-32"
                            />
                            <span>to</span>
                            <Input
                              type="time"
                              value={schedule.end}
                              onChange={(e) => {
                                const updated = [...availability.workingHours];
                                updated[index].end = e.target.value;
                                setAvailability({ ...availability, workingHours: updated });
                              }}
                              className="w-32"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveAvailability}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Availability
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Notification Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.emailNotifications} 
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        emailNotifications: checked
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive push notifications</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.pushNotifications} 
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        pushNotifications: checked
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Task Status Updates</p>
                        <p className="text-sm text-muted-foreground">Get notified about task status changes</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.taskAlerts} 
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        taskAlerts: checked
                      })}
                    />
                  </div>

                  {userType === 'worker' && (
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">New Task Alerts</p>
                          <p className="text-sm text-muted-foreground">Get notified about new available tasks</p>
                        </div>
                      </div>
                      <Switch 
                        checked={notifications.newTaskAlerts} 
                        onCheckedChange={(checked) => setNotifications({
                          ...notifications,
                          newTaskAlerts: checked
                        })}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Promotional Emails</p>
                        <p className="text-sm text-muted-foreground">Receive offers and updates</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.promotionalEmails} 
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        promotionalEmails: checked
                      })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveNotifications}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <h4 className="font-medium">Change Password</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className={errors.currentPassword ? 'border-red-500' : ''}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-sm text-red-500 mt-1">{errors.currentPassword}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className={errors.newPassword ? 'border-red-500' : ''}
                      />
                      {errors.newPassword && (
                        <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                    <Button 
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h4 className="font-medium text-destructive mb-4">Danger Zone</h4>
                  <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={handleThemeToggle} />
                </div>

                {/* Language Preference */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Languages className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Language</p>
                      <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                    </div>
                  </div>
                  <select className="px-3 py-1 rounded-lg border border-border bg-background">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                {/* Help & Support */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Help & Support</p>
                      <p className="text-sm text-muted-foreground">Get help or contact support</p>
                    </div>
                  </div>
                  <Button variant="outline">View Help Center</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                Are you sure you want to delete your account? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All your data, tasks, and history will be permanently deleted.
                </AlertDescription>
              </Alert>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;