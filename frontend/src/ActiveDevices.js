import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Container, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

const ActiveDevices = () => {
  const [activeDevices, setActiveDevices] = useState([]);

  useEffect(() => {
    // Conecte-se ao servidor WebSocket
    const socket = io('http://127.0.0.1:5000');

    // Função para atualizar a lista de dispositivos ativos
    const updateActiveDevices = (devices) => {
      console.log("Received active devices:", devices);
      setActiveDevices(devices);
    };

    // Receber a lista de dispositivos ativos inicial
    socket.emit('request_active_devices');

    // Ouvir por atualizações na lista de dispositivos ativos
    socket.on('active_devices', updateActiveDevices);

    // Limpeza na desmontagem do componente
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Active Devices (last 30 minutes)
      </Typography>
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
        <List>
          {activeDevices.length > 0 ? (
            activeDevices.map(device => (
              <ListItem key={device.imei} divider>
                <ListItemText primary={`IMEI: ${device.imei}`} />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1">No active devices found.</Typography>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default ActiveDevices;
