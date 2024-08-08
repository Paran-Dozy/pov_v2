import React from 'react';
import style from './style.module.css';
import { RawData, BottomLineChart } from '../../components';

function BottomComparison(){
    
    return (
        <div className={style.BottomComparison}>
            <div className={style.LineContainer}>
                <div className='Container'>
                    <BottomLineChart />
                </div>
            </div>
            <div className={style.TableContainer}>
                <div className='Container'>
                    <RawData />
                </div>
            </div>
        </div>
    );
}

export default BottomComparison;
