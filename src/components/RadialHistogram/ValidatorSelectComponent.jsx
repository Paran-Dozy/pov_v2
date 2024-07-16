import React, { useEffect, useState } from 'react';
import style from './style.module.css';
import { useSelector, useDispatch } from 'react-redux';
import ChainData from '../../data/chain.json';
import { setVoter } from '../../store';

function ValidatorSelectComponent() {
    const [validatorList, setValidatorList] = useState([]);
    const inputChain = useSelector((state) => state.chain.inputChain);
    const dispatch = useDispatch();

    const handleChange = (event) => {
        dispatch(setVoter(event.target.value));
    }

    useEffect(() => {
        ChainData.forEach((chain) => {
            if(chain.chain_id === inputChain){
                setValidatorList(chain.val_list);
            }
        });
    }, [inputChain]);

    return (
        <div>
            <label className={style.title}>Validator</label>
            <select className={style.dropdown} onChange={handleChange}>
                {validatorList.map((voter, index) => (
                    <option className="chainName" key={index} value={voter}>{voter}</option>
                ))} 
            </select>
        </div>
    );
}

export default ValidatorSelectComponent;
