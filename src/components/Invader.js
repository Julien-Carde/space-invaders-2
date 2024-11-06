// src/Invader.js
import React from 'react';

function Invader({ x, y }) {
  return (
    <img
      src={
        y > 0 ? "https://i.pinimg.com/originals/17/29/ef/1729ef6fdc0b81a56987d4d549e20e76.png" :
        "https://i.pinimg.com/736x/17/29/ef/1729ef6fdc0b81a56987d4d549e20e76.png"
      }
      alt="Invader"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 40,
        height: 40,
      }}
    />
  );
}

export default Invader;