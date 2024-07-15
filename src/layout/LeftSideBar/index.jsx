import React, { useState } from 'react';
import style from './style.module.css';
import { ChainSelect, WeightSelect, Ranking } from '../../components';

function LeftSideBar(){
    const [expanded, setExpanded] = useState(true);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    return (
        <div className={style.LeftSideBar}>
            <div className={`${style.UserInputContainer} ${expanded ? style.expanded : ''}`}>
                <div className='Container'>
                    <div className='ContainerHeader'>
                        <span className='ContainerTitle'>User Input</span>
                        <button className={style.expandButton} onClick={toggleExpand}>
                            {expanded ? '∧' : '∨'}
                        </button>
                    </div>
                    {expanded && (
                        <div className={style.UserInputContent}>
                            <ChainSelect />
                            <WeightSelect />
                        </div>
                    )}
                </div>
            </div>
            <div className={style.RankingContainer}>
                <div className='Container'>
                    <Ranking />
                </div>
            </div>
        </div>
    );
}

export default LeftSideBar;
