import React from 'react';
import style from './style.module.css';
import { SimilarInfo, RecommendViz } from '../../components';

function MainViz(){
    
    return (
        <div className={style.MainViz}>
            <div className={style.RadVizContainer}>
                <div className='Container'>
                    <RecommendViz />
                </div>
            </div>
            <div className={style.RadHisContainer}>
                <div className='Container'>
                    <SimilarInfo />
                </div>
            </div>
        </div>
    );
}

export default MainViz;
