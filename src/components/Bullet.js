// src/Bullet.js
import React from 'react';

function Bullet({ x, y, isInvaderBullet }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x + 8,
        top: y - 22,
        width: 5,
        height: 10,
        backgroundColor: isInvaderBullet ? 'red' : 'white',
      }}
    />
  );
}

export default Bullet;