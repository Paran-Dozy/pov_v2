import React from 'react';
import style from './style.module.css';
import RadViz from '../../components/RadViz';

function MainViz(){
    
    return (
        <div className={style.MainViz}>
            <div className={style.RadVizContainer}>
                <div className='Container'>
                    <RadViz />
                </div>
            </div>
            <div className={style.RadHisContainer}>
                <div className='Container'></div>

            </div>
        </div>
    );
}

export default MainViz;
