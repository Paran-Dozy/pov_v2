import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSimilar } from '../../store';
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
    
    const [infoData, setInfoData] = useState([]);

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
                "day": inputDay
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
                console.log('similarInfo', responseData);
            } catch (error) {
                console.error('There was an error!', error);
            }
        };
        fetchData();
    }, [inputChain, inputVoter, inputWeight, inputParticipation, inputPassed, inputMatch, inputMissblock, inputJailedRatio, inputAssetValue, inputDelegator, inputRank, inputCommission, inputDay]);

    useEffect(() => {
        console.log(infoData);
    }, [infoData]);

    const sortedInfoData = [...infoData].sort((a, b) => (a.voter === inputVoter ? -1 : b.voter === inputVoter ? 1 : 0));

    return (
        <div>
            <div className='ContainerHeader'>
                <label className='ContainerTitle'>Similar Validator Info</label>
            </div>
            {/* <div className={style.sunburst}>

            </div> */}
            <div className={style.similarContainer}>
                {sortedInfoData.map((item, index) => (
                    <div className={style.accordion} key={index}>
                        <input type="checkbox" id={`accordion-${index}`} className={style.accordionInput}/>
                        <label htmlFor={`accordion-${index}`} className={style.accordionLabel}>
                            {index != 0 ? index + '.' : 'Selected: '} {item.voter} <span>{item.grade}</span>
                        </label>
                        <div className={style.accordionContent}>
                            <p>Final Score: {item.final_score}</p>
                            <p>Chain Count: {item.chain_num}</p>
                            {/* <p>Contribution: {item.contribution_score}</p>
                            <p>Stability: {item.stability_score}</p>
                            <p>Popularity: {item.popularity_score}</p>
                            <p>Commission: {item.commission_score}</p>
                            <p>Period: {item.period_score}</p> */}
                            <p>Missblock: {item.missblock}</p>
                            <p>Jailed Ratio: {item.jailed_ratio}</p>
                            <p>Proposal Participation: {item.p_participation}</p>
                            <p>Token Variance Outlier: {item.n_outlier}</p>
                            
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SimilarInfo;
