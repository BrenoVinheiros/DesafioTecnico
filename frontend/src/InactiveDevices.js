import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import io from 'socket.io-client';

const InactiveDevices = () => {
  const [inactiveDevices, setInactiveDevices] = useState([]);
  const [warningDevices, setWarningDevices] = useState([]);
  const [criticalDevices, setCriticalDevices] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/inactive_devices')
      .then(response => {
        setInactiveDevices(response.data.inactive);
        setWarningDevices(response.data.warning);
        setCriticalDevices(response.data.critical);
      })
      .catch(error => console.error('Error fetching inactive devices:', error));

    const socket = io('http://127.0.0.1:5000'); // Conecte-se ao servidor SocketIO

    socket.on('new_data', (data) => {
      console.log('New data received:', data);
      // Atualizar os estados conforme necessário com os novos dados
      axios.get('http://127.0.0.1:5000/inactive_devices')
        .then(response => {
          setInactiveDevices(response.data.inactive);
          setWarningDevices(response.data.warning);
          setCriticalDevices(response.data.critical);
        })
        .catch(error => console.error('Error fetching inactive devices:', error));
    });

    return () => {
      socket.disconnect(); // Desconectar o socket quando o componente for desmontado
    };
  }, []);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Inactive Devices
      </Typography>
      <Typography variant="h5" component="h2">
        Inactive (not reported in last 30 minutes)
      </Typography>
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
        <List>
          {inactiveDevices.length > 0 ? (
            inactiveDevices.map(device => (
              <ListItem key={device.imei} divider>
                <ListItemText primary={`IMEI: ${device.imei} - Last seen: ${device.last_seen} - Minutes inactive: ${Math.floor(device.minutes_inactive)}`} />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1">No inactive devices found.</Typography>
          )}
        </List>
      </Paper>
      <Typography variant="h5" component="h2" style={{ marginTop: '24px' }}>
        Warning (not reported in last 24-48 hours)
      </Typography>
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
        <List>
          {warningDevices.length > 0 ? (
            warningDevices.map(device => (
              <ListItem key={device.imei} divider>
                <ListItemText primary={`IMEI: ${device.imei} - Last seen: ${device.last_seen} - Minutes inactive: ${Math.floor(device.minutes_inactive)}`} />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1">No warning devices found.</Typography>
          )}
        </List>
      </Paper>
      <Typography variant="h5" component="h2" style={{ marginTop: '24px' }}>
        Critical (not reported in over 48 hours)
      </Typography>
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
        <List>
          {criticalDevices.length > 0 ? (
            criticalDevices.map(device => (
              <ListItem key={device.imei} divider>
                <ListItemText primary={`IMEI: ${device.imei} - Last seen: ${device.last_seen} - Minutes inactive: ${Math.floor(device.minutes_inactive)}`} />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1">No critical devices found.</Typography>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default InactiveDevices;
