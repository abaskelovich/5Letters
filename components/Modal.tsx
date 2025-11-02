
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, message, onConfirm, confirmText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-11/12 max-w-md text-center border border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-yellow-400">{title}</h2>
        <p className="text-base sm:text-lg mb-6 text-gray-300">{message}</p>
        <button
          onClick={onConfirm}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

export default Modal;
