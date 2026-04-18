// AdminTasks.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, MoreHorizontal, Eye, AlertTriangle, CheckCircle2, Clock, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Redux actions
import { fetchRecentTasks, updateTaskStatus, deleteTask } from '@/features/admin/adminSlice';
import { addToast } from '@/features/notifications/notificationsSlice';

const AdminTasks = () => {
  const dispatch = useDispatch();
  const { recentTasks: tasks, isLoading, error } = useSelector((state) => state.admin);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch tasks on component mount
  useEffect(() => {
    dispatch(fetchRecentTasks());
  }, [dispatch]);

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await dispatch(updateTaskStatus({ taskId, status: newStatus })).unwrap();
      dispatch(addToast({
        message: `Task status updated to ${newStatus}`,
        type: 'success'
      }));
      // Refresh tasks
      dispatch(fetchRecentTasks());
    } catch (error) {
      dispatch(addToast({
        message: error || 'Failed to update task status',
        type: 'error'
      }));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        dispatch(addToast({
          message: 'Task deleted successfully',
          type: 'success'
        }));
        // Refresh tasks
        dispatch(fetchRecentTasks());
      } catch (error) {
        dispatch(addToast({
          message: error || 'Failed to delete task',
          type: 'error'
        }));
      }
    }
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (s === 'in_progress' || s === 'in progress' || s === 'assigned') return <Clock className="w-3.5 h-3.5" />;
    if (s === 'disputed') return <AlertTriangle className="w-3.5 h-3.5" />;
    if (s === 'cancelled') return <XCircle className="w-3.5 h-3.5" />;
    if (s === 'open') return <Eye className="w-3.5 h-3.5" />;
    return <Eye className="w-3.5 h-3.5" />;
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (s === 'in_progress' || s === 'in progress' || s === 'assigned') return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    if (s === 'disputed') return 'bg-destructive/10 text-destructive border-destructive/20';
    if (s === 'cancelled') return 'bg-muted text-muted-foreground border-border';
    if (s === 'open') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  };

  const formatStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Filter tasks based on search and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      task.status?.toLowerCase().replace(/ /g, '-').replace(/_/g, '-') === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate counts
  const counts = {
    open: tasks.filter(t => t.status?.toLowerCase() === 'open').length,
    inProgress: tasks.filter(t => t.status?.toLowerCase() === 'in_progress' || t.status?.toLowerCase() === 'assigned').length,
    completed: tasks.filter(t => t.status?.toLowerCase() === 'completed').length,
    disputed: tasks.filter(t => t.status?.toLowerCase() === 'disputed').length,
  };

  // Loading state
  if (isLoading && tasks.length === 0) {
    return (
      <AdminLayout title="Task Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error && tasks.length === 0) {
    return (
      <AdminLayout title="Task Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Error loading tasks: {error}</p>
            <Button onClick={() => dispatch(fetchRecentTasks())}>
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Task Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: counts.open, color: 'text-amber-600' },
          { label: 'In Progress', value: counts.inProgress, color: 'text-blue-600' },
          { label: 'Completed', value: counts.completed, color: 'text-emerald-600' },
          { label: 'Disputed', value: counts.disputed, color: 'text-destructive' },
        ].map(s => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks Table */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">All Tasks</CardTitle>
              <CardDescription>Monitor and manage platform tasks</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search tasks..." 
                  className="pl-9 bg-muted border-border" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
              <select 
                className="h-10 px-3 rounded-md border border-border bg-muted text-sm text-foreground" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="disputed">Disputed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Task</TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">Client</TableHead>
                <TableHead className="text-muted-foreground hidden lg:table-cell">Worker</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground hidden sm:table-cell">Budget</TableHead>
                <TableHead className="text-muted-foreground hidden xl:table-cell">Date</TableHead>
                <TableHead className="text-muted-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TableRow key={task.id} className="border-border">
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {task.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.category || 'Uncategorized'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-foreground text-sm">
                      {task.client?.name || task.client_name || 'Unknown'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {task.worker?.name || task.worker_name ? (
                        <span className="text-foreground">{task.worker?.name || task.worker_name}</span>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs gap-1 ${getStatusColor(task.status)}`} variant="outline">
                        {getStatusIcon(task.status)} {formatStatusLabel(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-foreground font-medium">
                      ${task.budget?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground text-sm">
                      {task.postedAt ? new Date(task.postedAt).toLocaleDateString() : 
                       task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'open')}>
                            Set Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}>
                            Set In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'completed')}>
                            Set Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'cancelled')}>
                            Cancel Task
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminTasks;