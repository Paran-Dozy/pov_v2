import React from 'react';
import style from './style.module.css';
import { RadViz, RadialHistogram } from '../../components';
import NetworkComponent from '../../components/SimilarityNetwork';

function MainViz(){
    
    return (
        <div className={style.MainViz}>
            <div className={style.RadVizContainer}>
                <div className='Container'>
                    <NetworkComponent />
                </div>
            </div>
            <div className={style.RadHisContainer}>
                <div className='Container'>

                </div>
            </div>
        </div>
    );
}

export default MainViz;
