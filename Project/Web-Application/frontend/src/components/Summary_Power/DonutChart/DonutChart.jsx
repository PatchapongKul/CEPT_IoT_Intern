import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DonutChart.css';

const DonutChart = ({ data, title }) => {
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#26A69A'
  ];

  const chartData = Object.entries(data).map(([key, value], index) => ({
    name: key.replace(/_/g, ' '),
    value: value.value,
    percent: value.percent,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="card mb-4">
      <div className="card-header custom-header-energy">
        {title}
      </div>
      <div className="card-body chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              fill="#8884d8"
              label={({ name, percent }) => `${name} (${percent.toFixed(2)}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} kW`, name]} />
            <Legend verticalAlign="bottom" height={10} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DonutChart;