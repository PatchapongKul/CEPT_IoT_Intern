import React from 'react';

const ConnectionStatus = ({ status, lastUpdate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'status-connected';
      case 'disconnected':
        return 'status-disconnected';
      case 'error':
        return 'status-error';
      default:
        return 'status-disconnected';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="connection-status">
      <div className={`status-indicator ${getStatusColor(status)}`}></div>
      <span>{getStatusText(status)}</span>
      {lastUpdate && (
        <span> | Last Update: {formatLastUpdate(lastUpdate)}</span>
      )}
    </div>
  );
};

export default ConnectionStatus;
