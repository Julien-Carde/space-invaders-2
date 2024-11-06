// src/Game.js
import React, { useState, useEffect } from 'react';
import Player from './Player';
import Invader from './Invader';
import Bullet from './Bullet';

function Game() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [playerPosition, setPlayerPosition] = useState(270);
  const [bullets, setBullets] = useState([]);
  const [invaders, setInvaders] = useState([]);
  const [invaderDirection, setInvaderDirection] = useState(1);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('highScore')) || 0
  );
  const [level, setLevel] = useState(1);
  const [maxGameWidth, setMaxGameWidth] = useState(600); // default to 600px

  // Load high score on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Check for game over conditions
  useEffect(() => {
    // Check if invaders reached the bottom
    if (invaders.some(invader => invader.y >= 440)) {
      setGameState('gameOver');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('highScore', score.toString());
      }
      setLevel(1); // Reset level on game over
    }
    // Check if all invaders are destroyed
    if (invaders.length === 0 && gameState === 'playing') {
      if (level === 1) {
        setLevel(2);
        resetGame();
      } else {
        setGameState('victory');
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('highScore', score.toString());
        }
        setLevel(1); // Reset level for next game
      }
    }
  }, [invaders, score, highScore, gameState, level]);

  // Update collision detection to include score
  useEffect(() => {
    setBullets((bullets) =>
      bullets.filter((bullet) => {
        let hit = false;
        setInvaders((invaders) =>
          invaders.filter((invader) => {
            if (
              bullet.x >= invader.x &&
              bullet.x <= invader.x + 40 &&
              bullet.y >= invader.y &&
              bullet.y <= invader.y + 40
            ) {
              hit = true;
              setScore(prevScore => prevScore + 100);
              return false;
            }
            return true;
          })
        );
        return !hit;
      })
    );
  }, [bullets]);

  // Reset game function
  const resetGame = () => {
    setPlayerPosition(maxGameWidth / 2); // Center the player
    setBullets([]);
    const initialInvaders = [];
    const rows = level === 1 ? 3 : 4;
    const invadersPerRow = Math.floor(maxGameWidth / 80); // 80px spacing between invaders
    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < invadersPerRow; i++) {
        initialInvaders.push({ 
          x: i * 80 + 20, 
          y: row * 60 + 20 
        });
      }
    }
    setInvaders(initialInvaders);
    setInvaderDirection(1);
    setScore(0);
    setGameState('playing');
  };

  // Inside the Game component
  useEffect(() => {
    if (gameState === 'start') {
      document.getElementById('start-screen').focus();
    }
  }, [gameState]);

  // Initialize invaders
  useEffect(() => {
    const initialInvaders = [];
    const rows = level === 1 ? 3 : 4;
    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < 8; i++) {
        initialInvaders.push({ x: i * 60 + 20, y: row * 60 + 20 });
      }
    }
    setInvaders(initialInvaders);
  }, [level]);

  // Handle player movement and shooting
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setPlayerPosition((pos) => Math.max(pos - 20, 0));
      } else if (e.key === 'ArrowRight') {
        setPlayerPosition((pos) => Math.min(pos + 20, 540));
      } else if (e.key === ' ') {
        // Fire bullet
        setBullets((bullets) => [
          ...bullets,
          { x: playerPosition + 15, y: 480 },
        ]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition]);

  // Update bullets
  useEffect(() => {
    const interval = setInterval(() => {
      setBullets((bullets) =>
        bullets
          .map((bullet) => ({ ...bullet, y: bullet.y - 10 }))
          .filter((bullet) => bullet.y > 0)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Update invaders
  useEffect(() => {
    const interval = setInterval(() => {
      setInvaders((invaders) => {
        // Get the current game window width
        const gameWindow = document.querySelector('[style*="gameWindowStyle"]');
        const maxWidth = gameWindow ? gameWindow.offsetWidth - 40 : 540; // 40px for invader width

        // Change direction at edges
        const atEdge = invaders.some(
          (invader) => invader.x <= 0 || invader.x >= maxWidth
        );
        if (atEdge) {
          setInvaderDirection((dir) => -dir);
          return invaders.map((invader) => ({
            ...invader,
            y: invader.y + 20,
          }));
        }
        return invaders.map((invader) => ({
          ...invader,
          x: invader.x + invaderDirection * 10,
        }));
      });
    }, 500);
    return () => clearInterval(interval);
  }, [invaderDirection]);

  // Add these new styles at the top of the component
  const gameContainerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'black',
    overflow: 'hidden',
    touchAction: 'none', // Prevents scrolling on touch devices
  };

  const gameWindowStyle = {
    position: 'relative',
    width: '95vw', // 95% of viewport width
    maxWidth: '600px',
    height: '70vh', // 70% of viewport height
    maxHeight: '500px',
    background: 'black',
    overflow: 'hidden',
    margin: '0 auto',
  };

  const controlsStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
  };

  const directionControlsStyle = {
    display: 'flex',
    gap: '10px',
  };

  const buttonStyle = {
    width: '60px',
    height: '60px',
    fontSize: '24px',
    background: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    touchAction: 'manipulation',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    userSelect: 'none',
  };

  // Add touch control handlers
  const handleMoveLeft = () => {
    setPlayerPosition((pos) => Math.max(pos - 20, 0));
  };

  const handleMoveRight = () => {
    setPlayerPosition((pos) => Math.min(pos + 20, 540));
  };

  const handleShoot = () => {
    setBullets((bullets) => [...bullets, { x: playerPosition + 15, y: 480 }]);
  };

  const titleStyle = {
    position: 'fixed',
    top: '20px',
    left: '0',
    right: '0',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: "'Press Start 2P', cursive", // Make sure this font is imported
    fontSize: '24px',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    margin: '0',
    userSelect: 'none',
  };

  const gameOverStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'white',
    textAlign: 'center',
  };

  const gameOverTextStyle = {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '24px',
    marginBottom: '20px',
  };

  const scoreTextStyle = {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '18px',
    marginBottom: '30px',
  };

  const playAgainButtonStyle = {
    padding: '15px 30px',
    fontSize: '16px',
    background: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '25px',
    cursor: 'pointer',
    fontFamily: "'Press Start 2P', cursive",
  };

  // Add this style definition with your other styles
  const scoreStyle = {
    position: 'absolute',
    top: '80px', // Adjust this value to position below the title
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '18px',
    zIndex: 1,
  };

  // Add this useEffect to update maxGameWidth when the component mounts and on window resize
  useEffect(() => {
    const updateGameWidth = () => {
      const gameWindow = document.querySelector('[style*="gameWindowStyle"]');
      if (gameWindow) {
        setMaxGameWidth(gameWindow.offsetWidth);
      }
    };
    
    // Initial width
    updateGameWidth();
    
    // Update on resize
    window.addEventListener('resize', updateGameWidth);
    return () => window.removeEventListener('resize', updateGameWidth);
  }, []);

  // Modify the return statements to include the new styles and controls
  if (gameState === 'start') {
    return (
      <div style={gameContainerStyle}>
        <div
          id="start-screen"
          style={gameWindowStyle}
          onKeyDown={(e) => setGameState('playing')}
          onClick={() => setGameState('playing')}
          tabIndex="0"
        >
          <h3 className='start-message'>
            {isMobile ? 'Tap to start' : 'Press any key to start'}
          </h3>
          <p style={{ fontFamily: 'Press Start 2P', fontSize: '16px', textAlign: 'center' }}>
            <span style={{ fontFamily: "'Press Start 2P', cursive" }}>High Score: {highScore}</span>
          </p>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver' || gameState === 'victory') {
    return (
      <div style={gameContainerStyle}>
        <div style={gameWindowStyle}>
          <div style={gameOverStyle}>
            <div style={gameOverTextStyle}>
              {gameState === 'victory' ? 'YOU WIN!' : 'GAME OVER'}
            </div>
            <div style={scoreTextStyle}>Score: {score}</div>
            <button 
              style={playAgainButtonStyle}
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={gameContainerStyle}>
      <h1 style={titleStyle}>Space Invaders</h1>
      <div style={scoreStyle}>Score: {score}</div>
      <div style={gameWindowStyle}>
        <Player x={playerPosition} />
        {invaders.map((invader, index) => (
          <Invader key={index} x={invader.x} y={invader.y} />
        ))}
        {bullets.map((bullet, index) => (
          <Bullet key={index} x={bullet.x} y={bullet.y} />
        ))}
      </div>
      {isMobile && (
        <div style={controlsStyle}>
          <button style={buttonStyle} onTouchStart={handleShoot}>
            •
          </button>
          <div style={directionControlsStyle}>
            <button style={buttonStyle} onTouchStart={handleMoveLeft}>
              ←
            </button>
            <button style={buttonStyle} onTouchStart={handleMoveRight}>
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;