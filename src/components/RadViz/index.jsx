import { React, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import RadvizComponent from './RadvizComponent';
import style from './style.module.css';


function RadViz(){
    const [scoreData, setScoreData] = useState('');
    const inputChain = useSelector((state) => state.chain.inputChain);
    const inputWeight = useSelector((state) => state.weight.inputWeight);

    const dimensions = ['Contribution', 'Stability', 'Popularity', 'Commission', 'Period'];
    const radius = 200;

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
            responseData.sort((a, b) => a.total_score - b.total_score);
            setScoreData(responseData);
        } catch (error) {
            console.error('There was an error!', error);
        }
        };
        sendData();
    }, [inputChain, inputWeight]);

    return (
        <div className={style.container}>
            <label className={style.title}>RadViz</label>
            <div className={style.radvizContainer}>
                <RadvizComponent data={scoreData} dimensions={dimensions} radius={radius} />
            </div>
            
        </div>
    );
}

export default RadViz;