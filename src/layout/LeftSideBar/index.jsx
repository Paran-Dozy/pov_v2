import React from 'react';
import style from './style.module.css';
import { ChainSelect, WeightSelect } from '../../components';

function LeftSideBar(){
    
    return (
        <div className={style.LeftSideBar}>
            <div className='Container'>
                <div className='ContainerHeader'>
                    <span className='ContainerTitle'>User Input</span>
                    <ChainSelect />
                    <WeightSelect />
                </div>
            </div>
        </div>
    );
}

export default LeftSideBar;
