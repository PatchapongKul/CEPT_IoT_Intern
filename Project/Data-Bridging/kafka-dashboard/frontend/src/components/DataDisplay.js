import React from 'react';

const DataDisplay = ({ gridData, microgridData }) => {
  const formatValue = (value, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return typeof value === 'number' ? value.toFixed(decimals) : value;
  };

  const calculatePhaseAngleDifference = (gridData, microgridData) => {
    if (!gridData || !microgridData) return null;
    
    const gridAngles = [gridData.va_ang, gridData.vb_ang, gridData.vc_ang];
    const microgridAngles = [microgridData.va_ang, microgridData.vb_ang, microgridData.vc_ang];
    
    return gridAngles.map((gridAngle, index) => {
      let diff = gridAngle - microgridAngles[index];
      // Normalize to -180 to 180 range
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      return diff;
    });
  };

  const calculateMagnitudeDifference = (gridData, microgridData) => {
    if (!gridData || !microgridData) return null;
    
    const gridMags = [gridData.va_mag, gridData.vb_mag, gridData.vc_mag];
    const microgridMags = [microgridData.va_mag, microgridData.vb_mag, microgridData.vc_mag];
    
    return gridMags.map((gridMag, index) => gridMag - microgridMags[index]);
  };

  const phaseDifferences = calculatePhaseAngleDifference(gridData, microgridData);
  const magnitudeDifferences = calculateMagnitudeDifference(gridData, microgridData);

  return (
    <div className="data-display">
      <h2>Real-time PMU Data</h2>
      
      {/* Grid PMU Data */}
      <div className="data-section">
        <h3>Grid PMU {gridData ? `(ID: ${gridData.pmu_id})` : ''}</h3>
        {gridData ? (
          <div className="data-grid">
            <div className="data-item">
              <span className="data-label">Va Magnitude:</span>
              <span className="data-value">{formatValue(gridData.va_mag)} V</span>
            </div>
            <div className="data-item">
              <span className="data-label">Va Angle:</span>
              <span className="data-value">{formatValue(gridData.va_ang)}°</span>
            </div>
            <div className="data-item">
              <span className="data-label">Vb Magnitude:</span>
              <span className="data-value">{formatValue(gridData.vb_mag)} V</span>
            </div>
            <div className="data-item">
              <span className="data-label">Vb Angle:</span>
              <span className="data-value">{formatValue(gridData.vb_ang)}°</span>
            </div>
            <div className="data-item">
              <span className="data-label">Vc Magnitude:</span>
              <span className="data-value">{formatValue(gridData.vc_mag)} V</span>
            </div>
            <div className="data-item">
              <span className="data-label">Vc Angle:</span>
              <span className="data-value">{formatValue(gridData.vc_ang)}°</span>
            </div>
            <div className="data-item">
              <span className="data-label">Frequency A:</span>
              <span className="data-value">{formatValue(gridData.frequency_a)} Hz</span>
            </div>
            <div className="data-item">
              <span className="data-label">Timestamp:</span>
              <span className="data-value">{formatValue(gridData.time)}</span>
            </div>
          </div>
        ) : (
          <div className="no-data">No grid data available</div>
        )}
      </div>

      {/* Microgrid PMU Data */}
      <div className="data-section">
        <h3>Microgrid PMU {microgridData ? `(ID: ${microgridData.pmu_id})` : ''}</h3>
        {microgridData ? (
          <div className="data-grid">
            <div className="data-item">
              <span className="data-label">Va Magnitude:</span>
              <span className="data-value">{formatValue(microgridData.va_mag)} V</span>
            </div>
            <div className="data-item">
              <span className="data-label">Va Angle:</span>
              <span className="data-value">{formatValue(microgridData.va_ang)}°</span>
            </div>
            <div className="data-item">
              <span className="data-label">Vb Magnitude:</span>
              <span className="data-value">{formatValue(microgridData.vb_mag)} V</span>
            </div>
            <div className="data-item">
              <span className="data-label">Vb Angle:</span>
              <span className="data-value">{formatValue(microgridData.vb_ang)}°</span>
            </div>
            <div className="data-item">
              <span className="data-label">Vc Magnitude:</span>
              <span className="data-value">{formatValue(microgridData.vc_mag)} V</span>
            </div>
            <div className="data-item">
              <span className="data-label">Vc Angle:</span>
              <span className="data-value">{formatValue(microgridData.vc_ang)}°</span>
            </div>
            <div className="data-item">
              <span className="data-label">Frequency A:</span>
              <span className="data-value">{formatValue(microgridData.frequency_a)} Hz</span>
            </div>
            <div className="data-item">
              <span className="data-label">Timestamp:</span>
              <span className="data-value">{formatValue(microgridData.time)}</span>
            </div>
          </div>
        ) : (
          <div className="no-data">No microgrid data available</div>
        )}
      </div>

      {/* Synchronization Analysis */}
      {phaseDifferences && magnitudeDifferences && (
        <div className="data-section">
          <h3>Synchronization Analysis</h3>
          <div className="data-grid">
            <div className="data-item">
              <span className="data-label">Phase A Angle Diff:</span>
              <span className="data-value">{formatValue(phaseDifferences[0])}°</span>
            </div>
            <div className="data-item">
              <span className="data-label">Phase A Mag Diff:</span>
              <span className="data-value">{formatValue(magnitudeDifferences[0])} V</span>
            </div>
            <div className="data-item">
              <span className="data-label">Phase B Angle Diff:</span>
              <span className="data-value">{formatValue(phaseDifferences[1])}°</span>
            </div>
            <div className="data-item">
              <span className="data-label">Phase B Mag Diff:</span>
              <span className="data-value">{formatValue(magnitudeDifferences[1])} V</span>
            </div>
            <div className="data-item">
              <span className="data-label">Phase C Angle Diff:</span>
              <span className="data-value">{formatValue(phaseDifferences[2])}°</span>
            </div>
            <div className="data-item">
              <span className="data-label">Phase C Mag Diff:</span>
              <span className="data-value">{formatValue(magnitudeDifferences[2])} V</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDisplay;