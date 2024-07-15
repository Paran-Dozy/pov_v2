import React, { useState } from 'react';
import style from './style.module.css';

function LeftSideBar(){
    const [expanded, setExpanded] = useState(false);

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
                            <p>This is additional content visible when expanded.</p>
                        </div>
                    )}
                </div>
            </div>
            <div className={style.RankingContainer}>
                <div className='Container'>
                    
                </div>
            </div>
        </div>
    );
}

export default LeftSideBar;
