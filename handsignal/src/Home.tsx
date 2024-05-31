// src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/recognize');
  };

  return (
    <div>
      <h1>Welcome to My React App</h1>
      <p>This is the home page. Click the button below to go to the about page.</p>
      <button onClick={handleClick}>Go to About Page</button>
    </div>
  );
};

export default Home;
