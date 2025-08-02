import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const SolarChart = ({ labels, realData, predictedData, diffDays, showPrediction, comparisonMode, multiLineData = null, isCompareChart = false, category }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  // เพิ่ม state สำหรับเก็บ index ของเส้นที่ถูกเลือก
  const [selectedLineIndex, setSelectedLineIndex] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');


        let datasets;
        if (isCompareChart && multiLineData) {
          datasets = multiLineData.map((line, idx) => {
            const isSelected = selectedLineIndex === null || selectedLineIndex === idx;
            return {
              type: 'line',
              label: line.label,
              data: line.data,
              borderColor: line.borderColor,
              backgroundColor: line.backgroundColor,
              borderWidth: isSelected ? 3 : 2,
              tension: 0.4,
              pointRadius: 0,
              borderDash: isSelected ? [] : [4, 4],
              hidden: false,
              segment: {
                borderColor: isSelected ? line.borderColor : 'rgba(180,180,180,0.3)',
                backgroundColor: isSelected ? line.backgroundColor : 'rgba(180,180,180,0.1)',
              },
              borderOpacity: isSelected ? 1 : 0.2,
            };
          });
        } else {
          datasets = [
            {
              type: 'bar',
              label: 'Actual Power',
              data: realData,
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderRadius: 4,
            },
          ];
          // ไม่ต้องมีเส้นทำนายสำหรับ Battery 1 และ Battery 2
          if (showPrediction && !['Battery 1', 'Battery 2'].includes(category)) {
            datasets.push({
              type: 'line',
              label: 'Predicted Power',
              data: predictedData,
              borderColor: '#f59e0b',
              borderWidth: 2,
              borderDash: [6, 6],
              tension: 0.4,
            });
          }
        }

        chartRef.current = new ChartJS(ctx, {
          type: isCompareChart ? 'line' : 'bar',
          data: {
            labels,
            datasets,
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: '#374151',
                  font: { size: 12, weight: 'bold' },
                },
              },
              tooltip: {
                enabled: true,
                mode: 'nearest',
                intersect: false,
                callbacks: {
                  title: (tooltipItems) => tooltipItems[0].label,
                  label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue} kW`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (val) => `${val} kW`,
                  color: '#6b7280',
                },
                title: {
                  display: true,
                  text: 'Power (kW)',
                  color: '#374151',
                },
              },
              x: {
                ticks: {
                  color: '#6b7280',
                  maxRotation: diffDays > 6 ? 45 : 90,
                  maxTicksLimit: diffDays > 6 ? 15 : 24,
                },
                title: {
                  display: true,
                  text: diffDays > 6 ? 'Date' : 'Time',
                  color: '#374151',
                },
              },
            },
            // เพิ่ม event สำหรับคลิกที่เส้น
            onClick: (e, elements, chart) => {
              if (isCompareChart && elements && elements.length > 0) {
                const datasetIndex = elements[0].datasetIndex;
                setSelectedLineIndex((prev) => prev === datasetIndex ? null : datasetIndex);
              }
            },
          },
        });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [labels, realData, predictedData, diffDays, showPrediction, isCompareChart, multiLineData, selectedLineIndex]);

  return (
    <div style={{ height: comparisonMode ? '350px' : '400px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default SolarChart;
