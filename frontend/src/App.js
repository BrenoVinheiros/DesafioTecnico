import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Grid, Button, Card, CardContent, CardActions } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import ActiveDevices from './ActiveDevices';
import InactiveDevices from './InactiveDevices';
import DeviceStatusChart from './DeviceStatusChart';
import DeviceFailures from './DeviceFailures';
import { styled } from '@mui/system';

const CardStyled = styled(Card)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  margin: '16px',
  textAlign: 'center',
  borderRadius: '16px',
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)',
  backgroundColor: '#ffffff',
  height: '100%', // Ensures all cards are the same height
});

const IconStyled = styled('div')(({ color }) => ({
  fontSize: '4rem',
  marginBottom: '16px',
  color: color,
}));

function Home() {
  return (
    <Container maxWidth="lg" sx={{ mt: 5, textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to the IoT Home Care Dashboard
      </Typography>
      <Typography variant="h6" component="p" gutterBottom>
        Use the navigation bar to explore the available devices and their statuses.
      </Typography>
      <Grid container spacing={4} sx={{ mt: 5 }} justifyContent="center">
        <Grid item xs={12} sm={6} md={3}>
          <CardStyled>
            <IconStyled color="#F44336">
              <PowerOffIcon fontSize="inherit" />
            </IconStyled>
            <CardContent>
              <Typography variant="h5" component="h2">
                Inactive Devices
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="secondary" component={Link} to="/inactive_devices">
                Go to Inactive Devices
              </Button>
            </CardActions>
          </CardStyled>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardStyled>
            <IconStyled color="#2196F3">
              <DevicesIcon fontSize="inherit" />
            </IconStyled>
            <CardContent>
              <Typography variant="h5" component="h2">
                Active Devices
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="primary" component={Link} to="/active_devices">
                Go to Active Devices
              </Button>
            </CardActions>
          </CardStyled>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardStyled>
            <IconStyled color="#FF9800">
              <WarningIcon fontSize="inherit" />
            </IconStyled>
            <CardContent>
              <Typography variant="h5" component="h2">
                Device Status
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="warning" component={Link} to="/device_status">
                Go to Device Status
              </Button>
            </CardActions>
          </CardStyled>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardStyled>
            <IconStyled color="#4CAF50">
              <ErrorIcon fontSize="inherit" />
            </IconStyled>
            <CardContent>
              <Typography variant="h5" component="h2">
                Device Failures
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="success" component={Link} to="/device_failures">
                Go to Device Failures
              </Button>
            </CardActions>
          </CardStyled>
        </Grid>
      </Grid>
    </Container>
  );
}

function App() {
  return (
    <Router>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            IoT Home Care Dashboard
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/active_devices">Active Devices</Button>
          <Button color="inherit" component={Link} to="/inactive_devices">Inactive Devices</Button>
          <Button color="inherit" component={Link} to="/device_status">Device Status</Button>
          <Button color="inherit" component={Link} to="/device_failures">Device Failures</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 3 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/active_devices" element={<ActiveDevices />} />
          <Route path="/inactive_devices" element={<InactiveDevices />} />
          <Route path="/device_status" element={<DeviceStatusChart />} />
          <Route path="/device_failures" element={<DeviceFailures />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
