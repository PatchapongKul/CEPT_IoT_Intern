import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

const PhasorPlot = ({ gridData, microgridData }) => {
  const plotData = useMemo(() => {
    const traces = [];

    // Add a helper to format angle in degrees (Plotly polar uses degrees)
    const formatPolarTrace = ({ name, mag, ang, color, dash = 'solid', symbol = 'circle' }) => ({
      r: [0, mag],
      theta: [0, ang],
      mode: 'lines+markers',
      type: 'scatterpolar',
      name,
      line: {
        color,
        width: 3,
        dash
      },
      marker: {
        size: 8,
        color,
        symbol
      }
    });

    // Grid PMU data
    if (gridData) {
      const gridPhases = [
        { name: 'Grid Va', mag: gridData.va_mag, ang: gridData.va_ang, color: '#FF0000' },  // Red
        { name: 'Grid Vb', mag: gridData.vb_mag, ang: gridData.vb_ang, color: '#FFD700' },  // Yellow
        { name: 'Grid Vc', mag: gridData.vc_mag, ang: gridData.vc_ang, color: '#0000FF' }   // Blue
      ];
      gridPhases.forEach(phase => {
        traces.push(formatPolarTrace(phase));
      });
    }

    // Microgrid PMU data
    if (microgridData) {
      const microgridPhases = [
        { name: 'Microgrid Va', mag: microgridData.va_mag, ang: microgridData.va_ang, color: '#FF0000', dash: 'dash', symbol: 'square' },
        { name: 'Microgrid Vb', mag: microgridData.vb_mag, ang: microgridData.vb_ang, color: '#FFD700', dash: 'dash', symbol: 'square' },
        { name: 'Microgrid Vc', mag: microgridData.vc_mag, ang: microgridData.vc_ang, color: '#0000FF', dash: 'dash', symbol: 'square' }
      ];
      microgridPhases.forEach(phase => {
        traces.push(formatPolarTrace(phase));
      });
    }

    return traces;
  }, [gridData, microgridData]);

  const layout = {
    title: {
      text: '3-Phase Voltage Phasor Diagram',
      font: { size: 18 }
    },
    polar: {
      radialaxis: {
        // title: 'Magnitude (V)',
        range: [0, 300],
        gridcolor: '#F0F0F0'
      },
      angularaxis: {
        direction: 'counterclockwise',
        rotation: 0,
        gridcolor: '#F0F0F0'
      },
      bgcolor: 'white'
    },
    paper_bgcolor: 'white',
    showlegend: true,
    legend: {
      x: 1.05,
      y: 1,
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: '#E0E0E0',
      borderwidth: 1
    },
    margin: { l: 60, r: 150, t: 60, b: 60 }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: 'phasor_plot_polar',
      height: 600,
      width: 800,
      scale: 1
    }
  };

  return (
    <div>
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '500px' }}
      />
      {(!gridData && !microgridData) && (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px', 
          color: '#666',
          fontSize: '16px'
        }}>
          Waiting for PMU data...
        </div>
      )}
    </div>
  );
};

export default PhasorPlot;
