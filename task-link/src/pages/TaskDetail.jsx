import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft, MapPin, Calendar, Clock, Star,
  MessageSquare, Heart, Share2, Flag, Shield,
  ChevronRight, Send, Briefcase, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/Input';

import {
  fetchTaskById,
  clearCurrentTask,
} from '@/features/tasks/tasksSlice';

import { createApplication, fetchApplicationsByWorker, fetchApplicationsByTask, updateApplicationStatus } from '@/features/applications/applicationsSlice';
import { messageService } from '@/services/api';

// ── Component ──────────────────────────────────────────────────────────────────

const TaskDetails = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  // ── Selectors — read directly from your tasksSlice shape ──
  const task      = useSelector((state) => state.tasks.currentTask);
  const isLoading = useSelector((state) => state.tasks.isLoading);
  const error     = useSelector((state) => state.tasks.error);

  // Read real user from auth state
  const currentUser = useSelector((state) => state.auth.user);
  const isClient = currentUser?.role === 'client';

  // ✅ استخرج قيم ثابتة خارج الـ useEffect لتجنب تغيير حجم الـ dependency array
  const currentUserId   = currentUser?.id   ?? null;
  const currentUserRole = currentUser?.role ?? null;

  // Check if this worker already applied — من applications ديالو هو
  const applications = useSelector((state) => state.applications.applications);
  const alreadyApplied = applications.some(
    (app) => String(app.task_id) === String(id)
  );

  // للـ client: applications الحقيقية للمهمة
  const taskApplications = useSelector((state) => state.applications.applications);

  // ── Local UI state ──
  const [saved,           setSaved]           = useState(false);
  const [showApplyForm,   setShowApplyForm]   = useState(false);
  const [proposalPrice,   setProposalPrice]   = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [deliveryTime,    setDeliveryTime]    = useState('');
  const [isApplying,      setIsApplying]      = useState(false);
  const [applyError,      setApplyError]      = useState(null);
  const [applySuccess,    setApplySuccess]    = useState(false);

  // ── Fetch task on mount / id change ──
  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
      if (currentUserRole === 'worker' && currentUserId) {
        dispatch(fetchApplicationsByWorker(currentUserId));
      }
      if (currentUserRole === 'client') {
        dispatch(fetchApplicationsByTask(id));
      }
    }
    return () => dispatch(clearCurrentTask());
  }, [id, dispatch, currentUserId, currentUserRole]);

  // ── Submit proposal handler ──
  const handleSubmitProposal = async () => {
    if (!proposalPrice || !proposalMessage || !deliveryTime) return;
    setIsApplying(true);
    setApplyError(null);
    try {
      const result = await dispatch(createApplication({
        taskId:       parseInt(id, 10),   // ✅ Backend يطلب integer
        price:        parseFloat(proposalPrice),
        deliveryTime: deliveryTime,
        message:      proposalMessage,
      }));
      if (createApplication.fulfilled.match(result)) {
        setApplySuccess(true);
        setShowApplyForm(false);
        setProposalPrice('');
        setProposalMessage('');
        setDeliveryTime('');
      } else {
        setApplyError(result.payload || 'Failed to submit proposal. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  // ── Hire worker handler ──
  const [hiringId, setHiringId] = useState(null);

  const handleHireWorker = async (applicationId, workerId) => {
    setHiringId(applicationId);
    try {
      // 1. قبول الـ application
      await dispatch(updateApplicationStatus({ applicationId, status: 'accepted' }));

      // 2. إنشاء أو جلب المحادثة مع الـ worker
      const conversation = await messageService.getOrCreateConversation(currentUserId, workerId);

      // 3. الانتقال لصفحة المحادثة
      navigate(`/client/messages/${conversation.id}`);
    } catch (err) {
      console.error('Hire failed:', err);
    } finally {
      setHiringId(null);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading task…</p>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-destructive font-medium">Failed to load task</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => dispatch(fetchTaskById(id))}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!task) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Task not found.</p>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-muted/30">

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-medium text-foreground truncate flex-1">Task Details</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaved(!saved)}
              className={`p-2 rounded-xl hover:bg-muted ${saved ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
              <Flag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title & Meta */}
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                    {task.category}
                  </Badge>
                  <Badge
                    className={task.status === 'Open'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-muted text-muted-foreground border-border'}
                    variant="outline"
                  >
                    {task.status}
                  </Badge>
                  {task.urgency === 'Urgent' && (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20" variant="outline">
                      🔥 Urgent
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">{task.title}</h1>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {task.location  && <span className="flex items-center gap-1.5"><MapPin   className="w-4 h-4" />{task.location}</span>}
                  {task.deadline  && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Due {task.deadline}</span>}
                  {task.postedAt  && <span className="flex items-center gap-1.5"><Clock    className="w-4 h-4" />Posted {task.postedAt}</span>}
                  {task.views     && <span className="flex items-center gap-1.5"><Eye      className="w-4 h-4" />{task.views} views</span>}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-line leading-relaxed">
                  {task.fullDescription || task.description}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            {task.skills?.length > 0 && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {task.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-muted h-48 flex items-center justify-center mb-4 border border-border">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">{task.location}</p>
                    {task.address && <p className="text-sm">{task.address}</p>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Exact address will be shared after hiring.</p>
              </CardContent>
            </Card>

            {/* Proposals */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-lg">
                    Proposals ({task.applicationsCount ?? taskApplications.length ?? 0})
                  </CardTitle>
                  {isClient && (
                    <span className="text-sm text-muted-foreground">
                      {taskApplications.length} workers interested
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isClient ? (
                  taskApplications.length > 0 ? (
                    taskApplications.map((app) => {
                      const worker = app.worker ?? {};
                      const workerName = `${worker.first_name ?? ''} ${worker.last_name ?? ''}`.trim() || 'Worker';
                      const initials = workerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                      return (
                        <div key={app.id} className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all bg-card">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                              {worker.avatar
                                ? <img src={worker.avatar} alt={workerName} className="w-full h-full rounded-full object-cover" />
                                : initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">{workerName}</h3>
                                <span className="text-lg font-bold text-foreground">${app.price}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  {worker.rating ?? 'N/A'}
                                </span>
                                <span>⏱ {app.delivery_time}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  app.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                                  app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-red-100 text-red-700'
                                }`}>{app.status}</span>
                              </div>
                              <p className="text-sm text-foreground/70 mb-3">{app.message}</p>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                                  disabled={hiringId === app.id || app.status === 'accepted'}
                                  onClick={() => handleHireWorker(app.id, worker.id)}
                                >
                                  {hiringId === app.id ? 'Hiring...' : app.status === 'accepted' ? '✅ Hired' : 'Hire Now'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    const conv = await messageService.getOrCreateConversation(currentUserId, worker.id);
                                    navigate(`/client/messages/${conv.id}`);
                                  }}
                                >
                                  <MessageSquare className="w-4 h-4 mr-1" /> Chat
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="font-medium text-foreground">No proposals yet</p>
                      <p className="text-sm mt-1">Workers will appear here once they apply</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="font-medium text-foreground">Proposals are only visible to the task poster</p>
                    <p className="text-sm mt-1">Submit your proposal using the form on the right</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right column — Sidebar ── */}
          <div className="space-y-6">

            {/* Budget & Action */}
            <Card className="border-border sticky top-20">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-1">{task.budgetType ?? 'Fixed Price'}</p>
                  <p className="text-4xl font-bold text-foreground">${task.budget}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.applicationsCount ?? task.proposals ?? 0} proposals so far
                  </p>
                </div>

                {isClient ? (
                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground" size="lg">
                      Edit Task
                    </Button>
                    <Button variant="outline" className="w-full" size="lg">
                      Close Task
                    </Button>
                  </div>
                ) : showApplyForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Your Price ($)</label>
                      <Input
                        type="number"
                        placeholder="Enter your price"
                        value={proposalPrice}
                        onChange={(e) => setProposalPrice(e.target.value)}
                        className="bg-muted border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Delivery Time</label>
                      <Input
                        type="text"
                        placeholder="e.g. 2 days, 1 week"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="bg-muted border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Cover Letter</label>
                      <Textarea
                        placeholder="Why are you the best fit for this task?"
                        rows={4}
                        value={proposalMessage}
                        onChange={(e) => setProposalMessage(e.target.value)}
                        className="bg-muted border-border resize-none"
                      />
                    </div>
                    {applyError && (
                      <p className="text-sm text-destructive">{applyError}</p>
                    )}
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                      size="lg"
                      disabled={!proposalPrice || !proposalMessage || !deliveryTime || isApplying}
                      onClick={handleSubmitProposal}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isApplying ? 'Submitting...' : 'Submit Proposal'}
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setShowApplyForm(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : applySuccess || alreadyApplied ? (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-emerald-500 font-semibold text-lg">✅ Proposal Submitted!</p>
                    <p className="text-sm text-muted-foreground">The client will review your proposal soon.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                      size="lg"
                      onClick={() => setShowApplyForm(true)}
                    >
                      Apply Now
                    </Button>
                    <Button variant="outline" className="w-full" size="lg" onClick={() => setSaved(!saved)}>
                      <Heart className={`w-4 h-4 mr-2 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                      {saved ? 'Saved' : 'Save Task'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Info */}
            {task.client && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">About the Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold text-primary-foreground">
                      {task.client.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{task.client.name}</h3>
                        {task.client.verified && <Shield className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {task.client.rating} ({task.client.reviews} reviews)
                      </div>
                    </div>
                  </div>

                  <Separator className="mb-4" />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member since</span>
                      <span className="text-foreground font-medium">{task.client.joined}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tasks posted</span>
                      <span className="text-foreground font-medium">{task.client.tasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hire rate</span>
                      <span className="text-foreground font-medium">92%</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    <MessageSquare className="w-4 h-4 mr-2" /> Contact Client
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Similar Tasks */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Similar Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Kitchen Deep Clean', 'Office Cleaning Weekly', 'Move-out Cleaning'].map((title, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors text-left"
                    onClick={() => navigate(`/tasks/${i + 3}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground">
                        ${[80, 120, 200][i]} • {['Manhattan', 'Queens', 'Bronx'][i]}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetails;