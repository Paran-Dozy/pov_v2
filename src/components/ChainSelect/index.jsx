import { React } from 'react';
import { useDispatch } from 'react-redux';
import { setChain, setVoter } from '../../store';

import style from './style.module.css';
import ChainData from '../../data/chain.json';


function ChainSelect(){
    const dispatch = useDispatch();
    
    const handleChange = (event) => {
        dispatch(setChain(event.target.value));
        ChainData.forEach((chain) => {
            if(chain.chain_id === event.target.value){
                dispatch(setVoter(chain.val_list[0]));
            }
        });
    }

    return (
        <div>
            <label className={style.title}>Chain</label>
            <select className={style.dropdown} onChange={handleChange}>
                {ChainData.map((chain, index) => (
                    <option className="chainName" key={index} value={chain.chain_id}>{chain.chain_id}</option>
                ))} 
            </select>
        </div>
    );
}

export default ChainSelect;