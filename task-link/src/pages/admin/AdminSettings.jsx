// AdminSettings.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Save, Globe, Bell, Shield, CreditCard, Mail, Loader2, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Redux actions
import { 
  fetchSettings, 
  updateGeneralSettings,
  updatePaymentSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  clearError
} from '@/features/admin/settingsSlice';
import { addToast } from '@/features/notifications/notificationsSlice';

const AdminSettings = () => {
  const dispatch = useDispatch();
  const { settings, isLoading, error } = useSelector((state) => state.adminSettings);
  
  // Local state for form inputs
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'TaskLink',
    supportEmail: 'support@tasklink.com',
    maintenanceMode: false,
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    commissionRate: '10',
    autoPayouts: true,
    minimumPayout: '50',
    currency: 'USD',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newUserApproval: false,
    taskCreatedAlert: true,
    disputeAlert: true,
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    requireEmailVerification: true,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings on component mount
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Populate form when settings are loaded
  useEffect(() => {
    if (settings) {
      if (settings.general) setGeneralSettings(settings.general);
      if (settings.payment) setPaymentSettings(settings.payment);
      if (settings.notifications) setNotificationSettings(settings.notifications);
      if (settings.security) setSecuritySettings(settings.security);
    }
  }, [settings]);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      await dispatch(updateGeneralSettings(generalSettings)).unwrap();
      dispatch(addToast({
        message: 'General settings saved successfully',
        type: 'success'
      }));
    } catch (err) {
      dispatch(addToast({
        message: err || 'Failed to save general settings',
        type: 'error'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setIsSaving(true);
    try {
      await dispatch(updatePaymentSettings(paymentSettings)).unwrap();
      dispatch(addToast({
        message: 'Payment settings saved successfully',
        type: 'success'
      }));
    } catch (err) {
      dispatch(addToast({
        message: err || 'Failed to save payment settings',
        type: 'error'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await dispatch(updateNotificationSettings(notificationSettings)).unwrap();
      dispatch(addToast({
        message: 'Notification settings saved successfully',
        type: 'success'
      }));
    } catch (err) {
      dispatch(addToast({
        message: err || 'Failed to save notification settings',
        type: 'error'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    setIsSaving(true);
    try {
      await dispatch(updateSecuritySettings(securitySettings)).unwrap();
      dispatch(addToast({
        message: 'Security settings saved successfully',
        type: 'success'
      }));
    } catch (err) {
      dispatch(addToast({
        message: err || 'Failed to save security settings',
        type: 'error'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        dispatch(updateGeneralSettings(generalSettings)).unwrap(),
        dispatch(updatePaymentSettings(paymentSettings)).unwrap(),
        dispatch(updateNotificationSettings(notificationSettings)).unwrap(),
        dispatch(updateSecuritySettings(securitySettings)).unwrap(),
      ]);
      dispatch(addToast({
        message: 'All settings saved successfully',
        type: 'success'
      }));
    } catch (err) {
      dispatch(addToast({
        message: err || 'Failed to save settings',
        type: 'error'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading && !settings) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error && !settings) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Error loading settings: {error}</p>
            <Button onClick={() => dispatch(fetchSettings())}>
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-3xl space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* General Settings */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-lg">General Settings</CardTitle>
                  <CardDescription>Core platform configuration</CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveGeneral}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input 
                id="platformName" 
                value={generalSettings.platformName} 
                onChange={e => setGeneralSettings({...generalSettings, platformName: e.target.value})} 
                className="bg-muted border-border" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input 
                id="supportEmail" 
                type="email"
                value={generalSettings.supportEmail} 
                onChange={e => setGeneralSettings({...generalSettings, supportEmail: e.target.value})} 
                className="bg-muted border-border" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Temporarily disable public access</p>
              </div>
              <Switch 
                checked={generalSettings.maintenanceMode} 
                onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenanceMode: checked})} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-lg">Payment Settings</CardTitle>
                  <CardDescription>Commission and payout configuration</CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSavePayment}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Platform Commission (%)</Label>
              <Input 
                id="commissionRate" 
                type="number" 
                value={paymentSettings.commissionRate} 
                onChange={e => setPaymentSettings({...paymentSettings, commissionRate: e.target.value})} 
                className="bg-muted border-border w-32" 
                min="0"
                max="100"
                step="0.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumPayout">Minimum Payout Amount ($)</Label>
              <Input 
                id="minimumPayout" 
                type="number" 
                value={paymentSettings.minimumPayout} 
                onChange={e => setPaymentSettings({...paymentSettings, minimumPayout: e.target.value})} 
                className="bg-muted border-border w-32" 
                min="10"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Auto Payouts</p>
                <p className="text-xs text-muted-foreground">Automatically release funds on task completion</p>
              </div>
              <Switch 
                checked={paymentSettings.autoPayouts} 
                onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, autoPayouts: checked})} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-lg">Notifications</CardTitle>
                  <CardDescription>Email and push notification preferences</CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveNotifications}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Send admin alerts via email</p>
              </div>
              <Switch 
                checked={notificationSettings.emailNotifications} 
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})} 
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">New User Approval</p>
                <p className="text-xs text-muted-foreground">Manually approve new worker registrations</p>
              </div>
              <Switch 
                checked={notificationSettings.newUserApproval} 
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newUserApproval: checked})} 
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Task Created Alert</p>
                <p className="text-xs text-muted-foreground">Get notified when new tasks are created</p>
              </div>
              <Switch 
                checked={notificationSettings.taskCreatedAlert} 
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, taskCreatedAlert: checked})} 
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Dispute Alert</p>
                <p className="text-xs text-muted-foreground">Get notified when disputes are raised</p>
              </div>
              <Switch 
                checked={notificationSettings.disputeAlert} 
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, disputeAlert: checked})} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-lg">Security</CardTitle>
                  <CardDescription>Authentication and access control</CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveSecurity}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p>
              </div>
              <Switch 
                checked={securitySettings.twoFactorAuth} 
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})} 
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input 
                id="sessionTimeout" 
                type="number" 
                value={securitySettings.sessionTimeout} 
                onChange={e => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})} 
                className="bg-muted border-border w-32" 
                min="5"
                max="120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input 
                id="maxLoginAttempts" 
                type="number" 
                value={securitySettings.maxLoginAttempts} 
                onChange={e => setSecuritySettings({...securitySettings, maxLoginAttempts: e.target.value})} 
                className="bg-muted border-border w-32" 
                min="3"
                max="10"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Require Email Verification</p>
                <p className="text-xs text-muted-foreground">Users must verify email before accessing platform</p>
              </div>
              <Switch 
                checked={securitySettings.requireEmailVerification} 
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireEmailVerification: checked})} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Save All Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-gradient-to-r from-red-500 to-orange-600 text-primary-foreground gap-2 hover:from-red-600 hover:to-orange-700"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            Save All Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;