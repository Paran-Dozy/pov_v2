/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, {useEffect} from 'react';
import '../../styles/modal.css';

function Modal({ isOpen, onClose, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-button" onClick={onClose}>✖</button>
                {children}
            </div>
        </div>
    );
}

export default Modal;
