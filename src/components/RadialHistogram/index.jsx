import { React, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import style from './style.module.css';


function RadialHistogram(){
    const [validatorData, setValidatorData] = useState([])
    const selectedVoter = 'cosmostation'
    const inputChain = useSelector((state) => state.chain.inputChain);
    const inputWeight = useSelector((state) => state.weight.inputWeight);

    useEffect(() => {
        const fetchData = async () => {
        const data = {"voter": selectedVoter, "weight": inputWeight};
        try {
            const response = await fetch('http://localhost:5002/getValidator', {
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
            setValidatorData(responseData);
        } catch (error) {
            console.error('There was an error!', error);
        }
        };
        fetchData();
    }, [selectedVoter, inputWeight]);

    useEffect(() => {
        console.log(validatorData);
    }, [validatorData]);

    return (
        <div className={style.container}>
            <label className='ContainerTitle'>Validator Info</label>
            
            
        </div>
    );
}

export default RadialHistogram;