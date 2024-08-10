import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setInputParticipation, setInputPassed, setInputMatch,
    setInputMissblock, setInputJailedRatio, setInputAssetValue,
    setInputDelegator, setInputRank, setInputCommission,
    setInputDay, setWeight
} from '../../store';
import HistogramSlider from './HistogramSlider';
import style from './style.module.css';

function WeightSelect() {
    const dispatch = useDispatch();
    const [sliderValues, setSliderValues] = useState([3, 3, 3, 3, 3]);

    const [isOpen, setIsOpen] = useState([false, false, false, false, false]);

    const [participation, setParticipation] = useState([]);
    const [passed, setPassed] = useState([]);
    const [match, setMatch] = useState([]);
    const [missblock, setMissblock] = useState([]);
    const [jailedRatio, setJailedRatio] = useState([]);
    const [assetValue, setAssetValue] = useState([]);
    const [delegator, setDelegator] = useState([]);
    const [rank, setRank] = useState([]);
    const [commission, setCommission] = useState([]);
    const [day, setDay] = useState([]);

    const inputParticipation = useSelector((state) => state.input.inputParticipation);
    const inputPassed = useSelector((state) => state.input.inputPassed);
    const inputMatch = useSelector((state) => state.input.inputMatch);
    const inputMissblock = useSelector((state) => state.input.inputMissblock);
    const inputJailedRatio = useSelector((state) => state.input.inputJailedRatio);
    const inputAssetValue = useSelector((state) => state.input.inputAssetValue);
    const inputDelegator = useSelector((state) => state.input.inputDelegator);
    const inputRank = useSelector((state) => state.input.inputRank);
    const inputCommission = useSelector((state) => state.input.inputCommission);
    const inputDay = useSelector((state) => state.input.inputDay);

    const indicator = ['Contribution', 'Stability', 'Popularity', 'Commission', 'Period'];
    const inputChain = useSelector((state) => state.chain.inputChain);

    const handleSliderChange = (index, value) => {
        const newSliderValues = [...sliderValues];
        newSliderValues[index] = value;
        setSliderValues(newSliderValues);
    };

    const handleSliderMouseUp = (index) => {
        const newWeights = [...sliderValues];
        dispatch(setWeight(newWeights));
    };

    const toggleAccordion = (index) => {
        const newIsOpen = [...isOpen];
        newIsOpen[index] = !newIsOpen[index];
        setIsOpen(newIsOpen);
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

                dispatch(setInputMissblock([0, Math.max(...responseData['missblock'])]));
                dispatch(setInputAssetValue([0, Math.max(...responseData['asset_value'])]));
                dispatch(setInputDelegator([0, Math.max(...responseData['delegator'])]));
                dispatch(setInputRank([1, Math.max(...responseData['rank'])]));
                dispatch(setInputCommission([0, Math.max(...responseData['commission'])]));
                dispatch(setInputDay([0, Math.max(...responseData['day'])]));
            } catch (error) {
                console.error('There was an error!', error);
            }
        };
        fetchData();
    }, [inputChain, dispatch]);

    const getHistogramData = (index) => {
        switch (index) {
            case 0:
                return [
                    { data: participation, indicator: 'Participation', range: inputParticipation },
                    { data: passed, indicator: 'Passed', range: inputPassed },
                    { data: match, indicator: 'Match', range: inputMatch }
                ];
            case 1:
                return [
                    { data: missblock, indicator: 'Missblock', range: inputMissblock },
                    { data: jailedRatio, indicator: 'Jailed Ratio', range: inputJailedRatio },
                    { data: assetValue, indicator: 'Asset Value', range: inputAssetValue }
                ];
            case 2:
                return [
                    { data: delegator, indicator: 'Delegator', range: inputDelegator },
                    { data: rank, indicator: 'Rank', range: inputRank }
                ];
            case 3:
                return [{ data: commission, indicator: 'Commission', range: inputCommission }];
            case 4:
                return [{ data: day, indicator: 'Day', range: inputDay }];
            default:
                return [];
        }
    };

    const handleRangeChange = (indicator, range) => {
        switch (indicator) {
            case 'Participation':
                dispatch(setInputParticipation(range));
                break;
            case 'Passed':
                dispatch(setInputPassed(range));
                break;
            case 'Match':
                dispatch(setInputMatch(range));
                break;
            case 'Missblock':
                dispatch(setInputMissblock(range));
                break;
            case 'Jailed Ratio':
                dispatch(setInputJailedRatio(range));
                break;
            case 'Asset Value':
                dispatch(setInputAssetValue(range));
                break;
            case 'Delegator':
                dispatch(setInputDelegator(range));
                break;
            case 'Rank':
                dispatch(setInputRank(range));
                break;
            case 'Commission':
                dispatch(setInputCommission(range));
                break;
            case 'Day':
                dispatch(setInputDay(range));
                break;
        }
    };

    return (
        <div>
            <div className={style.title}>Weight</div>
            {sliderValues.map((sliderValue, index) => (
                <div key={index} className={style.weightSlider}>
                    <div className={style.header}>
                        <span className={style.indicatorArrow}>
                            <label className={style.label}>{indicator[index]}</label>
                            <button
                                onClick={() => toggleAccordion(index)}
                                className={style.accordionButton}
                            >
                                {isOpen[index] ? '▲' : '▼'}
                            </button>
                        </span>
                        <div className={style.sliderWrapper}>
                            <input
                                type="range"
                                min="0"
                                max="5"
                                value={sliderValue}
                                onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
                                onMouseUp={() => handleSliderMouseUp(index)}
                                className={style.slider}
                            />
                            <span className={style.value}>{sliderValue}</span>
                        </div>
                    </div>
                    {isOpen[index] && (
                        <div className={style.histogramSliderContainer}>
                            {getHistogramData(index).map((data, histIndex) => (
                                <HistogramSlider
                                    key={histIndex}
                                    data={data.data}
                                    indicator={data.indicator}
                                    range={data.range}
                                    onRangeChange={(range) => handleRangeChange(data.indicator, range)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default WeightSelect;
