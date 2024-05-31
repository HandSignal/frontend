// src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/recognize');
  };

  return (
    <div className="home-container">
      {/* <h1>Welcome to My React App</h1>
      <p>This is the home page. Click the button below to go to the about page.</p> */}
      <button onClick={handleClick}>번역 서비스 이용하기</button>
    </div>
  );
};

export default Home;
