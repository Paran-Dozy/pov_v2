/* eslint-disable no-unused-vars */
import React from 'react';
import Slider from './slider';
import '../../styles/userInput.css';
import PropTypes from 'prop-types';

function Filter({ changeFilter }){
    
    const valChange = (value) => {
        changeFilter(value);
    }

    return (
        <div className="filter">
            <Slider text="Filter" getNum={valChange} max={100} def={100}/>
        </div>
    );
}

Filter.propTypes = {
    changeFilter: PropTypes.func.isRequired,
};

export default Filter;