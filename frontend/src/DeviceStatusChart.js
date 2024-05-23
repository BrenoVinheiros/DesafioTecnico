import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Container, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import io from 'socket.io-client';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DeviceStatusChart = () => {
  const [data, setData] = useState({
    labels: ['Powered On', 'Powered Off'],
    datasets: [
      {
        label: 'Devices',
        data: [0, 0],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  });
  const [poweredOnDevices, setPoweredOnDevices] = useState([]);
  const [poweredOffDevices, setPoweredOffDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedType, setSelectedType] = useState('');

  const fetchData = () => {
    axios.get('http://127.0.0.1:5000/device_status')
      .then(response => {
        const poweredOnCount = response.data.powered_on.length;
        const poweredOffCount = response.data.powered_off.length;

        setPoweredOnDevices(response.data.powered_on);
        setPoweredOffDevices(response.data.powered_off);

        setData({
          labels: ['Powered On', 'Powered Off'],
          datasets: [
            {
              label: 'Devices',
              data: [poweredOnCount, poweredOffCount],
              backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
              borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(error => console.error('Error fetching device status:', error));
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

  const handleClick = (event, elements) => {
    if (elements.length === 0) return;
    const { index } = elements[0];
    if (index === 0) {
      setSelectedDevices(poweredOnDevices);
      setSelectedType('Powered On');
    } else if (index === 1) {
      setSelectedDevices(poweredOffDevices);
      setSelectedType('Powered Off');
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Device Status
      </Typography>
      <Typography variant="body1" gutterBottom>
        Click on the bars to see the list of devices.
      </Typography>
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
        <Bar
          data={data}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Device Status (Powered On vs Powered Off)',
              },
            },
            onClick: handleClick,
          }}
        />
      </Paper>
      {selectedDevices.length > 0 && (
        <Paper elevation={3} style={{ padding: '16px', marginTop: '24px' }}>
          <Typography variant="h5" component="h2">
            {selectedType} Devices
          </Typography>
          <List>
            {selectedDevices.map(device => (
              <ListItem key={device.imei} divider>
                <ListItemText primary={`IMEI: ${device.imei}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default DeviceStatusChart;
