// AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, MoreHorizontal, UserPlus, Filter, Download, Loader2, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Redux actions
import { fetchUsers, updateUserStatus, deleteUser } from '@/features/admin/adminSlice';
import { addToast } from '@/features/notifications/notificationsSlice';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error, pagination } = useSelector((state) => state.admin);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Fetch users on component mount and when filters change
  useEffect(() => {
    dispatch(fetchUsers({ 
      page: currentPage, 
      search: searchQuery 
    }));
  }, [dispatch, currentPage, searchQuery]);

  // Apply role filter locally after fetching
  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role?.toLowerCase() === roleFilter;
    return matchesRole;
  });

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await dispatch(updateUserStatus({ userId, status: newStatus })).unwrap();
      dispatch(addToast({
        message: `User status updated to ${newStatus}`,
        type: 'success'
      }));
    } catch (error) {
      dispatch(addToast({
        message: error || 'Failed to update user status',
        type: 'error'
      }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        dispatch(addToast({
          message: 'User deleted successfully',
          type: 'success'
        }));
      } catch (error) {
        dispatch(addToast({
          message: error || 'Failed to delete user',
          type: 'error'
        }));
      }
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Active') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (status === 'Suspended') return 'bg-destructive/10 text-destructive border-destructive/20';
    if (status === 'Pending') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  // Calculate stats from fetched users
  const stats = {
    totalUsers: pagination?.total || 0,
    active: users.filter(u => u.status === 'Active').length,
    suspended: users.filter(u => u.status === 'Suspended').length,
    pending: users.filter(u => u.status === 'Pending').length,
  };

  // Loading state
  if (isLoading && users.length === 0) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error && users.length === 0) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Error loading users: {error}</p>
            <Button onClick={() => dispatch(fetchUsers({ page: currentPage, search: searchQuery }))}>
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers.toLocaleString() },
          { label: 'Active', value: stats.active.toLocaleString() },
          { label: 'Suspended', value: stats.suspended.toLocaleString() },
          { label: 'Pending', value: stats.pending.toLocaleString() },
        ].map(s => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">All Users</CardTitle>
              <CardDescription>Manage and monitor platform users</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-9 bg-muted border-border" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
              <select
                className="h-10 px-3 rounded-md border border-border bg-muted text-sm text-foreground"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="client">Client</option>
                <option value="worker">Worker</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-muted-foreground hidden sm:table-cell">Tasks</TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">Revenue</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-muted-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'worker' ? 'secondary' : 'outline'} className="text-xs">
                        {user.role === 'worker' ? 'Worker' : 'Client'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-foreground">
                      {user.tasks_count || user.tasks?.length || 0}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-foreground">
                      ${(user.total_earnings || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(user.status)}`} variant="outline">
                        {user.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(user.id, 'Active')}>
                            Set Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(user.id, 'Suspended')}>
                            Suspend User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(user.id, 'Pending')}>
                            Set Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination?.lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {pagination.lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(pagination.lastPage, p + 1))}
                disabled={currentPage === pagination.lastPage || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsers;