import { React, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import style from './style.module.css';

function SimilarInfo( ){
    const inputChain = useSelector((state) => state.chain.inputChain);
    const inputVoter = useSelector((state) => state.voter.inputVoter);
    const inputWeight = useSelector((state) => state.weight.inputWeight);
    const conditionScore = useSelector((state) => parseFloat(state.condition.conditionScore));
    const conditionMissblock = useSelector((state) => parseFloat(state.condition.conditionMissblock));
    const conditionJailed = useSelector((state) => parseFloat(state.condition.conditionJailed));
    const conditionTokenOutlier = useSelector((state) => parseFloat(state.condition.conditionTokenOutlier));
    const conditionParticipation = useSelector((state) => parseFloat(state.condition.conditionParticipation));

    const [infoData, setInfoData] = useState([]);
   
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
            } catch (error) {
                console.error('There was an error!', error);
            }
        };
        fetchData();
      }, [setInfoData, inputChain, inputVoter, inputWeight, conditionScore, conditionMissblock, conditionJailed, conditionTokenOutlier, conditionParticipation]);
    
      useEffect(() => {
        console.log(infoData);
      }, [infoData]);

    return (
        <div className={style.container}>
            <label className='ContainerTitle'>Similar Validator Info</label>
        </div>
    );
}

export default SimilarInfo;