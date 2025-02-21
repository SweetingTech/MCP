import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { apiClient } from '../api/client';
import { McpServerConfig, ServerStatus } from '../api/types';

const DEFAULT_STATUS: ServerStatus = {
  name: '',
  status: 'stopped',
  tools: []
};

export function ServerList() {
  const [servers, setServers] = useState<Record<string, McpServerConfig>>({});
  const [statuses, setStatuses] = useState<Record<string, ServerStatus>>({});
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    command: string;
    args: string;
    env: string;
  }>({
    name: '',
    command: '',
    args: '',
    env: '',
  });

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const response = await apiClient.getServers();
      if (response.success && response.data) {
        setServers(response.data);
        // Load status for each server
        Object.keys(response.data).forEach(loadServerStatus);
      }
    } catch (error) {
      setError('Failed to load servers');
      console.error('Load servers error:', error);
    }
  };

  const loadServerStatus = async (name: string) => {
    try {
      const response = await apiClient.getServerStatus(name);
      if (response.success && response.data) {
        setStatuses(prev => ({
          ...prev,
          [name]: {
            ...DEFAULT_STATUS,
            ...response.data,
            name
          }
        }));
      }
    } catch (error) {
      console.error(`Failed to load status for ${name}:`, error);
      setStatuses(prev => ({
        ...prev,
        [name]: { ...DEFAULT_STATUS, name, status: 'error' }
      }));
    }
  };

  const handleAddServer = async () => {
    try {
      const config: McpServerConfig = {
        command: formData.command,
        args: formData.args.split(' ').filter(Boolean),
        env: formData.env ? JSON.parse(formData.env) : undefined,
      };

      const response = await apiClient.addServer({
        name: formData.name,
        config,
      });

      if (response.success) {
        setIsAddDialogOpen(false);
        loadServers();
        resetForm();
      }
    } catch (error) {
      setError('Failed to add server');
      console.error('Add server error:', error);
    }
  };

  const handleEditServer = async () => {
    if (!selectedServer) return;

    try {
      const config: Partial<McpServerConfig> = {
        command: formData.command,
        args: formData.args.split(' ').filter(Boolean),
        env: formData.env ? JSON.parse(formData.env) : undefined,
      };

      const response = await apiClient.updateServer(selectedServer, {
        name: selectedServer,
        config,
      });

      if (response.success) {
        setIsEditDialogOpen(false);
        loadServers();
        resetForm();
      }
    } catch (error) {
      setError('Failed to update server');
      console.error('Update server error:', error);
    }
  };

  const handleDeleteServer = async (name: string) => {
    try {
      const response = await apiClient.deleteServer(name);
      if (response.success) {
        loadServers();
      }
    } catch (error) {
      setError('Failed to delete server');
      console.error('Delete server error:', error);
    }
  };

  const handleToggleServer = async (name: string, isEnabled: boolean) => {
    try {
      const response = isEnabled
        ? await apiClient.disableServer(name)
        : await apiClient.enableServer(name);
      
      if (response.success) {
        loadServers();
      }
    } catch (error) {
      setError(`Failed to ${isEnabled ? 'disable' : 'enable'} server`);
      console.error('Toggle server error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      command: '',
      args: '',
      env: '',
    });
    setSelectedServer(null);
  };

  const getServerStatus = (name: string): ServerStatus => {
    return statuses[name] || { ...DEFAULT_STATUS, name };
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">MCP Servers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Server
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {Object.entries(servers).map(([name, config]) => {
          const status = getServerStatus(name);
          return (
            <Grid item xs={12} key={name}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{name}</Typography>
                      <Typography color="textSecondary" gutterBottom>
                        {config.command} {config.args.join(' ')}
                      </Typography>
                      <Chip
                        label={status.status}
                        color={
                          status.status === 'running'
                            ? 'success'
                            : status.status === 'error'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </Box>
                    <Box>
                      <IconButton
                        onClick={() => handleToggleServer(name, !config.disabled)}
                        color={config.disabled ? 'primary' : 'error'}
                      >
                        {config.disabled ? <StartIcon /> : <StopIcon />}
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setSelectedServer(name);
                          setFormData({
                            name,
                            command: config.command,
                            args: config.args.join(' '),
                            env: config.env ? JSON.stringify(config.env, null, 2) : '',
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteServer(name)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isAddDialogOpen ? 'Add New Server' : 'Edit Server'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {isAddDialogOpen && (
              <TextField
                fullWidth
                label="Server Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              fullWidth
              label="Command"
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Arguments"
              value={formData.args}
              onChange={(e) => setFormData({ ...formData, args: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Environment Variables (JSON)"
              value={formData.env}
              onChange={(e) => setFormData({ ...formData, env: e.target.value })}
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={isAddDialogOpen ? handleAddServer : handleEditServer}
            variant="contained"
          >
            {isAddDialogOpen ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
