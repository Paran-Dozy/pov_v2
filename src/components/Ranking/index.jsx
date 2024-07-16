import { React, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import style from './style.module.css';


function Ranking( {expanded }){
    const [scoreData, setScoreData] = useState('');
    const inputChain = useSelector((state) => state.chain.inputChain);
    const inputWeight = useSelector((state) => state.weight.inputWeight);

    useEffect(() => {
        const sendData = async () => {
        const data = {"chain": inputChain, "weight": inputWeight};
        try {
            const response = await fetch('http://localhost:5002/getScore', {
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
            setScoreData(responseData);
        } catch (error) {
            console.error('There was an error!', error);
        }
        };
        sendData();
    }, [inputChain, inputWeight]);

    return (
        <div className={style.container}>
            <label className='ContainerTitle'>Ranking</label>

            <div className={style.legendContainer}>
                <span className={style.legendSpan}>
                    <div className={style.legend}>
                        <div className={style.Contribution} />
                        Contribution
                    </div>
                    <div className={style.legend}>
                        <div className={style.Stability} />
                        Stability
                    </div>
                    <div className={style.legend}>
                        <div className={style.Popularity} />
                        Popularity
                    </div>
                </span>
                <span className={style.legendSpan}>
                    <div className={style.legend}>
                    <div className={style.Commission} />
                        Commission    
                    </div>
                    <div className={style.legend}>
                        <div className={style.Period} />
                        Period
                    </div>
                    <div className={style.legend}></div>
                </span>
            </div>

            <div className={`${style.RankingContainer} ${expanded ? '' : style.RankingContainerExpanded}`}>
                {scoreData && scoreData.map((item, index) => (
                    <div key={index}>
                        <p>{item.voter}: {item.total_score}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Ranking;