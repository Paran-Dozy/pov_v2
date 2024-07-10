/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import Modal from './modal';
import '../../styles/userInput.css';
import { useDispatch, useSelector } from 'react-redux';
import { addInterested, removeInterested } from '../../store';

function InterestedVal( { ChainData, ValData }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectChain, setSelectChain] = useState('akash');
    const [selectVal, setSelectVal] = useState('0base.vc');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [valList, setValList] = useState(ValData.filter(val => val.chain_id === 'akash'));
    const dispatch = useDispatch();
    const selectedChainVals = useSelector((state) => state.interested.selectedChainVals);


    const chainChange = (event) => {
        const selectedChain = event.target.value;
        const vals = ValData.filter(val => val.chain_id === selectedChain);
        setValList(vals);
        setSelectVal(vals[selectedIndex] ? vals[selectedIndex]['val_id'] : vals[0]['val_id']);
        setSelectChain(selectedChain);
    }

    const valChange = (event) => {
        setSelectVal(event.target.value);
        setSelectedIndex(event.target.selectedIndex);
    }

    const add = () => {
        dispatch(addInterested([selectChain, selectVal]));
    }

    const remove = (index) => {
        dispatch(removeInterested(index));
    }


    const openModal = () => {
        setIsModalOpen(true);
        // document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        // document.body.classList.remove('modal-open');
    };

    return (
        <div className="interestedVal">
            <label className="interest-label">Interested Validator</label>
            <button className="interest-button" onClick={openModal}>▷</button>
            
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h3>Interested Validator</h3>
                <div className="selected">
                    {selectedChainVals.map((val, index) => (
                        <div key={index} className="select-chain-val">
                            <div className="selectInt">{val[0]}</div>
                            <div className="selectInt">{val[1]}</div>
                            <button className="button" onClick={() => remove(index)}>-</button>
                        </div>
                    ))}
                </div>
                <div className="select-chain-val">
                    <select className="selectInt" onChange={chainChange}>
                        {ChainData.map((chain, index) => (
                            <option key={index} value={chain.chain_id}>{chain.chain_id}</option>
                        ))} 
                    </select>
                    <select className="selectInt" onChange={valChange}>
                        {valList.map((val, index) => (
                            <option key={index} value={val.val_id}>{val.val_id}</option>
                        ))} 
                    </select>
                    <button className="button" onClick={add}>
                        +
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default InterestedVal;
