import { Box, AppBar, Toolbar, Typography, Container, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            MCP Server Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper' }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            MCP Server Manager © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
