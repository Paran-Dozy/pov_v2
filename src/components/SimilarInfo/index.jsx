import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setInOutRatio, setSimilar } from '../../store';
import RadarChart from './RadarChart';
import style from './style.module.css';

function SimilarInfo() {
    const inputChain = useSelector((state) => state.chain.inputChain);
    const inputVoter = useSelector((state) => state.voter.inputVoter);
    const inputWeight = useSelector((state) => state.weight.inputWeight);
    const inOutRatio = useSelector((state) => state.input.inOutRatio);

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

    const selected = useSelector((state) => state.select.selected);
    
    const [infoData, setInfoData] = useState([]);
    const [sliderValue, setSliderValue] = useState(inOutRatio[0] * 100);

    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            const data = {
                "chain": inputChain, 
                "voter": inputVoter,
                "weight": inputWeight,
                "inout_ratio": inOutRatio,
                "p_participation": inputParticipation,
                "p_passed": inputPassed,
                "p_match": inputMatch,
                "missblock": inputMissblock,
                "jailed_ratio": inputJailedRatio,
                "asset_value": inputAssetValue,
                "delegator": inputDelegator,
                "rank": inputRank,
                "commission": inputCommission,
                "day": inputDay,
                "selected": selected
            };
            try {
                const response = await fetch('http://localhost:5002/getSimilarInfo', {
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
                setInfoData(responseData);
                const similars = responseData.map(item => item.voter);
                dispatch(setSimilar(similars));
            } catch (error) {
                console.error('There was an error!', error);
            }
        };
        fetchData();
    }, [selected, inputChain, inputVoter, inputWeight, inOutRatio, inputParticipation, inputPassed, inputMatch, inputMissblock, inputJailedRatio, inputAssetValue, inputDelegator, inputRank, inputCommission, inputDay]);

    const sortedInfoData = [...infoData].sort((a, b) => b.similarity - a.similarity);

    const handleSliderChange = (value) => {
        setSliderValue(value);
    };

    const handleSliderMouseUp = () => {
        const inRatio = sliderValue / 100;
        const outRatio = 1 - inRatio;
        dispatch(setInOutRatio([inRatio, outRatio]));
    };

    return (
        <div>
            <div className='ContainerHeader'>
                <label className='ContainerTitle'>Similar Validator Info</label>
            </div>
            <div className={style.RadarContainer}>
                <RadarChart infoData={sortedInfoData.slice(0, 6)}/>
            </div>
            <div className={style.sliderContainer}>
                <label className={style.value}>
                    In &nbsp;&nbsp;{`${sliderValue}`}%
                </label>
                <div className={style.sliderWrapper}>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                        onMouseUp={handleSliderMouseUp}
                        className={style.slider}
                    />
                    <label className={style.value}> 
                        {`${100 - sliderValue}`}% &nbsp;&nbsp;Out
                    </label>
                </div>
            </div>
            <div className={style.similarContainer}>
                {sortedInfoData.slice(0, 6).map((item, index) => (
                    <div className={style.valContainer} key={index}>
                        <label className={style.valLabel}>
                            <span className={style.index}>{item.index}</span> 
                            <span className={style.voter}>{item.voter}</span> 
                            <span 
                                className={`${style.finalScore} ${item.final_score > 80 ? style.color_one : item.final_score > 65 ? style.color_two : item.final_score > 50 ? style.color_three : style.color_four}`}
                            >
                                {item.final_score.toFixed(2)}
                            </span>
                        </label>
                        <label className={style.scoreBarContainer}>
                            <div className={style.scoreLabel}>In score:</div>
                            <div 
                                className={`${style.scoreBar} ${style.inScoreBar}`} 
                                style={{ 
                                    '--in-score': item.in_score, 
                                    backgroundColor: item.in_score > 80 
                                        ? 'rgba(103, 137, 111, 1)'
                                        : item.in_score > 65 
                                        ? 'rgba(141, 202, 153, 1)'
                                        : item.in_score > 50 
                                        ? 'rgba(254, 201, 144, 1)'
                                        : 'rgba(225, 117, 116, 1)'
                                }}
                            ></div>
                            <label className={style.font}>{item.in_score.toFixed(2)}</label>
                        </label>
                        <label className={style.scoreBarContainer}>
                            <span className={style.scoreLabel}>Overall score:</span>
                            <div 
                                className={`${style.scoreBar} ${style.outScoreBar}`} 
                                style={{ 
                                    '--out-score': item.out_score, 
                                    backgroundColor: item.out_score > 80 
                                        ? 'rgba(103, 137, 111, 1)'
                                        : item.out_score > 65 
                                        ? 'rgba(141, 202, 153, 1)'
                                        : item.out_score > 50 
                                        ? 'rgba(254, 201, 144, 1)'
                                        : 'rgba(225, 117, 116, 1)'
                                }}
                            ></div>
                            <label className={style.font}>{item.out_score.toFixed(2)}</label>
                        </label>

                    </div>
                ))}
            </div>
        </div>

    );
}

export default SimilarInfo;
