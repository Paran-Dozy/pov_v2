/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import '../../styles/userInput.css';
import { useDispatch } from 'react-redux';
import { resetCircleIds } from '../../store'; // resetCircleIds를 import

function SelectChain({ chainSelect, ChainData }){
    const dispatch = useDispatch();
    
    const handleChange = (event) => {
        chainSelect(event.target.value);
        dispatch(resetCircleIds());
    }

    return (
        <div className="selectChain">
            <label className="Chain">Chain</label>
            <select className="select" onChange={handleChange}>
               {ChainData.map((chain, index) => (
                <option className="chainName" key={index} value={chain.chain_id}>{chain.chain_id}</option>
               ))} 
            </select>
        </div>
    );
}

export default SelectChain;