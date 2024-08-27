import React from "react";
import "../styles/SignItem.module.css";

interface SignItemProps {
  name: string;
  videoUrl: string;
  description: string;
}

const SignItem: React.FC<SignItemProps> = ({ name, videoUrl, description }) => {
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);

  const toggleVideo = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  return (
    <div className="sign-item">
      <h2>{name}</h2>
      <video width="320" height="240" controls>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button onClick={toggleVideo}>
        {isVideoPlaying ? "Hide Description" : "Show Description"}
      </button>
      {isVideoPlaying && <p className="description">{description}</p>}
    </div>
  );
};

export default SignItem;
