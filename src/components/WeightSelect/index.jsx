import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setInputParticipation, setInputPassed, setInputMatch, setInputMissblock, setInputJailedRatio, setInputAssetValue, setInputDelegator, setInputRank, setInputCommission, setInputDay, setWeight } from '../../store';
import HistogramSlider from './HistogramSlider';
import style from './style.module.css';

function WeightSelect() {
    const dispatch = useDispatch();
    const [weights, setWeights] = useState([3, 3, 3, 3, 3]);

    // Contribution
    const [participation, setParticipation] = useState([]);
    const [passed, setPassed] = useState([]);
    const [match, setMatch] = useState([]);
    
    // Stability
    const [missblock, setMissblock] = useState([]);
    const [jailedRatio, setJailedRatio] = useState([]);
    const [assetValue, setAssetValue] = useState([]);

    // Popularity
    const [delegator, setDelegator] = useState([]);
    const [rank, setRank] = useState([]);
    
    // Commission
    const [commission, setCommission] = useState([]);
    
    // Period
    const [day, setDay] = useState([]);
    
    const indicator = ['Contribution', 'Stability', 'Popularity', 'Commission', 'Period'];
    const inputChain = useSelector((state) => state.chain.inputChain);

    const handleSliderChange = (index, value) => {
        const newWeights = [...weights];
        newWeights[index] = value;
        setWeights(newWeights);
        dispatch(setWeight(newWeights));
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = {
                "chain": inputChain
            };
            try {
                const response = await fetch('http://localhost:5002/getHist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const responseData = await response.json();
                console.log(responseData);
                setParticipation(responseData['participation']);
                setPassed(responseData['passed']);
                setMatch(responseData['match']);
                setMissblock(responseData['missblock']);
                setJailedRatio(responseData['jailed_ratio']);
                setAssetValue(responseData['asset_value']);
                setDelegator(responseData['delegator']);
                setRank(responseData['rank']);
                setCommission(responseData['commission']);
                setDay(responseData['day']);
            } catch (error) {
                console.error('There was an error!', error);
            }
        };
        fetchData();
    }, [inputChain]);

    const getHistogramData = (index) => {
        switch (index) {
            case 0:
                return [participation, passed, match];
            case 1:
                return [missblock, jailedRatio, assetValue];
            case 2:
                return [delegator, rank];
            case 3:
                return [commission];
            case 4:
                return [day];
            default:
                return [];
        }
    };

    const handleRangeChange = (index, range) => {
        console.log(`Range for ${indicator[index]}: `, range);
        switch (indicator[index]) {
            case 'Contribution':
                if (index == 0){
                    dispatch(setInputParticipation(range))
                } else if (index == 1){
                    dispatch(setInputPassed(range))
                } else {
                    dispatch(setInputMatch(range))
                }
                break
            case 'Stability':
                if (index == 0){
                    dispatch(setInputMissblock(range))
                } else if (index == 1){
                    dispatch(setInputJailedRatio(range))
                } else {
                    dispatch(setInputAssetValue(range))
                }
                break
            case 'Popularity':
                if (index == 0){
                    dispatch(setInputDelegator(range))
                } else {
                    dispatch(setInputRank(range))
                }
                break
            case 'Commission':
                dispatch(setInputCommission(range))
                break
            case 'Period':
                dispatch(setInputDay(range))
                break
        }
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
                    {getHistogramData(index).map((data, histIndex) => (
                        <HistogramSlider key={histIndex} data={data} onRangeChange={(range) => handleRangeChange(index, range)} />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default WeightSelect;
