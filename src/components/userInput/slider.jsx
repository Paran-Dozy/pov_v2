/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../../styles/userInput.css';

function Slider({ text, getNum, max, def }) {
  const [value, setValue] = useState(def); // Initial value set to 3

  const handleChange = (event) => {
    setValue(parseInt(event.target.value)); // Parsing the value to integer
    getNum(event.target.value);
  };
  

  return (
    <div className="slider-container">
      <p className="slider-label">{text}</p>
      <input  
        type="range" 
        min="1" 
        max={max} 
        value={value} 
        onChange={handleChange} 
        step="1"
        className="slider"
      />
      <p className="slider-value">{value}</p>
    </div>
  );
}

Slider.propTypes = {
  text: PropTypes.string.isRequired,
  getNum: PropTypes.func.isRequired,
  max: PropTypes.number.isRequired,
  def: PropTypes.number.isRequired,
};

export default Slider;