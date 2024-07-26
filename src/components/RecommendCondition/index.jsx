import { React, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setConditionScore, setConditionMissblock, setConditionJailed, setConditionTokenOutlier, setConditionParticipation } from '../../store';

import style from './style.module.css';

function RecommendCondition() {
    const dispatch = useDispatch();

    const conditionScore = useSelector((state) => state.condition.conditionScore);
    const conditionMissblock = useSelector((state) => state.condition.conditionMissblock);
    const conditionJailed = useSelector((state) => state.condition.conditionJailed);
    const conditionTokenOutlier = useSelector((state) => state.condition.conditionTokenOutlier);
    const conditionParticipation = useSelector((state) => state.condition.conditionParticipation);

    const handleInputChange = (e, conditionType) => {
        const value = e.target.value;
        switch (conditionType) {
            case 'score':
                dispatch(setConditionScore(value));
                break;
            case 'missblock':
                dispatch(setConditionMissblock(value));
                break;
            case 'jailed':
                dispatch(setConditionJailed(value));
                break;
            case 'tokenOutlier':
                dispatch(setConditionTokenOutlier(value));
                break;
            case 'participation':
                dispatch(setConditionParticipation(value));
                break;
            default:
                break;
        }
    };

    return (
        <div>
            <div className={style.title}>Recommend Condition</div>
            <form>
                <div className={style.inputContainer}>
                    <label>Score:</label>
                    <input
                        type="number"
                        value={conditionScore}
                        onChange={(e) => handleInputChange(e, 'score')}
                    />
                </div>
                <div className={style.inputContainer}>
                    <label>Missblock:</label>
                    <input
                        type="number"
                        value={conditionMissblock}
                        onChange={(e) => handleInputChange(e, 'missblock')}
                    />
                </div>
                <div className={style.inputContainer}>
                    <label>Jailed:</label>
                    <input
                        type="number"
                        value={conditionJailed}
                        onChange={(e) => handleInputChange(e, 'jailed')}
                    />
                </div>
                <div className={style.inputContainer}>
                    <label>Token Outlier:</label>
                    <input
                        type="number"
                        value={conditionTokenOutlier}
                        onChange={(e) => handleInputChange(e, 'tokenOutlier')}
                    />
                </div>
                <div className={style.inputContainer}>
                    <label>Participation:</label>
                    <input
                        type="number"
                        value={conditionParticipation}
                        onChange={(e) => handleInputChange(e, 'participation')}
                    />
                </div>
            </form>
        </div>
    );
}

export default RecommendCondition;
