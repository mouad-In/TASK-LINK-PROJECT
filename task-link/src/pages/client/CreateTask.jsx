// CreateTask.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import  DashboardLayout  from '@/layouts/DashboardLayout';
import { 
  ArrowLeft,
  ArrowRight,
  Upload,
  MapPin,
  Calendar,
  DollarSign,
  Check,
  Sparkles,
  Wrench,
  Truck,
  Laptop,
  Paintbrush,
  Home,
  Leaf,
  Camera,
  X,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Redux actions from your existing tasksSlice
import { createTask } from '@/features/tasks/tasksSlice';

const categories = [
  { id: 'cleaning', icon: Sparkles, name: 'Cleaning', color: 'from-pink-500 to-rose-500', placeholder: 'e.g., Deep cleaning for 2-bedroom apartment', suggestedBudget: '$80 - $150' },
  { id: 'repairs', icon: Wrench, name: 'Repairs', color: 'from-orange-500 to-amber-500', placeholder: 'e.g., Fix leaking faucet in kitchen', suggestedBudget: '$100 - $200' },
  { id: 'moving', icon: Truck, name: 'Moving', color: 'from-blue-500 to-cyan-500', placeholder: 'e.g., Help move furniture to new apartment', suggestedBudget: '$150 - $300' },
  { id: 'it-help', icon: Laptop, name: 'IT Help', color: 'from-violet-500 to-purple-500', placeholder: 'e.g., Setup home WiFi network', suggestedBudget: '$60 - $120' },
  { id: 'painting', icon: Paintbrush, name: 'Painting', color: 'from-green-500 to-emerald-500', placeholder: 'e.g., Paint living room walls', suggestedBudget: '$200 - $400' },
  { id: 'home-care', icon: Home, name: 'Home Care', color: 'from-amber-500 to-yellow-500', placeholder: 'e.g., Regular lawn mowing service', suggestedBudget: '$50 - $100' },
  { id: 'gardening', icon: Leaf, name: 'Gardening', color: 'from-emerald-500 to-teal-500', placeholder: 'e.g., Plant flowers in garden', suggestedBudget: '$70 - $150' },
  { id: 'photography', icon: Camera, name: 'Photography', color: 'from-fuchsia-500 to-pink-500', placeholder: 'e.g., Birthday party photography', suggestedBudget: '$200 - $500' },
];

const steps = [
  { number: 1, title: 'Category' },
  { number: 2, title: 'Details' },
  { number: 3, title: 'Budget & Date' },
  { number: 4, title: 'Review' },
];

const CreateTask = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { isLoading, error } = useSelector((state) => state.tasks);
  const { profile } = useSelector((state) => state.client);
  
  // Local state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    budget: '',
    due_date: '',
    address: '',
    city: '',
    postal_code: '',
  });
  const [errors, setErrors] = useState({});

  const handleNext = () => {
    // Validate current step before proceeding
    if (validateStep(currentStep)) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1 && !selectedCategory) {
      newErrors.category = 'Please select a category';
    }
    
    if (step === 2) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.location.trim() && !formData.address.trim()) {
        newErrors.location = 'Location is required';
      }
    }
    
    if (step === 3) {
      if (!formData.budget || formData.budget <= 0) {
        newErrors.budget = 'Valid budget is required';
      }
      if (!formData.due_date) {
        newErrors.due_date = 'Due date is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random()
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const removeImage = (imageId) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== imageId));
  };

 const handleSubmit = async () => {
  if (!validateStep(3)) return;
  
  const taskData = {
    title: formData.title,
    description: formData.description,
    category: selectedCategory.toLowerCase(), // ✅ lowercase
    budget: parseFloat(formData.budget),
    location: formData.location || formData.address,
    urgency: parseFloat(formData.budget) > 200 ? 'high' : 'medium', // ✅ medium بدل normal
    requiredSkills: [],
  };
  
  try {
    const result = await dispatch(createTask(taskData)).unwrap();
    navigate('/client/dashboard');
  } catch (err) {
    console.error('Failed to create task:', err);
  }
};

  const getSelectedCategoryData = () => {
    return categories.find(cat => cat.name === selectedCategory);
  };

  const selectedCategoryData = getSelectedCategoryData();

  return (
    <DashboardLayout userType="client">
      <div className="max-w-3xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/client/dashboard')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Post a New Task</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Describe what you need help with</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                  currentStep >= step.number
                    ? 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <span className={`text-xs mt-2 hidden sm:block ${
                  currentStep >= step.number
                    ? 'text-fuchsia-600 dark:text-fuchsia-400 font-medium'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  currentStep > step.number
                    ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
          <CardContent className="p-6 md:p-8">
            {/* Step 1: Category */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    What type of task do you need help with?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Select the category that best describes your task
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setErrors({ ...errors, category: null });
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedCategory === category.name
                          ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-md`}>
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{category.name}</span>
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-2">{errors.category}</p>
                )}
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Tell us more about your task
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Provide details to help workers understand what you need
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Task Title *</Label>
                    <Input 
                      id="title"
                      placeholder={selectedCategoryData?.placeholder || "e.g., Deep cleaning for 2-bedroom apartment"}
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        setErrors({ ...errors, title: null });
                      }}
                      className={`mt-1.5 ${errors.title ? 'border-red-500' : ''}`}
                    />
                    {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description"
                      placeholder="Describe your task in detail. Include any specific requirements or expectations..."
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        setErrors({ ...errors, description: null });
                      }}
                      className={`mt-1.5 min-h-[120px] ${errors.description ? 'border-red-500' : ''}`}
                    />
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        id="location"
                        placeholder="Enter address or area"
                        value={formData.location}
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value });
                          setErrors({ ...errors, location: null });
                        }}
                        className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                  </div>
                  <div>
                    <Label>Photos (Optional)</Label>
                    <div className="mt-1.5">
                      <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-fuchsia-500 transition-colors cursor-pointer block">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Drag & drop images or <span className="text-fuchsia-600">browse</span>
                        </p>
                      </label>
                      
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {uploadedImages.map((img) => (
                            <div key={img.id} className="relative">
                              <img src={img.preview} alt="Preview" className="w-full h-20 object-cover rounded-lg" />
                              <button
                                onClick={() => removeImage(img.id)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Budget & Date */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Set your budget and timeline
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Help workers understand your expectations
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="budget">Budget (USD) *</Label>
                    <div className="relative mt-1.5">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        id="budget"
                        type="number"
                        min="0"
                        step="10"
                        placeholder="Enter your budget"
                        value={formData.budget}
                        onChange={(e) => {
                          setFormData({ ...formData, budget: e.target.value });
                          setErrors({ ...errors, budget: null });
                        }}
                        className={`pl-10 ${errors.budget ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {selectedCategoryData && (
                      <p className="text-xs text-slate-500 mt-1">
                        Suggested: {selectedCategoryData.suggestedBudget} for {selectedCategory}
                      </p>
                    )}
                    {errors.budget && <p className="text-sm text-red-500 mt-1">{errors.budget}</p>}
                  </div>
                  <div>
                    <Label htmlFor="due_date">When do you need this done? *</Label>
                    <div className="relative mt-1.5">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        id="due_date"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.due_date}
                        onChange={(e) => {
                          setFormData({ ...formData, due_date: e.target.value });
                          setErrors({ ...errors, due_date: null });
                        }}
                        className={`pl-10 ${errors.due_date ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.due_date && <p className="text-sm text-red-500 mt-1">{errors.due_date}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Review your task
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Make sure everything looks good before posting
                  </p>
                </div>
                <div className="space-y-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl">
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Category</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedCategory}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Title</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formData.title || 'Not set'}</span>
                  </div>
                  <div className="py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400 block mb-1">Description</span>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      {formData.description || 'Not set'}
                    </p>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Location</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formData.location || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Budget</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      ${parseFloat(formData.budget || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600 dark:text-slate-400">Due Date</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formData.due_date ? new Date(formData.due_date).toLocaleDateString() : 'Flexible'}
                    </span>
                  </div>
                </div>
                {uploadedImages.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Attached Images:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {uploadedImages.slice(0, 4).map((img) => (
                        <img key={img.id} src={img.preview} alt="Preview" className="w-full h-20 object-cover rounded-lg" />
                      ))}
                      {uploadedImages.length > 4 && (
                        <div className="w-full h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <span className="text-sm">+{uploadedImages.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={isLoading || (currentStep === 1 && !selectedCategory)}
                  className="gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-md"
                >
                  {isLoading ? 'Loading...' : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-md"
                >
                  {isLoading ? (
                    'Posting...'
                  ) : (
                    <>
                      Post Task
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateTask;