import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Recognize from "./Recognize";
import Signup from "./Signup";
import Main from "./Main";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Main />} />
        <Route path="/recognize" element={<Recognize />} />
      </Routes>
    </Router>
  );
};

export default App;
