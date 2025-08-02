import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BatteryStatus from './BatteryStatus/BatteryStatus';
import LoadTable from './LoadTable/LoadTable';
import SolarTable from './SolarTable/SolarTable';
import DonutChart from './DonutChart/DonutChart';
import TimeSelector from './TimeSelector/TimeSelector';
import 'bootstrap/dist/css/bootstrap.min.css';

function SummaryPower() {
  const [data, setData] = useState(null);

  const fetchData = async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`http://localhost:3000/api/solar_summary_point?${query}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Solar Energy Dashboard</h2>
      <BatteryStatus data={data.latest} />
      <LoadTable data={data.latest} />
      <SolarTable data={data.latest} />
      <TimeSelector onChange={fetchData} />
      <DonutChart data={data.energy_in} title="Energy In" />
      <DonutChart data={data.energy_out} title="Energy Out" />
    </div>
  );
}

export default SummaryPower;