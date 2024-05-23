import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

const DeviceStatus = () => {
  const [poweredOnDevices, setPoweredOnDevices] = useState([]);
  const [poweredOffDevices, setPoweredOffDevices] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/device_status')
      .then(response => {
        setPoweredOnDevices(response.data.powered_on);
        setPoweredOffDevices(response.data.powered_off);
      })
      .catch(error => console.error('Error fetching device status:', error));
  }, []);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Device Status
      </Typography>
      <Typography variant="h5" component="h2">
        Powered On
      </Typography>
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
        <List>
          {poweredOnDevices.length > 0 ? (
            poweredOnDevices.map(device => (
              <ListItem key={device.imei} divider>
                <ListItemText primary={`IMEI: ${device.imei}`} />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1">No powered on devices found.</Typography>
          )}
        </List>
      </Paper>
      <Typography variant="h5" component="h2" style={{ marginTop: '24px' }}>
        Powered Off
      </Typography>
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
        <List>
          {poweredOffDevices.length > 0 ? (
            poweredOffDevices.map(device => (
              <ListItem key={device.imei} divider>
                <ListItemText primary={`IMEI: ${device.imei}`} />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1">No powered off devices found.</Typography>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default DeviceStatus;
