'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  UserPlus,
  Users,
  Store,
  Palette,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState('all');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'sales',
    phone: ''
  });

  const [editFormData, setEditFormData] = useState({
    email: '',
    full_name: '',
    role: '',
    phone: '',
    password: '',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users/all');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      // Fallback to fetching from different endpoints
      try {
        const [usersRes, designersRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/designers')
        ]);
        const allUsers = [...usersRes.data, ...designersRes.data];
        setUsers(allUsers);
      } catch (fallbackErr) {
        toast.error('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      await api.post('/admin/register-user', formData);
      const roleLabel = formData.role === 'admin' ? 'Admin' : formData.role === 'sales' ? 'Sales' : 'Design';
      toast.success(`${roleLabel} user created successfully!`);

      // Reset form
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'sales',
        phone: ''
      });
      setDialogOpen(false);

      // Refresh users list
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setProcessing(true);
    try {
      const updateData: any = {
        email: editFormData.email,
        full_name: editFormData.full_name,
        role: editFormData.role,
        phone: editFormData.phone,
        is_active: editFormData.is_active
      };

      // Only include password if it was changed
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      await api.put(`/admin/users/${editingUser.id}`, updateData);
      toast.success('User updated successfully!');

      setEditDialogOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update user');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete user';
      toast.error(errorMsg);
    } finally {
      setUserToDelete(null);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone || '',
      password: '',
      is_active: user.is_active
    });
    setEditDialogOpen(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'sales':
        return <Store className="h-4 w-4" />;
      case 'design':
        return <Palette className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: any = {
      admin: 'destructive',
      sales: 'default',
      design: 'secondary',
      owner: 'outline'
    };
    return (
      <Badge variant={colors[role] || 'outline'} className="capitalize">
        {getRoleIcon(role)}
        <span className="ml-1">{role}</span>
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500 text-white">
        <UserCheck className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-500 text-white">
        <UserX className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const filteredUsers = filterRole === 'all'
    ? users
    : users.filter(u => u.role === filterRole);

  const userStats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    sales: users.filter(u => u.role === 'sales').length,
    design: users.filter(u => u.role === 'design').length,
    owner: users.filter(u => u.role === 'owner').length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all system users and their roles</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.active} active, {userStats.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.admin}</div>
            <p className="text-xs text-muted-foreground mt-1">Administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Team</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.sales}</div>
            <p className="text-xs text-muted-foreground mt-1">Sales members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Design Team</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.design}</div>
            <p className="text-xs text-muted-foreground mt-1">Designers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shop Owners</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.owner}</div>
            <p className="text-xs text-muted-foreground mt-1">Owners</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user)}
                          disabled={user.role === 'admin'}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="sales">Sales Team</SelectItem>
                    <SelectItem value="design">Design Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Minimum 8 characters"
                  minLength={8}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit_role">Role</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="sales">Sales Team</SelectItem>
                    <SelectItem value="design">Design Team</SelectItem>
                    <SelectItem value="owner">Shop Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input
                  id="edit_full_name"
                  name="full_name"
                  value={editFormData.full_name}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_email">Email Address</Label>
                <Input
                  id="edit_email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_password">New Password (leave blank to keep current)</Label>
                <Input
                  id="edit_password"
                  name="password"
                  type="password"
                  value={editFormData.password}
                  onChange={handleEditInputChange}
                  placeholder="Enter new password or leave blank"
                />
              </div>

              <div>
                <Label htmlFor="edit_phone">Phone Number</Label>
                <Input
                  id="edit_phone"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  placeholder="Optional"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Account Status</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={editFormData.is_active}
                    onCheckedChange={(checked: boolean) =>
                      setEditFormData({ ...editFormData, is_active: checked })
                    }
                  />
                  <span className="text-sm">
                    {editFormData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}