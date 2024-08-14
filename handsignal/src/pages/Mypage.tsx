import React, { useState, ChangeEvent, FormEvent } from "react";
import styles from "../styles/Mypage.module.css";
import Nav from "./Nav";

// 사용자 데이터 타입 정의
interface UserData {
  username: string;
  password: string;
  nickname: string;
}

// 컴포넌트
const Mypage: React.FC = () => {
  // 초기 사용자 데이터
  const initialUserData: UserData = {
    username: "Hyeonseo",
    password: "히히 비밀번호가 보입니다",
    nickname: "Kittyismylife",
  };

  // 사용자 데이터 상태
  const [userData, setUserData] = useState<UserData>(initialUserData);
  // 폼 데이터 상태
  const [formData, setFormData] = useState<UserData>({
    username: userData.username,
    password: userData.password,
    nickname: userData.nickname,
  });
  // 비밀번호 보이기/숨기기 상태
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  // 입력 값 변경 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // 사용자 데이터 업데이트
    setUserData(formData);
    alert("정보가 수정되었습니다!");
  };

  // 회원탈퇴 핸들러
  const handleDelete = (): void => {
    if (window.confirm("정말로 회원탈퇴하시겠습니까?")) {
      // 회원탈퇴 로직 (예: API 호출)
      alert("회원탈퇴가 완료되었습니다.");
    }
  };

  // 비밀번호 보이기/숨기기 토글 핸들러
  const togglePasswordVisibility = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className={styles.pageContainer}>
      <Nav />
      <h1 className={styles.pageHeader}>마이페이지</h1>
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
              <input
                type="checkbox"
                checked={passwordVisible}
                onChange={togglePasswordVisibility}
                className={styles.passwordToggle}
              />
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
          <button type="submit" className={styles.submitButton}>
            회원정보 수정
          </button>
          <button onClick={handleDelete} className={styles.deleteButton}>
            회원탈퇴
          </button>
        </form>
      </div>
    </div>
  );
};

export default Mypage;
