// src/Player.js
import React from 'react';

function Player({ x }) {
  return (
    <img src='https://i.pinimg.com/736x/4f/58/c3/4f58c3d87bb666b3e95b0c2b1d01e3d8.jpg'
    style={{
        position: 'absolute',
        left: x,
        bottom: 10,
        width: 50,
        height: 50,
      }}
      />
  );
}

export default Player;