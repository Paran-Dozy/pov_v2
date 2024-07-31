import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSimilar } from '../../store';
import style from './style.module.css';

function SimilarInfo() {
    const inputChain = useSelector((state) => state.chain.inputChain);
    const inputVoter = useSelector((state) => state.voter.inputVoter);
    const inputWeight = useSelector((state) => state.weight.inputWeight);
    const conditionScore = useSelector((state) => parseFloat(state.condition.conditionScore));
    const conditionMissblock = useSelector((state) => parseFloat(state.condition.conditionMissblock));
    const conditionJailed = useSelector((state) => parseFloat(state.condition.conditionJailed));
    const conditionTokenOutlier = useSelector((state) => parseFloat(state.condition.conditionTokenOutlier));
    const conditionParticipation = useSelector((state) => parseFloat(state.condition.conditionParticipation));

    const [infoData, setInfoData] = useState([]);

    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            const data = {
                "chain": inputChain,
                "voter": inputVoter,
                "weight": inputWeight,
                "score_condition": conditionScore,
                "missblock": conditionMissblock,
                "jailed": conditionJailed,
                "token_outlier": conditionTokenOutlier,
                "participation": conditionParticipation,
                "only_in": true,
                "percentage": [0.5, 0.5]
            };
            try {
                const response = await fetch('http://localhost:5002/getSimilarityInfo', {
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
    }, [inputChain, inputVoter, inputWeight, conditionScore, conditionMissblock, conditionJailed, conditionTokenOutlier, conditionParticipation]);

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
                            {index != 0 ? index + '.' : 'Selected: '} {item.voter}
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
