import React, { useState, useEffect, useRef } from 'react';
import * as Chart from 'chart.js';
import { Sun, Moon, Download, Calendar, Zap, TrendingUp, BarChart3, LineChart, Eye, EyeOff, GitCompare } from 'lucide-react';

Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale, 
  Chart.BarElement,
  Chart.LineElement,
  Chart.PointElement,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend
);

// Mock data generator
const CHART_CATEGORIES = [
  'Gewertz',
  'ESID', 
  'Innovation Space',
  'Total Site',
  'EV Charger',
  'Total Load',
  'Solar Power',
];

function generateChartData(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  let step = 1; // hours
  let labelList = [];
  let newChartData = {};
  
  // Determine step and total intervals based on date range
  if (diffDays <= 3) {
    // 1-3 days: 1 hour intervals, show time with date
    step = 1;
    const totalHours = diffDays * 24;
    
    for (let i = 0; i < totalHours; i++) {
      const time = new Date(start.getTime() + i * 60 * 60 * 1000);
      const day = time.getDate().toString().padStart(2, '0');
      const month = (time.getMonth() + 1).toString().padStart(2, '0');
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      
      labelList.push(`${day}/${month} ${hours}:${minutes}`);
    }
  } else if (diffDays <= 6) {
    // 4-6 days: 2 hour intervals
    step = 2;
    const totalIntervals = Math.ceil(diffDays * 24 / 2);
    
    for (let i = 0; i < totalIntervals; i++) {
      const time = new Date(start.getTime() + i * 2 * 60 * 60 * 1000);
      const day = time.getDate().toString().padStart(2, '0');
      const month = (time.getMonth() + 1).toString().padStart(2, '0');
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      
      labelList.push(`${day}/${month} ${hours}:${minutes}`);
    }
  } else {
    // 7-30 days: 1 day intervals
    step = 24;
    
    for (let i = 0; i < diffDays; i++) {
      const time = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const day = time.getDate().toString().padStart(2, '0');
      const month = (time.getMonth() + 1).toString().padStart(2, '0');
      const year = time.getFullYear();
      
      labelList.push(`${day}/${month}/${year}`);
    }
  }
  
  // Generate data for each category
  CHART_CATEGORIES.forEach((cat) => {
    let real = [];
    let predicted = [];
    
    for (let i = 0; i < labelList.length; i++) {
      let time;
      if (diffDays <= 6) {
        // For hourly/2-hourly data, use the actual time
        time = new Date(start.getTime() + i * step * 60 * 60 * 1000);
      } else {
        // For daily data, use midday (12:00) as representative time
        time = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        time.setHours(12, 0, 0, 0);
      }
      
      const hour = time.getHours();
      let base = 0;
      
      // Generate realistic patterns based on category
      switch (cat) {
        case 'Gewertz':
          base = hour >= 7 && hour <= 18 ? Math.sin(((hour - 7) / 11) * Math.PI) * 6 + 2 : 0.5;
          break;
        case 'ESID':
          base = hour >= 8 && hour <= 20 ? Math.sin(((hour - 8) / 12) * Math.PI) * 8 + 1 : 0.7;
          break;
        case 'Innovation Space':
          base = hour >= 9 && hour <= 17 ? Math.sin(((hour - 9) / 8) * Math.PI) * 4 + 1 : 0.3;
          break;
        case 'Total Site':
          base = hour >= 6 && hour <= 22 ? Math.sin(((hour - 6) / 16) * Math.PI) * 20 + 5 : 2;
          break;
        case 'EV Charger':
          base = hour >= 10 && hour <= 18 ? Math.abs(Math.sin(((hour - 10) / 8) * Math.PI)) * 5 : 0.1;
          break;
        case 'Total Load':
          base = hour >= 6 && hour <= 23 ? Math.sin(((hour - 6) / 17) * Math.PI) * 25 + 10 : 5;
          break;
        case 'Solar Power':
        default:
          base = hour >= 6 && hour <= 17 ? Math.sin(((hour - 6) / 11) * Math.PI) * 10 + 0.5 : 0;
      }
      
      // For daily aggregation, adjust values
      if (diffDays > 6) {
        base = base * (diffDays > 30 ? 24 : 12); // Scale up for daily totals
      }
      
      base = Math.max(0, base);
      let noise = (Math.random() - 0.5) * (base * 0.2); // More realistic noise
      let pred = Math.max(0, base + noise);
      
      real.push(Math.round(base * 10) / 10);
      predicted.push(Math.round(pred * 10) / 10);
    }
    
    newChartData[cat] = { real, predicted };
  });
  
  return { labels: labelList, chartData: newChartData, diffDays, step };
}

// Solar Chart Component
function SolarChart({ labels, realData, predictedData, category, diffDays, step, showPrediction, comparisonMode }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    
    // Determine bar width based on time range
    let barPercentage = 0.8;
    let categoryPercentage = 0.9;
    
    if (diffDays <= 3) {
      barPercentage = 0.9;
      categoryPercentage = 0.95;
    } else if (diffDays <= 6) {
      barPercentage = 0.85;
      categoryPercentage = 0.9;
    }
    
    // Build datasets array
    const datasets = [
      {
        type: 'bar',
        label: 'Actual Power',
        data: realData,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: barPercentage,
        categoryPercentage: categoryPercentage,
      }
    ];
    
    // Only add prediction line if enabled
    if (showPrediction) {
      datasets.push({
        type: 'line',
        label: 'Predicted Power',
        data: predictedData,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
      });
    }
    
    chartRef.current = new Chart.Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { 
            position: 'top',
            labels: { 
              color: '#374151',
              font: { 
                weight: '600',
                size: 12 
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
            }
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#111827',
            bodyColor: '#374151',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              title: (tooltipItems) => {
                let timeRange = '';
                if (diffDays <= 3) {
                  timeRange = `เวลา: ${tooltipItems[0].label} (1 ชม.)`;
                } else if (diffDays <= 6) {
                  timeRange = `เวลา: ${tooltipItems[0].label} (2 ชม.)`;
                } else {
                  timeRange = `วันที่: ${tooltipItems[0].label}`;
                }
                return timeRange;
              },
              label: (tooltipItem) => {
                const datasetLabel = tooltipItem.dataset.label || '';
                const value = tooltipItem.formattedValue;
                return `${datasetLabel}: ${value} kW`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { 
              color: '#6b7280',
              font: { 
                weight: '500',
                size: 11 
              },
              callback: function(value) {
                return value + ' kW';
              }
            },
            title: {
              display: true,
              text: 'Power (kW)',
              color: '#374151',
              font: { 
                weight: '600',
                size: 13 
              },
            },
            grid: { 
              color: 'rgba(229, 231, 235, 0.5)',
              drawBorder: false,
            },
          },
          x: {
            ticks: { 
              color: '#6b7280',
              font: { 
                weight: '500',
                size: diffDays > 6 ? 10 : 9
              },
              maxRotation: diffDays > 6 ? 45 : 90,
              maxTicksLimit: diffDays > 6 ? 15 : 24,
            },
            title: {
              display: true,
              text: diffDays > 6 ? 'วันที่' : 'เวลา',
              color: '#374151',
              font: { 
                weight: '600',
                size: 13 
              },
            },
            grid: { 
              color: 'rgba(229, 231, 235, 0.3)',
              drawBorder: false,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [labels, realData, predictedData, category, diffDays, step, showPrediction]);

  return (
    <div style={{ height: comparisonMode ? '350px' : '400px', width: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// Main App Component
function His_chart() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [labels, setLabels] = useState([]);
  const [chartData, setChartData] = useState({});
  const [diffDays, setDiffDays] = useState(1);
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState(CHART_CATEGORIES);
  const [showPrediction, setShowPrediction] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const result = generateChartData(startDate, endDate);
      setLabels(result.labels);
      setChartData(result.chartData);
      setDiffDays(result.diffDays);
      setStep(result.step);
      setLoading(false);
    }, 300);
  }, [startDate, endDate]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const togglePrediction = () => {
    setShowPrediction(!showPrediction);
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
  };

  const exportData = () => {
    const dataToExport = {
      dateRange: { startDate, endDate },
      categories: selectedCategories,
      data: chartData,
      timeInterval: diffDays <= 3 ? '1 hour' : diffDays <= 6 ? '2 hours' : '1 day'
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-data-${startDate}-${endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Solar Power': return <Sun className="w-5 h-5" />;
      case 'EV Charger': return <Zap className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };



  const themeClasses = theme === 'light' 
    ? 'bg-gradient-to-br from-blue-50 via-white to-amber-50 text-gray-900'
    : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white';

  const cardClasses = theme === 'light'
    ? 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg'
    : 'bg-gray-800/80 backdrop-blur-sm border border-gray-700 shadow-2xl';

  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Solar Profile Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Controls */}
        <div className={`${cardClasses} rounded-2xl p-6 mb-8`}>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <label className="font-semibold text-gray-700 dark:text-gray-300">Start Date:</label>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all duration-200"
              />
            </div>
            
            <span className="text-gray-500 font-medium">to</span>
            
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-gray-700 dark:text-gray-300">End Date:</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className={`${cardClasses} rounded-2xl p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Select Categories</h3>
              <div className="flex flex-wrap gap-2">
                {CHART_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      selectedCategories.includes(category)
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {getCategoryIcon(category)}
                    <span className="font-medium">{category}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Display Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Display Options</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={togglePrediction}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    showPrediction
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {showPrediction ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="font-medium">Prediction</span>
                </button>
                
                <button
                  onClick={toggleComparisonMode}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    comparisonMode
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                  <span className="font-medium">Compare</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className={comparisonMode ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid gap-8"}>
            {selectedCategories.map((category) => (
              <div key={category} className={`${cardClasses} rounded-2xl p-6 animate-in fade-in duration-500`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg">
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{category}</h3>
                </div>
                
                <SolarChart
                  labels={labels}
                  realData={chartData[category]?.real || []}
                  predictedData={chartData[category]?.predicted || []}
                  category={category}
                  diffDays={diffDays}
                  step={step}
                  showPrediction={showPrediction}
                  comparisonMode={comparisonMode}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default His_chart;