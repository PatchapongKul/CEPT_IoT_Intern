import React, { useState } from 'react';
import './TimeSelector.css';

const TimeSelector = ({ onChange }) => {
  const [mode, setMode] = useState('day'); // 'day' หรือ 'month'
  const [dateValue, setDateValue] = useState('');
  const [monthValue, setMonthValue] = useState('');

  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setMode(newMode);
    if (onChange) {
      onChange({ period: newMode, date: '', month: '' }); // รีเซตค่า
    }
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setDateValue(value);
    if (onChange) {
      onChange({ period: 'day', date: value, month: '' });
    }
  };

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setMonthValue(value);
    if (onChange) {
      onChange({ period: 'month', date: '', month: value });
    }
  };

  return (
    <div className="card mb-4 p-3">
      <div className="row align-items-center">
        <div className="col-md-3">
          <label className="form-label fw-bold">ดูข้อมูลแบบ:</label>
          <select className="form-select" value={mode} onChange={handleModeChange}>
            <option value="day">รายวัน</option>
            <option value="month">รายเดือน</option>
          </select>
        </div>

        <div className="col-md-4">
          {mode === 'day' ? (
            <>
              <label className="form-label">เลือกวันที่:</label>
              <input
                type="date"
                className="form-control"
                value={dateValue}
                onChange={handleDateChange}
              />
            </>
          ) : (
            <>
              <label className="form-label">เลือกเดือน:</label>
              <input
                type="month"
                className="form-control"
                value={monthValue}
                onChange={handleMonthChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSelector;