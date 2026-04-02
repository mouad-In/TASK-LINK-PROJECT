import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2 } from 'lucide-react';
import { createTask, updateTask, fetchTaskById } from '../features/tasks/tasksSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
const categories = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Moving Help',
  'Gardening',
  'Assembly',
  'Other',
];

const urgencyLevels = [
  { value: 'low', label: 'Low', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'red' },
];

const CreateTask = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTask } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.tasks);
  
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchTaskById(id));
    }
  }, [dispatch, isEdit, id]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: isEdit && currentTask ? currentTask : {}
  });
  
  useEffect(() => {
    if (isEdit && currentTask) {
      // Populate form with current task data
      setValue('title', currentTask.title || '');
      setValue('description', currentTask.description || '');
      setValue('budget', currentTask.budget || '');
      setValue('category', currentTask.category || '');
      setValue('urgency', currentTask.urgency || '');
      setValue('location', currentTask.location || '');
      if (currentTask.requiredSkills) {
        setSkills(currentTask.requiredSkills);
      }
    }
  }, [currentTask, isEdit, setValue]);



  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const onSubmit = (data) => {
    const taskData = {
      ...data,
      requiredSkills: skills,
      comments: [],
      coordinates: { lat: 40.7128, lng: -74.0060 }, // Default coordinates
    };
    
    if (isEdit && id) {
      dispatch(updateTask({ taskId: id, taskData }));
    } else {
      taskData.clientId = user.id;
      dispatch(createTask(taskData));
    }
    navigate('/tasks');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Task</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          
          <Input
            label="Task Title"
            placeholder="e.g., Fix leaking kitchen faucet"
            error={errors.title?.message}
            {...register('title', { required: 'Title is required' })}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows="5"
              placeholder="Describe your task in detail..."
              {...register('description', { required: 'Description is required' })}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-error">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-error">{errors.category.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgency
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                {...register('urgency', { required: 'Urgency is required' })}
              >
                <option value="">Select urgency</option>
                {urgencyLevels.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              {errors.urgency && (
                <p className="mt-1 text-sm text-error">{errors.urgency.message}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Budget & Location</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Budget ($)"
              type="number"
              placeholder="e.g., 150"
              {...register('budget', { 
                required: 'Budget is required',
                min: { value: 1, message: 'Budget must be at least $1' }
              })}
            />

            <Input
              label="Location"
              placeholder="e.g., New York, NY"
              {...register('location', { required: 'Location is required' })}
            />
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Required Skills</h2>
          
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add a skill"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill}>
              <Plus size={18} />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 hover:text-error"
                >
                  <Trash2 size={14} />
                </button>
              </span>
            ))}
          </div>

          {skills.length === 0 && (
            <p className="text-sm text-gray-500">Add skills that workers should have for this task.</p>
          )}
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/tasks')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Task
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;

