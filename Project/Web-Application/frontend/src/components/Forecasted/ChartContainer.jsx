import React from "react";
import SolarChart from "./SolarChart.jsx";
import { CHART_CATEGORIES } from "./dataGenerator.jsx";

const ChartContainer = ({
  loading,
  selectedCategories,
  labels,
  chartData,
  diffDays,
  step,
  showPrediction,
  comparisonMode,
  blockStyle = {},
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Custom colors for compare chart lines (5 distinct colors)
  const compareColors = [
    "rgba(59,130,246,1)", // blue (Solar Power)
    "rgba(16,185,129,1)", // teal (EV Charger)
    "rgba(245,158,11,1)", // orange (Total Load)
    "rgba(239,68,68,1)", // red (Battery 1)
    "rgba(76,0,153,1)", // dark purple (Battery 2)
  ];

  // Last category is 'Compare', show combined line chart
  // เอาเฉพาะ Solar Power, EV Charger, Total Load, Battery 1, Battery 2
  const compareCategories = [
    "Solar Power",
    "EV Charger",
    "Total Load",
    "Battery 1",
    "Battery 2",
  ];
  const compareBlock = (
    <div key="Compare" style={blockStyle}>
      <h3 className="text-xl font-bold mb-4">Compare</h3>
      <SolarChart
        labels={labels}
        multiLineData={compareCategories.map((cat, idx) => ({
          label: cat,
          data: chartData[cat]?.real || [],
          borderColor: compareColors[idx],
          backgroundColor: "transparent",
        }))}
        diffDays={diffDays}
        step={step}
        showPrediction={false}
        comparisonMode={true}
        isCompareChart={true}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Render all except last category as usual */}
      {[...CHART_CATEGORIES.slice(0, 6), "Battery 1", "Battery 2"].map(
        (category) =>
          selectedCategories.includes(category) ? (
            <div key={category} style={blockStyle}>
              <h3 className="text-xl font-bold mb-4">{category}</h3>
              <SolarChart
                labels={labels}
                realData={chartData[category]?.real || []}
                predictedData={chartData[category]?.predicted || []}
                category={category}
                diffDays={diffDays}
                step={step}
                showPrediction={showPrediction}
                comparisonMode={false}
              />
            </div>
          ) : null
      )}
      {/* Render Compare chart as last block */}
      {compareBlock}
    </div>
  );
};

export default ChartContainer;
