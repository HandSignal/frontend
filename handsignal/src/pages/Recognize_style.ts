import { css } from "@emotion/css";

export const container = css`
  background-color: #25AEF2; /* 검정색 배경색 */
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const canvas = css`
  position: absolute;
  width: 1280px;
  height: 720px;
  background-color: #fff;
  border-radius: 30px;
`;

export const buttonContainer = css`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const button = css`
  color: #1187CF; /* 호버 시 글자색 */
  background-color: #FFFFFF; /* 호버 시 배경색 */
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  padding: 10px 10px;
  margin: 15px;
  cursor: pointer;

  &:hover {
    color: #FFFFFF; /* 호버 글씨 색상 */
    background-color: #0E6CA5; /* 호버 배경 색상 */
  }
`;
