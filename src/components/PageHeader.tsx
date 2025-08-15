'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  monthlyTotal: number;
  totalHours?: number;
  aircraftRegistration?: string;
  selectedFlightsCount: number;
  isDarkMode: boolean;
  loading: boolean;
  bulkDeleting: boolean;
  onToggleTheme: () => void;
  onCreateFlight: () => void;
  onBulkDelete: () => void;
  onEditAircraft?: () => void;
  onOpenUserManagement?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  monthlyTotal,
  totalHours,
  aircraftRegistration,
  selectedFlightsCount,
  isDarkMode,
  loading,
  bulkDeleting,
  onToggleTheme,
  onCreateFlight,
  onBulkDelete,
  onEditAircraft,
  onOpenUserManagement,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
    handleUserMenuClose();
  };

  const handleUserManagement = () => {
    onOpenUserManagement?.();
    handleUserMenuClose();
  };

  const getUserInitials = () => {
    if (!session?.user) return '';
    const firstName = session.user.firstName || '';
    const lastName = session.user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  return (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
      <Box>
        <Typography variant="h4" component="h1">
          Pilot Flight Tracker {aircraftRegistration && `- ${aircraftRegistration}`}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="h6" color="text.secondary">
            This months usage: {monthlyTotal.toFixed(2)} hours
          </Typography>
          {totalHours !== undefined && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Total aircraft hours: {totalHours.toFixed(2)}
            </Typography>
          )}
          {session?.user && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Logged in as: {session.user.firstName} {session.user.lastName} ({session.user.role.replace('_', ' ')})
            </Typography>
          )}
        </Box>
        <Box sx={{ height: '56px', mt: 2, display: 'flex', alignItems: 'flex-start' }}>
          {selectedFlightsCount > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? 'Deleting...' : `Delete ${selectedFlightsCount} Flight${selectedFlightsCount > 1 ? 's' : ''}`}
            </Button>
          )}
        </Box>
      </Box>
      <Box display="flex" gap={2} alignItems="center">
        <IconButton onClick={onToggleTheme} color="inherit">
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        {onEditAircraft && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEditAircraft}
            disabled={loading}
          >
            Edit Aircraft
          </Button>
        )}
        {['super_user', 'admin'].includes(session?.user.role || '') && onOpenUserManagement && (
          <Button
            variant="outlined"
            startIcon={<PeopleIcon />}
            onClick={handleUserManagement}
            disabled={loading}
          >
            Users
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateFlight}
          disabled={loading}
        >
          Add New Flight
        </Button>
        
        {/* User Menu */}
        <Tooltip title="User Menu">
          <IconButton onClick={handleUserMenuClick} sx={{ p: 0 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
              {getUserInitials()}
            </Avatar>
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {['super_user', 'admin'].includes(session?.user.role || '') && (
            <MenuItem onClick={handleUserManagement}>
              <PeopleIcon sx={{ mr: 1 }} />
              User Management
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};