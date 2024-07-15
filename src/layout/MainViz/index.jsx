import React from 'react';
import style from './style.module.css';

function MainViz(){
    
    return (
        <div className={style.MainViz}>
            <div className={style.RadVizContainer}>
                <div className='Container'>
                    
                </div>
            </div>
            <div className={style.RadHisContainer}>
                <div className='Container'></div>

            </div>
        </div>
    );
}

export default MainViz;
