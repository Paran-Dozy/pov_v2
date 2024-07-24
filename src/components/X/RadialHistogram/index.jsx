import { React, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import RadialHistogramComponent from './RadialHistogramComponent';
import ValidatorSelectComponent from './ValidatorSelectComponent';
import style from './style.module.css';

function RadialHistogram(){
    const [validatorData, setValidatorData] = useState([]);

    const [weightScoreSum, setWeightScoreSum] = useState(0);
    const [averageScore, setAverageScore] = useState(0);
    const [missBlock, setMissBlock] = useState(0);
    const [averageJailedRatio, setAverageJailedRatio] = useState(0);
    const [averageParticipationRatio, setAverageParticipationRatio] = useState(0);


    const selectedVoter = useSelector((state) => state.voter.inputVoter);
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

    useEffect (() => {
        setWeightScoreSum(validatorData.reduce((sum, validator) => sum + validator.weight_score, 0));
        setAverageScore(validatorData.reduce((sum, validator) => sum + validator.total_score, 0) / validatorData.length);
        setMissBlock(validatorData.reduce((sum, validator) => sum + validator.missblock, 0));
        setAverageJailedRatio(validatorData.reduce((sum, validator) => sum + validator.jailed_ratio, 0) / validatorData.length);
        setAverageParticipationRatio(validatorData.reduce((sum, validator) => sum + validator.p_participation, 0) / validatorData.length);
    }, [validatorData]);

    return (
        <div className={style.container}>
            <label className='ContainerTitle'>Validator Info</label>
            <RadialHistogramComponent validatorData={validatorData} />
            <div className={style.infoContainer}>
                <ValidatorSelectComponent />
                <div className={style.info}>
                    <label className={style.title}>Chain</label>
                    <label className={style.label}>{validatorData.length}</label>
                </div>
                <div className={style.info}>
                    <label className={style.title}>Weight Score</label>
                    <label className={style.label}>{weightScoreSum}</label>
                </div>
                <div className={style.info}>
                    <label className={style.title}>Average Score</label>
                    <label className={style.label}>{averageScore}</label>
                </div>
                <div className={style.info}>
                    <label className={style.title}>Miss Block</label>
                    <label className={style.label}>{missBlock}</label>
                </div>
                <div className={style.info}>
                    <label className={style.title}>Jailed Ratio</label>
                    <label className={style.label}>{averageJailedRatio}</label>
                </div>
                <div className={style.info}>
                    <label className={style.title}>Participation Ratio</label>
                    <label className={style.label}>{averageParticipationRatio}</label>
                </div>
            </div>
        </div>
    );
}

export default RadialHistogram;