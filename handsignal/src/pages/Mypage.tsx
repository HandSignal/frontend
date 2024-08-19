import React, { useState, ChangeEvent, FormEvent } from "react";
import styles from "../styles/Mypage.module.css";
import Nav from "./Nav";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 아이콘 추가

// 사용자 데이터 타입 정의
interface UserData {
  username: string;
  password: string;
  nickname: string;
}

// 컴포넌트
const Mypage: React.FC = () => {
  const initialUserData: UserData = {
    username: "Hyeonseo",
    password: "히히 비밀번호가 보입니다",
    nickname: "Kittyismylife",
  };

  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [formData, setFormData] = useState<UserData>({ ...initialUserData });
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setUserData(formData);
    alert("정보가 수정되었습니다!");
  };

  const handleDelete = (): void => {
    if (window.confirm("정말로 회원탈퇴하시겠습니까?")) {
      // 실제 회원탈퇴 로직
      alert("회원탈퇴가 완료되었습니다.");
    }
  };

  const togglePasswordVisibility = (): void => {
    setPasswordVisible((prevVisible) => !prevVisible);
  };

  return (
    <div className={styles.pageContainer}>
      <Nav />
      <h1 className={styles.pageHeader}>✨ My Profile ✨</h1>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>
              아이디:
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled
                className={styles.input}
              />
            </label>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.passwordWrapper}>
              비밀번호:
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${styles.passwordInput}`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.passwordToggle}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </label>
          </div>
          <div className={styles.inputGroup}>
            <label>
              닉네임:
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className={styles.input}
              />
            </label>
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleDelete}
              className={styles.deleteButton}
            >
              회원탈퇴
            </button>
            <button type="submit" className={styles.submitButton}>
              회원정보 수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Mypage;
