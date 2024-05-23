import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, Paper, Button, ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import TechnicalAssistanceForm from './TechnicalAssistanceForm';
import io from 'socket.io-client';

const DeviceFailures = () => {
  const [failedDevices, setFailedDevices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const fetchData = () => {
    axios.get('http://127.0.0.1:5000/device_failures')
      .then(response => {
        setFailedDevices(response.data);
      })
      .catch(error => console.error('Error fetching device failures:', error));
  };

  useEffect(() => {
    fetchData();

    const socket = io('http://127.0.0.1:5000'); // Conecte-se ao servidor SocketIO

    socket.on('new_data', (data) => {
      console.log('New data received:', data);
      // Atualizar os estados conforme necessário com os novos dados
      fetchData();
    });

    return () => {
      socket.disconnect(); // Desconectar o socket quando o componente for desmontado
    };
  }, []);

  const handleOpenTicket = (imei) => {
    setSelectedDevice({ imei });
    setOpenForm(true);
  };

  const handleOpenDialog = (device) => {
    setSelectedDevice(device);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDevice(null);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedDevice(null);
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Device Failures
      </Typography>
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
        <List>
          {failedDevices.length > 0 ? (
            failedDevices.map(device => (
              <ListItem key={device.imei} divider>
                <ListItemText 
                  primary={`IMEI: ${device.imei}`} 
                  secondary={`Error: ${device.valor} - Timestamp: ${device.timestamp}`} 
                />
                <ListItemSecondaryAction>
                  {device.valor.includes('errorCode=BAD_CONFIGURATION') && (
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={() => handleOpenTicket(device.imei)}
                    >
                      Open Ticket
                    </Button>
                  )}
                  {device.valor.includes('errorCode=MEMORY_FAILURE') && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog(device)}
                    >
                      Suggested Actions
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))
          ) : (
            <Typography variant="body1">No device failures found.</Typography>
          )}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Suggested Actions for IMEI: {selectedDevice?.imei}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            <strong>Reinicialização do Dispositivo:</strong>
            <ul>
              <li>Primeira ação recomendada é reiniciar o dispositivo IoT.</li>
              <li>Verifique se o problema persiste após a reinicialização.</li>
            </ul>
            <strong>Verificação de Logs:</strong>
            <ul>
              <li>Acesse os logs do dispositivo para identificar o momento exato e a causa do erro de memória.</li>
              <li>Procure por picos de uso de memória ou processos que possam estar consumindo recursos excessivamente.</li>
            </ul>
            <strong>Limpeza de Recursos:</strong>
            <ul>
              <li>Verifique se há processos ou serviços em execução que possam ser interrompidos para liberar memória.</li>
              <li>Limpe caches e dados temporários, se aplicável.</li>
            </ul>
            <strong>Atualização de Firmware:</strong>
            <ul>
              <li>Verifique se há atualizações de firmware disponíveis para o dispositivo.</li>
              <li>Atualize para a versão mais recente, que pode conter melhorias de desempenho e correções de bugs.</li>
            </ul>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {selectedDevice && (
        <TechnicalAssistanceForm 
          open={openForm} 
          handleClose={handleCloseForm} 
          imei={selectedDevice.imei} 
        />
      )}
    </Container>
  );
};

export default DeviceFailures;
