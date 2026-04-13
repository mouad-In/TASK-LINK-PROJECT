import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import  DashboardLayout  from '@/layouts/DashboardLayout';
import {
  User, Mail, Phone, MapPin, Star, Edit3, Camera,
  Shield, Award, Briefcase, Calendar, CheckCircle2,
  Globe, Twitter, Linkedin, Save, X, Loader, Github, Instagram
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  fetchUserProfile,
  updateUserProfile,
  uploadAvatar,
  removeAvatar,
  addUserSkill,
  removeUserSkill,
  updateUserSocialLinks,
  fetchUserStats,
  setEditing,
  updateProfile,
  addSkill,
  removeSkill,
  updateSocialLinks,
} from '../features/profile/profileSlice';

const StarRating = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-4 h-4 ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
      />
    ))}
  </div>
);

const StatCard = ({ label, value, gradient }) => (
  <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
    <CardContent className="p-5 flex flex-col items-center text-center">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} mb-3 animate-pulse`} />
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </CardContent>
  </Card>
);

const Profile = () => {
  const dispatch = useDispatch();
  const { userData, editing, isLoading, uploadProgress } = useSelector((state) => state.profile);
  const { reviews } = useSelector((state) => state.reviews);
  const { userType } = useSelector((state) => state.auth);
  
  // Local state for form inputs during editing
  const [localName, setLocalName] = useState(userData.name);
  const [localBio, setLocalBio] = useState(
    userData.bio || (userType === 'worker'
      ? 'Experienced freelancer specializing in home services, IT support, and general repairs. 5+ years of experience with 200+ completed tasks.'
      : 'Busy professional seeking reliable workers for home and office tasks. I value punctuality and quality work.')
  );
  const [localLocation, setLocalLocation] = useState(userData.location);
  const [localPhone, setLocalPhone] = useState(userData.phone);
  const [newSkill, setNewSkill] = useState('');
  const [socialLinks, setSocialLinks] = useState(userData.socialLinks);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchUserStats());
  }, [dispatch]);

  const accentGradient = userType === 'worker'
    ? 'from-cyan-500 to-blue-600'
    : 'from-fuchsia-500 to-purple-600';

  const handleSave = async () => {
    await dispatch(updateUserProfile({
      name: localName,
      bio: localBio,
      location: localLocation,
      phone: localPhone,
    }));
  };

  const handleCancel = () => {
    setLocalName(userData.name);
    setLocalBio(userData.bio);
    setLocalLocation(userData.location);
    setLocalPhone(userData.phone);
    dispatch(setEditing(false));
  };

  const handleAddSkill = async () => {
    if (newSkill.trim() && !userData.skills.includes(newSkill.trim())) {
      await dispatch(addUserSkill(newSkill.trim()));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = async (skill) => {
    await dispatch(removeUserSkill(skill));
  };

  const handleSocialLinkChange = async (platform, value) => {
    const updatedLinks = { ...socialLinks, [platform]: value };
    setSocialLinks(updatedLinks);
    await dispatch(updateUserSocialLinks({ [platform]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      await dispatch(uploadAvatar(file));
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (window.confirm('Are you sure you want to remove your avatar?')) {
      await dispatch(removeAvatar());
    }
  };

  // Calculate review statistics
  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 0;
  
  const ratingCounts = {
    5: reviews?.filter(r => r.rating === 5).length || 0,
    4: reviews?.filter(r => r.rating === 4).length || 0,
    3: reviews?.filter(r => r.rating === 3).length || 0,
    2: reviews?.filter(r => r.rating === 2).length || 0,
    1: reviews?.filter(r => r.rating === 1).length || 0,
  };

  const getRatingPercentage = (rating) => {
    if (totalReviews === 0) return 0;
    return (ratingCounts[rating] / totalReviews) * 100;
  };

  if (isLoading && !userData.id) {
    return (
      <DashboardLayout userType={userType}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-fuchsia-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Profile Header Card */}
        <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Cover Banner */}
          <div className={`h-32 bg-gradient-to-r ${accentGradient} relative`}>
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Uploading...</p>
                  {uploadProgress > 0 && (
                    <Progress value={uploadProgress} className="w-40 mt-2" />
                  )}
                </div>
              </div>
            )}
          </div>

          <CardContent className="pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-900 shadow-lg">
                  <AvatarImage src={userData.avatar} />
                  <AvatarFallback
                    className={`text-2xl font-bold text-white bg-gradient-to-br ${accentGradient}`}
                  >
                    {userData.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <Camera className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                </label>
                {userData.avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Name & meta */}
              <div className="flex-1 min-w-0">
                {editing ? (
                  <Input
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    className="text-2xl font-bold h-auto py-1 mb-1 max-w-xs"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{userData.name}</h1>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <Badge
                    className={`capitalize bg-gradient-to-r ${accentGradient} text-white border-0`}
                  >
                    {userType}
                  </Badge>
                  {userType === 'worker' && (
                    <div className="flex items-center gap-1">
                      <StarRating value={Math.floor(userData.stats?.rating || 0)} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{userData.stats?.rating || 0}</span>
                      <span className="text-sm text-slate-500">({totalReviews} reviews)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    {editing ? (
                      <Input
                        value={localLocation}
                        onChange={(e) => setLocalLocation(e.target.value)}
                        className="h-6 py-0 px-2 text-sm w-32"
                      />
                    ) : (
                      userData.location || 'Location not set'
                    )}
                  </div>
                </div>
              </div>

              {/* Edit / Save button */}
              <div className="flex gap-2 shrink-0">
                {editing ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      className="gap-1"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      className={`bg-gradient-to-r ${accentGradient} text-white border-0 gap-1`}
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => dispatch(setEditing(true))} className="gap-1">
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mb-4">
              {editing ? (
                <textarea
                  value={localBio}
                  onChange={(e) => setLocalBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {userData.bio || localBio}
                </p>
              )}
            </div>

            {/* Quick Info Row */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {userData.email}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                {editing ? (
                  <Input
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    className="h-6 py-0 px-2 text-sm w-40"
                  />
                ) : (
                  userData.phone || 'Not provided'
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Member since {userData.memberSince || '2024'}
              </div>
              {userType === 'worker' && userData.isVerified && (
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Verified</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rest of the component remains the same as your original Profile component */}
        {/* Tabs, Overview, Reviews, Skills, Settings sections go here */}
        
      </div>
    </DashboardLayout>
  );
};

export default Profile;