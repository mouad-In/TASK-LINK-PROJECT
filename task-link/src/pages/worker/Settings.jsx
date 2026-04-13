import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Mail, Phone, MapPin, Bell, Shield, CreditCard,
  LogOut, Camera, Check, ChevronRight,
  Moon, Sun, Briefcase, Clock, DollarSign, Star, FileText,
} from 'lucide-react';
import { cn } from '@/components/lib/utils';
import { useTheme } from '@/components/hooks/use-theme';

const WorkerSettings = () => {
  const { theme: contextTheme, toggleTheme } = useTheme();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [newTaskAlerts, setNewTaskAlerts] = useState(true);
  const [availability, setAvailability] = useState(true);

  return (
    <DashboardLayout userType="worker">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and worker profile</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Availability</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Profile</CardTitle>
                <CardDescription>Update your profile information and skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-semibold">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">John Doe</h3>
                    <p className="text-sm text-muted-foreground">Professional Cleaner</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        4.9 (127 reviews)
                      </Badge>
                      <Badge variant="outline">Verified</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <Input id="title" defaultValue="Professional Cleaner" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="email" type="email" defaultValue="john.doe@example.com" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="hourlyRate" type="number" defaultValue="35" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" defaultValue="Experienced cleaner with 5+ years in residential and commercial cleaning." className="min-h-[80px]" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Service Area</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="address" defaultValue="Brooklyn, NY and surrounding areas" className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Services</CardTitle>
                <CardDescription>List your professional skills and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {['Deep Cleaning', 'Move-in/out Cleaning', 'Window Cleaning', 'Laundry', 'Carpet Cleaning', 'Office Cleaning'].map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 px-3 py-1">
                      {skill}
                      <button className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" className="gap-1">
                    <Check className="w-3 h-3" />
                    Add Skill
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Availability Settings</CardTitle>
                <CardDescription>Set your working hours and availability status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", availability ? "bg-emerald-500/20" : "bg-muted")}>
                      <Briefcase className={cn("w-5 h-5", availability ? "text-emerald-500" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <p className="font-medium">Available for Work</p>
                      <p className="text-sm text-muted-foreground">Clients can see you when you're available</p>
                    </div>
                  </div>
                  <Switch checked={availability} onCheckedChange={setAvailability} />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Working Hours</h4>
                  {[
                    { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
                    { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' },
                    { day: 'Wednesday', hours: '9:00 AM - 6:00 PM' },
                    { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
                    { day: 'Friday', hours: '9:00 AM - 6:00 PM' },
                    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
                    { day: 'Sunday', hours: 'Off' },
                  ].map((schedule) => (
                    <div key={schedule.day} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <span className="font-medium">{schedule.day}</span>
                      <span className="text-sm text-muted-foreground">{schedule.hours}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button>Save Availability</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* ✅ Dark Mode fixed */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {contextTheme === 'dark'
                      ? <Moon className="w-5 h-5" />
                      : <Sun className="w-5 h-5" />
                    }
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
                    </div>
                  </div>
                  <Switch
                    checked={contextTheme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive push notifications</p>
                      </div>
                    </div>
                    <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Task Status Updates</p>
                        <p className="text-sm text-muted-foreground">Get notified about task status changes</p>
                      </div>
                    </div>
                    <Switch checked={taskAlerts} onCheckedChange={setTaskAlerts} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">New Task Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified about new available tasks</p>
                      </div>
                    </div>
                    <Switch checked={newTaskAlerts} onCheckedChange={setNewTaskAlerts} />
                  </div>
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
              <CardContent className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-muted-foreground">Update your password</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">Manage your logged in devices</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Manage your earnings and payout settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Available Balance</span>
                    <Badge className="bg-emerald-500 text-white">Ready to withdraw</Badge>
                  </div>
                  <p className="text-3xl font-bold text-emerald-500">$1,250.00</p>
                  <Button className="mt-4" variant="outline">Withdraw Earnings</Button>
                </div>

                <button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium">Payout Method</p>
                      <p className="text-sm text-muted-foreground">Bank Account ****4532</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <button className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium">Earnings History</p>
                      <p className="text-sm text-muted-foreground">View your past earnings</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WorkerSettings;