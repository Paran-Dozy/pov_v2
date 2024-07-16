import React from 'react';
import style from './style.module.css';
import { RadViz, RadialHistogram } from '../../components';

function MainViz(){
    
    return (
        <div className={style.MainViz}>
            <div className={style.RadVizContainer}>
                <div className='Container'>
                    <RadViz />
                </div>
            </div>
            <div className={style.RadHisContainer}>
                <div className='Container'>
                    <RadialHistogram />
                </div>
            </div>
        </div>
    );
}

export default MainViz;
