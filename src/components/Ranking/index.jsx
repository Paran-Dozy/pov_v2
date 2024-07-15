import { React, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import style from './style.module.css';


function Ranking(){
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

    useEffect(() => {
        console.log(scoreData);
    }, [scoreData]);


    return (
        <div>
            <label className={style.title}>RadViz</label>
            <div>
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