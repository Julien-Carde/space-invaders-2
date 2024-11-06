import React from 'react';

function InvaderBullet({ x, y }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 5,
        height: 15,
        backgroundColor: 'red',
        borderRadius: '2px'
      }}
    />
  );
}

export default InvaderBullet; 