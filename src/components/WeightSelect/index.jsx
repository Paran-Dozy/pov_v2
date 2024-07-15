import { React, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setWeight } from '../../store';

import style from './style.module.css';

function WeightSelect(){
    const dispatch = useDispatch();
    const [weights, setWeights] = useState([3, 3, 3, 3, 3]);
    const indicator = ['Contribution', 'Stability', 'Popularity', 'Commission', 'Period'];

    const handleSliderChange = (index, value) => {
        const newWeights = [...weights];
        newWeights[index] = value;
        setWeights(newWeights);
        dispatch(setWeight(newWeights));
    };

    return (
        <div>
            <div className={style.title}>Weight</div>
            {weights.map((weight, index) => (
                <div key={index} className={style.SliderContainer}>
                    <label className={style.label}>{indicator[index]}</label>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        value={weight}
                        onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
                        className={style.slider}
                    />
                    <span className={style.value}>{weight}</span>
                </div>
            ))}
        </div>
    );
}

export default WeightSelect;