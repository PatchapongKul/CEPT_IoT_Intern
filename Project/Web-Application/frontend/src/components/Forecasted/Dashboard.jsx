import React, { useState, useEffect } from 'react';
import ControlPanel from './ControlPanel';
import ChartContainer from './ChartContainer';
import { generateChartData, CHART_CATEGORIES } from './dataGenerator';
import getSolarSummary from './libs/getsolar_summary';

function Dashboard() {
  const today = new Date().toISOString().split('T')[0];
  const [solarSummary, setSolarSummary] = useState({})
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
  const fetchSolarSummary = async () => {
    setLoading(true);
    try {
      const response = await getSolarSummary(startDate, endDate);
      console.log(response)
      const data = response || [];

      const diff = Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      ) + 1;

      // สร้าง labels
      const labels = data.map((row) => {
        const time = new Date(row.timestamp);
        return diff > 6
          ? `${time.getDate().toString().padStart(2, '0')}/${(time.getMonth() + 1)
              .toString()
              .padStart(2, '0')}/${time.getFullYear()}`
          : `${time.getDate().toString().padStart(2, '0')}/${(time.getMonth() + 1)
              .toString()
              .padStart(2, '0')} ${time.getHours().toString().padStart(2, '0')}:00`;
      });

      // เตรียม chartData ด้วย mapping ตามที่คุณกำหนด
      const chartData = {
        'Solar Power': { real: [], predicted: [] },
        'Total Load': { real: [], predicted: [] },
        'EV Charger': { real: [], predicted: [] },
        'Gewertz': { real: [], predicted: [] },
        'ESID': { real: [], predicted: [] },
        'Innovation Space': { real: [], predicted: [] },
        'Battery 1': { real: [] },
        'Battery 2': { real: [] },
        'Compare': { real: [], predicted: [] },
      };

      data.forEach((row, index) => {
        // กราฟปกติ
        chartData['Solar Power'].real.push(row.solar_power_kw ?? 0);
        chartData['Solar Power'].predicted.push(row.forecasted_solar_power_kw ?? 0);

        chartData['Total Load'].real.push(row.total_load_kw ?? 0);
        chartData['Total Load'].predicted.push(row.forecasted_total_load_kw ?? 0);

        chartData['EV Charger'].real.push(row.ev_charger_kw ?? 0);
        chartData['EV Charger'].predicted.push(row.forecasted_ev_charger_kw ?? 0);

        chartData['Gewertz'].real.push(row.load_site1_kw ?? 0);
        chartData['Gewertz'].predicted.push(row.forecasted_load_site1_kw ?? 0);

        chartData['ESID'].real.push(row.load_site2_kw ?? 0);
        chartData['ESID'].predicted.push(row.forecasted_load_site2_kw ?? 0);

        chartData['Innovation Space'].real.push(row.load_site3_kw ?? 0);
        chartData['Innovation Space'].predicted.push(row.forecasted_load_site3_kw ?? 0);
        
        chartData['Battery 1'].real.push(row.battery1_kw ?? 0);

        chartData['Battery 2'].real.push(row.battery2_kw ?? 0);

        // Compare: รวมค่าของทุกหมวด real และ predicted
        const realSum =
          (row.solar_power_kw ?? 0) +
          (row.total_load_kw ?? 0) +
          (row.ev_charger_kw ?? 0) +
          (row.load_site1_kw ?? 0) +
          (row.load_site2_kw ?? 0) +
          (row.load_site3_kw ?? 0) +
          (row.battery1_kw ?? 0) +
          (row.battery2_kw ?? 0);
        const predictedSum =
          (row.forecasted_solar_power_kw ?? 0) +
          (row.forecasted_total_load_kw ?? 0) +
          (row.forecasted_ev_charger_kw ?? 0) +
          (row.forecasted_load_site1_kw ?? 0) +
          (row.forecasted_load_site2_kw ?? 0) +
          (row.forecasted_load_site3_kw ?? 0);

        chartData['Compare'].real.push(parseFloat(realSum.toFixed(2)));
        chartData['Compare'].predicted.push(parseFloat(predictedSum.toFixed(2)));
      });

      const step = labels.length / diff;

      setLabels(labels);
      setChartData(chartData);
      setDiffDays(diff);
      setStep(step);
    } catch (error) {
      console.error('Error fetching solar summary:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchSolarSummary();
}, [startDate, endDate]);



  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f6fa', color: theme === 'light' ? '#222' : '#fff' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ControlPanel
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          showPrediction={showPrediction}
          togglePrediction={() => setShowPrediction(!showPrediction)}
          comparisonMode={comparisonMode}
          toggleComparisonMode={() => setComparisonMode(!comparisonMode)}
          theme={theme}
          setTheme={setTheme}
        />
        <ChartContainer
          loading={loading}
          selectedCategories={selectedCategories}
          labels={labels}
          chartData={chartData}
          diffDays={diffDays}
          step={step}
          showPrediction={showPrediction}
          comparisonMode={comparisonMode}
          blockStyle={{
            background: '#fff',
            borderRadius: '16px',
            border: '2px solid #d1d5db',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
            marginBottom: '32px',
            padding: '24px',
            marginLeft: '24px',
            marginRight: '24px',
          }}
        />
      </div>
    </div>
  );
}

export default Dashboard;

