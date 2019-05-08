import React, { useState } from 'react';
import './Emoji.css';

export default ({ icon }) => {
  const defaultPosition = `${Math.floor(Math.random() * 100) + 1}vw`;
  const [horizontalPosition] = useState(defaultPosition);

  const defaultSize = `${Math.floor(Math.random() * 3) + 2}vw`;
  const [fontSize] = useState(defaultSize);

  return (
    <span
      className="emoji"
      role="img"
      aria-label="emoji"
      style={{ fontSize, left: horizontalPosition }}
    >
      {icon}
    </span>
  );
};
