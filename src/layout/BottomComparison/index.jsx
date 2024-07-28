import React from 'react';
import style from './style.module.css';
import { RawData } from '../../components';

function BottomComparison(){
    
    return (
        <div className={style.BottomComparison}>
            <div className={style.Container}>
                <div className='Container'>
                    
                </div>
            </div>
            <div className={style.Container}>
                <div className='Container'>
                    <RawData />
                </div>
            </div>
        </div>
    );
}

export default BottomComparison;
