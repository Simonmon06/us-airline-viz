import React, { useState } from 'react';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';

const RangeSlider = () => {
  const [range, setRange] = useState({ min: 0, max: 11 }); // Default range: Jan to Dec

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const handleSliderChange = value => {
    setRange(value);
  };

  return (
    <div style={{ width: '80%', margin: 'auto' }}>
      <InputRange
        maxValue={11}
        minValue={0}
        value={range}
        onChange={handleSliderChange}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{months[range.min]}</span>
        <span>{months[range.max]}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
