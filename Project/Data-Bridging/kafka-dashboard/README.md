# PMU Synchronization Dashboard

A real-time dashboard for monitoring PMU (Phasor Measurement Unit) data from Kafka/Redpanda topics, displaying 3-phase voltage phasor diagrams for grid synchronization analysis.

## Features

- Real-time data consumption from Kafka/Redpanda topics (gridPMU and microgridPMU)
- WebSocket-based data streaming to frontend
- Interactive 3-phase voltage phasor plot using Plotly.js
- Synchronization analysis with phase angle and magnitude differences
- Responsive design with connection status monitoring

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redpanda/     │    │   Express.js    │    │   React.js      │
│   Kafka         │───▶│   Backend       │───▶│   Frontend      │
│   (gridPMU,     │    │   (WebSocket    │    │   (Phasor Plot) │
│   microgridPMU) │    │   Server)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Kafka/Redpanda running locally or accessible remotely

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   KAFKA_BROKER=localhost:9092
   PORT=3001
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000` and will automatically connect to the backend WebSocket server.

## Data Format

The application expects PMU data in the following JSON format:

```json
{
  "pmu_id": 2,
  "time": 1752652829.4,
  "stream_id_a": 1,
  "stream_id_b": 2,
  "stream_id_c": 3,
  "stat_a": "ok",
  "stat_b": "ok",
  "stat_c": "ok",
  "va_mag": 219.99650000000003,
  "vb_mag": 219.99650000000003,
  "vc_mag": 219.99650000000003,
  "va_ang": 28.358900000000002,
  "vb_ang": -99.39340000000001,
  "vc_ang": 156.1173,
  "ia_mag": 0,
  "ib_mag": 0,
  "ic_mag": 0,
  "ia_ang": 0,
  "ib_ang": 0,
  "ic_ang": 0,
  "frequency_a": 50.1,
  "frequency_b": 50.1,
  "frequency_c": 50.1,
  "rocof_a": 0,
  "rocof_b": 0,
  "rocof_c": 0,
  "Pa": 0,
  "Pb": 0,
  "Pc": 0,
  "Qa": 0,
  "Qb": 0,
  "Qc": 0,
  "P_total": 0,
  "Q_total": 0
}
```

## Kafka Topics

The application subscribes to two Kafka topics:
- `gridPMU`: Main grid PMU data
- `microgridPMU`: Microgrid PMU data

## API Endpoints

### Backend REST API

- `GET /health` - Health check endpoint
- `GET /api/latest` - Get latest PMU data from both topics

### WebSocket

- `ws://localhost:3001` - WebSocket endpoint for real-time data streaming

## Phasor Plot Features

- **Grid PMU**: Solid lines with circular markers
- **Microgrid PMU**: Dashed lines with square markers
- **Phase Colors**: 
  - Phase A: Red (#FF6B6B)
  - Phase B: Teal (#4ECDC4)
  - Phase C: Blue (#45B7D1)
- **Reference Circles**: Voltage magnitude reference lines (100V, 150V, 200V, 250V)
- **Synchronization Analysis**: Real-time calculation of phase angle and magnitude differences

## Troubleshooting

1. **WebSocket Connection Issues**:
   - Ensure the backend server is running on port 3001
   - Check firewall settings
   - Verify the WebSocket URL in the frontend

2. **No Data Received**:
   - Verify Kafka/Redpanda is running
   - Check topic names match exactly: `gridPMU` and `microgridPMU`
   - Ensure data is being published to the topics
   - Check backend logs for connection errors

3. **Plot Not Updating**:
   - Check browser console for JavaScript errors
   - Verify WebSocket connection status
   - Ensure data format matches expected JSON structure

## Development

To extend the application:

1. **Add New Topics**: Modify the `topics` array in `backend/server.js`
2. **Customize Plot**: Edit the `PhasorPlot` component in `frontend/src/components/PhasorPlot.js`
3. **Add Data Processing**: Extend the message handler in the backend Kafka consumer
4. **Styling**: Modify `frontend/src/App.css` for UI customization

## Production Deployment

For production deployment:

1. Build the React frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve the built files using the Express backend or a dedicated web server
3. Configure environment variables for production Kafka brokers
4. Set up process managers like PM2 for the backend
5. Configure reverse proxy (nginx) for load balancing and SSL
