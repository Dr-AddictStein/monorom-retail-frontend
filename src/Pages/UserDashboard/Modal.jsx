// Modal.js
import React from "react";

const Modal = ({ isOpen, onClose, children, maxWidthClass = "max-w-lg" }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100] p-4 overflow-auto"
            onClick={onClose}
        >
            <div 
                className={`bg-white rounded-lg shadow-lg p-6 w-11/12 ${maxWidthClass} relative z-[101] my-auto max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="absolute top-2 right-2 text-gray-600 text-xl" onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
