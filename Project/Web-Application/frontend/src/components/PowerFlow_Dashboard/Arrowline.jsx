// ArrowLine.jsx
import React from "react";
// import "./App.css"; // Assuming your CSS is in App.css

const ArrowLine = ({ count = 5 , className }) => {
  return (
    <div className={`arrow-track ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animated-arrow"
          style={{ animationDelay: `${index * 2}s` }} // Staggered by 1s
        >
          ➤
        </div>
      ))}
    </div>
  );
};

export default ArrowLine;
