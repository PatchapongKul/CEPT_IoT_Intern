import React from "react";
import {
  Eye,
  EyeOff,
  GitCompare,
  Zap,
  Sun,
  TrendingUp,
  BatteryFull,
} from "lucide-react";
import { CHART_CATEGORIES } from "./dataGenerator.jsx";

const ControlPanel = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  selectedCategories,
  setSelectedCategories,
  showPrediction,
  togglePrediction,
  comparisonMode,
  toggleComparisonMode,
}) => {
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const iconStyle = { verticalAlign: "middle", marginRight: "6px" };
  const sunHeaderStyle = {
    width: "2.5rem",
    height: "2.5rem",
    color: "#fbbf24",
    verticalAlign: "middle",
    marginRight: "18px",
    marginLeft: "10px",
  };
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Solar Power":
        return <Sun className="w-5 h-5" style={iconStyle} />;
      case "EV Charger":
        return <Zap className="w-5 h-5" style={iconStyle} />;
      case "Battery 1":
      case "Battery 2":
        return <BatteryFull className="w-5 h-5" style={iconStyle} />;
      case "Compare":
        return <GitCompare className="w-5 h-5" style={iconStyle} />;
      default:
        return <TrendingUp className="w-5 h-5" style={iconStyle} />;
    }
  };
  console.log(CHART_CATEGORIES);
  return (
    <div
      className="bg-white dark:bg-gray-800 p-6 rounded-xl mb-8 shadow-md"
      style={{ marginLeft: "24px", marginRight: "24px" }}
    >
      {/* Header with Sun icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "28px",
          marginLeft: "-10px",
        }}
      >
        <Sun style={sunHeaderStyle} />
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#222",
            margin: 0,
          }}
        >
          Solar Profile Dashboard
        </h2>
      </div>

      {/* Date Inputs */}
      <div className="date-range-row mb-4" style={{ maxWidth: "530px" }}>
        <label htmlFor="start-date" style={{ color: "#222", fontWeight: 600 }}>
          Start:
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          max={endDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            color: "#222",
            fontWeight: 500,
            border: "1.5px solid #d1d5db",
          }}
        />
        <label
          htmlFor="end-date"
          style={{ marginLeft: 12, color: "#222", fontWeight: 600 }}
        >
          End:
        </label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            color: "#222",
            fontWeight: 500,
            border: "1.5px solid #d1d5db",
          }}
        />
      </div>

      {/* Category Selector */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "2px solid #d1d5db",
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
          marginBottom: "40px",
          padding: "24px",
          marginLeft: "12px",
          marginRight: "12px",
        }}
      >
        <h3 className="font-semibold mb-2">Select Categories</h3>
        <div className="category-group mb-4">
          {CHART_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              style={{
                ...(selectedCategories.includes(category)
                  ? category === "Compare"
                    ? {
                        background: "#2563eb", // blue
                        color: "#fff",
                        boxShadow: "0 2px 8px 0 rgba(37,99,235,0.13)",
                      }
                    : {
                        background: "#ff9800",
                        color: "#fff",
                        boxShadow: "0 2px 8px 0 rgba(255,152,0,0.13)",
                      }
                  : category === "Compare"
                  ? {
                      background: "#e5e7eb", // gray
                      color: "#6b7280",
                      boxShadow: "none",
                    }
                  : {
                      background: "#e5e7eb",
                      color: "#6b7280",
                      boxShadow: "none",
                    }),
                fontWeight: 600,
                borderRadius: "10px",
                padding: "8px 18px",
                marginRight: "8px",
                border: "none",
                outline: "none",
                transition: "background 0.18s, box-shadow 0.18s",
                fontSize: "1rem",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                if (category === "Compare") {
                  e.currentTarget.style.background =
                    selectedCategories.includes(category)
                      ? "#3b82f6"
                      : "#f3f4f6";
                } else {
                  e.currentTarget.style.background =
                    selectedCategories.includes(category)
                      ? "#ffb74d"
                      : "#f3f4f6";
                }
              }}
              onMouseOut={(e) => {
                if (category === "Compare") {
                  e.currentTarget.style.background =
                    selectedCategories.includes(category)
                      ? "#2563eb"
                      : "#e5e7eb";
                } else {
                  e.currentTarget.style.background =
                    selectedCategories.includes(category)
                      ? "#ff9800"
                      : "#e5e7eb";
                }
              }}
            >
              {getCategoryIcon(category)}
              {category}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={togglePrediction}
            style={{
              ...(showPrediction
                ? {
                    background: "#22c55e",
                    color: "#fff",
                    boxShadow: "0 2px 8px 0 rgba(34,197,94,0.10)",
                  }
                : {
                    background: "#e5e7eb",
                    color: "#6b7280",
                    boxShadow: "none",
                  }),
              fontWeight: 600,
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "1rem",
              border: "none",
              marginRight: "16px",
              transition: "background 0.18s",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = showPrediction
                ? "#4ade80"
                : "#f3f4f6";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = showPrediction
                ? "#22c55e"
                : "#e5e7eb";
            }}
          >
            {showPrediction ? (
              <Eye className="w-4 h-4" style={iconStyle} />
            ) : (
              <EyeOff className="w-4 h-4" style={iconStyle} />
            )}
            Prediction
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
