// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Slider from './slider';
import '../../styles/userInput.css';

function Weight({ changeWeight }){
    const [weightList, setWeightList] = useState([3, 3, 3, 3]);

    const contChange = (value) => {
        setWeightList([Number(value), weightList[1], weightList[2], weightList[3]]);
    }
    
    const staChange = (value) => {
        setWeightList([weightList[0], Number(value), weightList[2], weightList[3]])
    }
    
    const popChange = (value) => {
        setWeightList([weightList[0], weightList[1], Number(value), weightList[3]])
    }

    const commChange = (value) => {
        setWeightList([weightList[0], weightList[1], weightList[2], Number(value)])
    }

    useEffect(() => {
        changeWeight(weightList);
    }, [changeWeight, weightList]);

    return (
        <div className="weight">
            <div className="weight-label">Weight</div>
            <Slider text="Contribution" getNum={contChange} max={5} def={3}/>
            <Slider text="Stability" getNum={staChange} max={5} def={3}/>
            <Slider text="Popularty" getNum={popChange} max={5} def={3}/>
            <Slider text="Commission" getNum={commChange} max={5} def={3}/>
        </div>
    );
}

Weight.propTypes = {
    changeWeight: PropTypes.func.isRequired
};

export default Weight;