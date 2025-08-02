import React from 'react';
import './SolarTable.css';

const SolarTable = ({ data }) => {
  const { solar_power_kw, forecasted_solar_power_kw } = data;

  return (
    <div className="card mb-4">
      <div className="card-header custom-header-solar">
        Solar Power
      </div>
      <div className="card-body table-responsive">
        <table className="table table-bordered text-center">
          <thead className="custom-thead-solar">
            <tr>
              <th>Type</th>
              <th>Power (kW)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Solar Power</td>
              <td>{solar_power_kw.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Forecasted Solar Power</td>
              <td>{forecasted_solar_power_kw.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SolarTable;