import React from 'react';
import './LoadTable.css';

const LoadTable = ({ data }) => {
  const { total_load_kw, forecasted_total_load_kw } = data;

  return (
    <div className="card mb-4">
      <div className="card-header custom-header-load">
        Load Information
      </div>
      <div className="card-body table-responsive">
        <table className="table table-bordered text-center">
          <thead className="custom-thead-load">
            <tr>
              <th>Type</th>
              <th>Power (kW)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Load</td>
              <td>{total_load_kw.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Forecasted Total Load</td>
              <td>{forecasted_total_load_kw.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoadTable;
