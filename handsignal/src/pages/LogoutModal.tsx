import React from "react";
import styles from "../styles/LogoutModal.module.css";

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
        <h2>초기화면으로 돌아가시겠습니까?</h2>
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
