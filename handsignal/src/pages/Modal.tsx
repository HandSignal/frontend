import React from "react";
import styles from "../styles/Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>정말 로그아웃 하시겠습니까?</h2>
        <button onClick={onClose} className={styles.modalButton}>
          취소
        </button>
        <button onClick={onConfirm} className={styles.modalButton}>
          확인
        </button>
      </div>
    </div>
  );
};

export default Modal;
