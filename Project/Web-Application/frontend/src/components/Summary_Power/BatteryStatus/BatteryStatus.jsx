import React from "react";
import "./BatteryStatus.css";

const BatteryStatus = ({ data }) => {
  console.log("BatteryStatus received data:", data); // ✅ เพิ่มตรงนี้

  if (!data) return null; // ✅ กัน data undefined

  const { battery1_kw, battery2_kw } = data;

  const getStatus = (kw) => (kw > 0 ? "Discharge" : "Charge");

  return (
    <div className="card mb-4">
      <div className="card-header custom-header-battery">Battery Status</div>
      <div className="card-body table-responsive">
        <table className="table table-bordered text-center">
          <thead className="custom-thead-battery">
            <tr>
              <th>Battery</th>
              <th>Power (kW)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Battery 1</td>
              <td>{battery1_kw.toFixed(2)}</td>
              <td className={battery1_kw > 0 ? "text-danger" : "text-success"}>
                {getStatus(battery1_kw)}
              </td>
            </tr>
            <tr>
              <td>Battery 2</td>
              <td>{battery2_kw.toFixed(2)}</td>
              <td className={battery2_kw > 0 ? "text-danger" : "text-success"}>
                {getStatus(battery2_kw)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatteryStatus;
