const express = require('express');
const WebSocket = require('ws');
const { Kafka } = require('kafkajs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = require('http').createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Kafka configuration
const kafka = new Kafka({
  clientId: 'pmu-dashboard',
  brokers: [process.env.KAFKA_BROKER || '192.168.38.136:9092']
});

const consumer = kafka.consumer({ groupId: 'pmu-dashboard-group' });

// Store latest data for each topic
const latestData = {
  gridPMU: null,
  microgridPMU: null
};

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  // Send latest data to newly connected client
  if (latestData.gridPMU || latestData.microgridPMU) {
    ws.send(JSON.stringify({
      type: 'data',
      gridPMU: latestData.gridPMU,
      microgridPMU: latestData.microgridPMU
    }));
  }

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast data to all connected clients
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Kafka consumer setup
const setupKafkaConsumer = async () => {
  try {
    await consumer.connect();
    console.log('Connected to Kafka');

    await consumer.subscribe({ 
      topics: ['gridPMU', 'microgridPMU'],
      fromBeginning: false 
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          console.log(`Received from ${topic}:`, data);

          // Store latest data
          if (topic === 'gridPMU') {
            latestData.gridPMU = data;
          } else if (topic === 'microgridPMU') {
            latestData.microgridPMU = data;
          }

          // Broadcast to WebSocket clients
          broadcast({
            type: 'data',
            topic: topic,
            data: data,
            gridPMU: latestData.gridPMU,
            microgridPMU: latestData.microgridPMU
          });

        } catch (error) {
          console.error('Error parsing message:', error);
        }
      },
    });

  } catch (error) {
    console.error('Error setting up Kafka consumer:', error);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connections: wss.clients.size,
    latestData: {
      gridPMU: latestData.gridPMU ? 'available' : 'no data',
      microgridPMU: latestData.microgridPMU ? 'available' : 'no data'
    }
  });
});

// Get latest data endpoint
app.get('/api/latest', (req, res) => {
  res.json({
    gridPMU: latestData.gridPMU,
    microgridPMU: latestData.microgridPMU
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  setupKafkaConsumer();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await consumer.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await consumer.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
