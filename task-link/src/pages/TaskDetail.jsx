import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Send,
  MessageCircle
  
} from 'lucide-react';
import { fetchTaskById, deleteTask, assignWorker } from '../features/tasks/tasksSlice';
import { fetchApplicationsByTask, createApplication, updateApplicationStatus } from '../features/applications/applicationsSlice';
import { fetchCommentsByTask, addComment } from '../features/comments/commentsSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import { Star } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentTask, isLoading: taskLoading } = useSelector((state) => state.tasks);
  const { applications, isLoading: appsLoading } = useSelector((state) => state.applications);
  const { commentsByTask, isLoading: commentsLoading } = useSelector((state) => state.comments);
  const { user } = useSelector((state) => state.auth);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newComment, setNewComment] = useState('');

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(fetchTaskById(id));
    dispatch(fetchApplicationsByTask(id));
    dispatch(fetchCommentsByTask(id));
  }, [dispatch, id]);

  const handleApply = (data) => {
    dispatch(createApplication({
      taskId: id,
      workerId: user.id,
      ...data
    }));
    setShowApplyModal(false);
    reset();
  };

  const handleAcceptApplication = (applicationId) => {
    dispatch(updateApplicationStatus({ applicationId, status: 'accepted' }));
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      dispatch(assignWorker({ taskId: id, workerId: app.workerId }));
    }
  };

  const handleRejectApplication = (applicationId) => {
    dispatch(updateApplicationStatus({ applicationId, status: 'rejected' }));
  };

  const handleAddComment = () => {
    if (newComment.trim() && user) {
      dispatch(addComment({ taskId: id, content: newComment.trim() }));
      setNewComment('');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'assigned': return 'secondary';
      case 'published': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  if (taskLoading || !currentTask) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isClient = user?.role === 'client' && currentTask?.clientId === user?.id;
  const isWorker = user?.role === 'worker';
  const hasApplied = applications.some(app => app.workerId === user?.id);
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const taskComments = commentsByTask[id] || [];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={getStatusBadgeVariant(currentTask.status)} className="bg-white/20 backdrop-blur-sm">
                    {currentTask.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant={currentTask.urgency === 'high' ? 'error' : currentTask.urgency === 'medium' ? 'warning' : 'success'} className="bg-white/20 backdrop-blur-sm">
                    {currentTask.urgency.toUpperCase()} URGENCY
                  </Badge>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white drop-shadow-lg mb-2">{currentTask.title}</h1>
                <p className="text-white/90 text-lg drop-shadow-md">Posted {new Date(currentTask.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {isClient && (
                  <>
                    <Link to={`/tasks/edit/${id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all">
                        <Edit size={20} className="mr-2" />
                        Edit Task
                      </Button>
                    </Link>
                    <Button 
                      variant="error"
                      className="bg-red-500/90 hover:bg-red-500 text-white px-6"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 size={20} className="mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{currentTask.description}</p>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <DollarSign size={20} className="text-success mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-semibold text-gray-800">${currentTask.budget}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock size={20} className="text-primary mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-semibold text-gray-800">{currentTask.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={20} className="text-secondary mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold text-gray-800">{currentTask.location}</p>
                    </div>
                  </div>
                  {currentTask.requiredSkills && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {currentTask.requiredSkills.map((skill, idx) => (
                          <Badge key={idx} variant="default">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Applications */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Applications ({applications.length})
                  </h2>
                </div>
                {appsLoading ? (
                  <p>Loading applications...</p>
                ) : applications.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No applications yet. Be the first to apply!</p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                              W{app.workerId}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Worker #{app.workerId}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex">
                                  {[1,2,3,4,5].map((star) => (
                                    <Star key={star} size={14} className="text-amber-400 fill-amber-400" />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">4.8 (127)</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={getStatusBadgeVariant(app.status)} size="lg">
                            {app.status}
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <p className="font-semibold text-lg text-gray-900">${app.price}</p>
                          <p className="text-sm text-gray-500">{app.deliveryTime} delivery</p>
                        </div>

                        <p className="text-gray-700 italic mb-4 leading-relaxed">
                          "{app.message}"
                        </p>

                        {isClient && app.status === 'pending' && (
                          <div className="flex gap-2 pt-4 border-t">
                            <Button 
                              size="sm" 
                              variant="success"
                              onClick={() => handleAcceptApplication(app.id)}
                              className="flex-1"
                            >
                              <CheckCircle size={16} className="mr-2" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleRejectApplication(app.id)}
                            >
                              <XCircle size={16} className="mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Comments Section */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MessageCircle size={20} />
                    Comments ({commentsByTask[id]?.length || 0})
                  </h2>
                </div>
                {commentsLoading ? (
                  <p>Loading comments...</p>
                ) : !commentsByTask[id] || commentsByTask[id].length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No comments yet. Be the first to comment!</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {commentsByTask[id].map((comment) => (
                      <div key={comment.id} className="p-4 bg-white border border-gray-200 rounded-xl">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {comment.authorName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{comment.authorName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 ml-13">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                {user && (
                  <div className="border-t pt-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows="3"
                    />
                    <Button 
                      className="mt-3 w-full"
                      onClick={() => {
                        if (newComment.trim()) {
                          dispatch(addComment({ taskId: id, content: newComment.trim() }));
                          setNewComment('');
                        }
                      }}
                      disabled={!newComment.trim()}
                    >
                      Post Comment
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                {isWorker && currentTask.status === 'published' && !hasApplied && (
                  <Button 
                    className="w-full" 
                    onClick={() => setShowApplyModal(true)}
                  >
                    <Send size={18} className="mr-2" />
                    Apply for Task
                  </Button>
                )}
                {isWorker && hasApplied && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <CheckCircle size={24} className="mx-auto text-success mb-2" />
                    <p className="text-gray-800 font-medium">Application Submitted</p>
                    <p className="text-sm text-gray-600">Waiting for client response</p>
                  </div>
                )}
                {currentTask.status !== 'published' && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">This task is no longer available</p>
                  </div>
                )}
              </Card>

              <Card title="Posted By">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={24} className="text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">Client #{currentTask.clientId}</p>
                    <Link 
                      to={`/profile/${currentTask.clientId}`} 
                      className="text-sm text-primary hover:underline"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  <MessageSquare size={18} className="mr-2" />
                  Message Client
                </Button>
              </Card>
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        <Modal 
          isOpen={showApplyModal} 
          onClose={() => setShowApplyModal(false)}
          title="Apply for Task"
        >
          <form onSubmit={handleSubmit(handleApply)}>
            <Input
              label="Your Price ($)"
              type="number"
              placeholder="Enter your price"
              {...register('price', { required: true })}
            />
            <Input
              label="Delivery Time"
              placeholder="e.g., 2 days"
              {...register('deliveryTime', { required: true })}
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message to Client
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows="4"
                placeholder="Introduce yourself and explain why you're the best fit..."
                {...register('message', { required: true })}
              ></textarea>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Submit Application
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)}
          title="Delete Task"
        >
          <div className="space-y-4">
            <div className="text-center">
              <Trash2 size={48} className="mx-auto text-error mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete "{currentTask.title}"?</h3>
              <p className="text-gray-600">This action cannot be undone. The task and all associated applications will be permanently deleted.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="error" 
                className="flex-1"
                onClick={() => {
                  dispatch(deleteTask(id)).then(() => {
                    setShowDeleteModal(false);
                    navigate('/tasks');
                  });
                }}
              >
                Delete Task
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default TaskDetail;
