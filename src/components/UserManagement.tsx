'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Delete, PersonAdd } from '@mui/icons-material';
import { User, UserRole } from '../../types/user';
import { useForm, Controller } from 'react-hook-form';

interface UserFormData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

interface UserManagementProps {
  onClose: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, setValue, control, unregister } = useForm<UserFormData>({
    defaultValues: {
      isActive: true,
      role: 'pilot' // Default role to prevent controlled/uncontrolled error
    },
    mode: 'onChange'
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Get available roles based on current user's role
  const getAvailableRoles = (): UserRole[] => {
    if (session?.user.role === 'super_user') {
      return ['super_user', 'admin', 'pilot', 'accountant'];
    } else if (session?.user.role === 'admin') {
      return ['pilot', 'accountant'];
    }
    return [];
  };

  // Create user
  const handleCreateUser = async (data: UserFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      await fetchUsers();
      setCreateDialogOpen(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  // Update user
  const handleUpdateUser = async (data: Partial<UserFormData>) => {
    if (!selectedUser) return;

    console.log('Attempting to update user:', data);
    setSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: selectedUser.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      await fetchUsers();
      setEditDialogOpen(false);
      setSelectedUser(null);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle user active status
  const handleToggleActive = async (user: User) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: !user.isActive 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  // Delete user (soft delete)
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to deactivate ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    
    // Completely reset form and re-initialize for edit mode
    reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    });
    
    setEditDialogOpen(true);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_user': return 'error';
      case 'admin': return 'warning';
      case 'pilot': return 'primary';
      case 'accountant': return 'success';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value.replace('_', ' ').toUpperCase()} 
          color={getRoleColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'isActive',
      headerName: 'Active',
      width: 100,
      renderCell: (params) => (
        <Switch 
          checked={params.value} 
          onChange={() => handleToggleActive(params.row)}
          disabled={params.row.id === session?.user.id}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => {
        const actions = [];
        
        // Edit action
        if (session?.user.role === 'super_user' || 
            (session?.user.role === 'admin' && !['super_user', 'admin'].includes(params.row.role))) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              icon={<Edit />}
              label="Edit"
              onClick={() => handleEditClick(params.row)}
            />
          );
        }

        // Delete action (but not for own account)
        if (params.row.id !== session?.user.id &&
            (session?.user.role === 'super_user' || 
             (session?.user.role === 'admin' && !['super_user', 'admin'].includes(params.row.role)))) {
          actions.push(
            <GridActionsCellItem
              key="delete"
              icon={<Delete color="error" />}
              label="Delete"
              onClick={() => handleDeleteUser(params.row)}
            />
          );
        }

        return actions;
      },
    },
  ];

  if (!['super_user', 'admin'].includes(session?.user.role || '')) {
    return (
      <Alert severity="error">
        You don't have permission to access user management.
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '80vh', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">User Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => {
              setIsEditMode(false);
              reset(); // Reset form for create mode
              setCreateDialogOpen(true);
            }}
          >
            Create User
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 'calc(100% - 100px)', width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderRight: '1px solid rgba(224, 224, 224, 1)',
            },
          }}
        />
      </Paper>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleCreateUser)}>
          <DialogTitle>Create New User</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              {...register('firstName', { required: 'First name is required' })}
              label="First Name"
              fullWidth
              margin="normal"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              {...register('lastName', { required: 'Last name is required' })}
              label="Last Name"
              fullWidth
              margin="normal"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
            <TextField
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format'
                }
              })}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              autoComplete="off"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Controller
                name="role"
                control={control}
                defaultValue="pilot"
                rules={{ required: 'Role is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Role"
                    error={!!errors.role}
                  >
                    {getAvailableRoles().map((role) => (
                      <MenuItem key={role} value={role}>
                        {role.replace('_', ' ').toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submitted via onSubmit handler');
          console.log('Current form errors:', errors);
          console.log('Selected user:', selectedUser);
          console.log('Is edit mode:', isEditMode);
          
          const formData = new FormData(e.target as HTMLFormElement);
          console.log('Form data entries:', Object.fromEntries(formData.entries()));
          
          // For edit mode, manually collect and validate only the needed fields
          if (isEditMode) {
            // Get the checkbox value directly from the form state
            const checkboxElement = (e.target as HTMLFormElement).querySelector('input[type="checkbox"]') as HTMLInputElement;
            
            const editData = {
              email: formData.get('email') as string,
              firstName: formData.get('firstName') as string,
              lastName: formData.get('lastName') as string,
              role: formData.get('role') as UserRole,
              isActive: checkboxElement ? checkboxElement.checked : true
            };
            
            // Simple validation for edit mode
            if (!editData.email || !editData.firstName || !editData.lastName || !editData.role) {
              console.log('Edit form validation failed - missing required fields');
              return;
            }
            
            console.log('Edit form validated successfully, calling handleUpdateUser with:', editData);
            handleUpdateUser(editData);
          } else {
            // Use react-hook-form validation for create mode
            handleSubmit((data) => {
              console.log('Create form handleSubmit called with data:', data);
              handleCreateUser(data);
            }, (errors) => {
              console.log('Create form validation failed with errors:', errors);
            })(e);
          }
        }}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              {...register('firstName', { required: 'First name is required' })}
              label="First Name"
              fullWidth
              margin="normal"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              {...register('lastName', { required: 'Last name is required' })}
              label="Last Name"
              fullWidth
              margin="normal"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
            <TextField
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format'
                }
              })}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Controller
                name="role"
                control={control}
                defaultValue="pilot"
                rules={{ required: 'Role is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Role"
                    error={!!errors.role}
                  >
                    {getAvailableRoles().map((role) => (
                      <MenuItem key={role} value={role}>
                        {role.replace('_', ' ').toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Controller
                  name="isActive"
                  control={control}
                  defaultValue={true}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
              label="Active User"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setEditDialogOpen(false);
              setIsEditMode(false);
              reset();
            }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
