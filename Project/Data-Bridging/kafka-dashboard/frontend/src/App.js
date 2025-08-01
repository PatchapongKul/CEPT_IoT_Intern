import React, { useState, useEffect } from 'react';
import PhasorPlot from './components/PhasorPlot';
import ConnectionStatus from './components/ConnectionStatus';
import DataDisplay from './components/DataDisplay';
import './App.css';

const App = () => {
  const [wsConnection, setWsConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [gridData, setGridData] = useState(null);
  const [microgridData, setMicrogridData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:3001');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        setWsConnection(ws);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          
          if (message.type === 'data') {
            if (message.gridPMU) {
              setGridData(message.gridPMU);
            }
            if (message.microgridPMU) {
              setMicrogridData(message.microgridPMU);
            }
            setLastUpdate(new Date().toISOString());
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        setWsConnection(null);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };
    };

    connectWebSocket();

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>PMU Synchronization Dashboard</h1>
        <ConnectionStatus status={connectionStatus} lastUpdate={lastUpdate} />
      </header>
      
      <main className="App-main">
        <div className="dashboard-container">
          <div className="plot-container">
            <PhasorPlot 
              gridData={gridData} 
              microgridData={microgridData} 
            />
          </div>
          
          <div className="data-container">
            <DataDisplay 
              gridData={gridData} 
              microgridData={microgridData} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
