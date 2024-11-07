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
    if (gameState !== 'playing') return; // Only check during active gameplay

    // Check if invaders reached the bottom
    if (invaders.some(invader => invader.y >= maxGameWidth * 0.8)) {
      setGameState('gameOver');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('highScore', score.toString());
      }
      setLevel(1);
    }
    // Check if all invaders are destroyed
    else if (invaders.length === 0) {
      if (level === 1) {
        console.log('Level 1 completed, advancing to level 2');
        setLevel(2);
        const initialInvaders = [];
        const rows = 4; // Level 2 has 4 rows
        const invaderSize = 30;
        
        // Simplified spacing calculation for mobile
        const gameWindow = document.querySelector('[style*="gameWindowStyle"]');
        const availableWidth = gameWindow ? gameWindow.offsetWidth : maxGameWidth;
        const totalInvaders = isMobile ? 7 : Math.floor((availableWidth - invaderSize) / (invaderSize * 1.5));
        
        // Calculate spacing to fit all invaders
        const totalWidth = invaderSize * totalInvaders;
        const spacing = (availableWidth - totalWidth) / (totalInvaders + 1);
        
        for (let row = 0; row < rows; row++) {
          for (let i = 0; i < totalInvaders; i++) {
            initialInvaders.push({ 
              x: spacing + i * (invaderSize + spacing),
              y: row * (invaderSize + 10) + 20
            });
          }
        }
        setInvaders(initialInvaders);
        setInvaderDirection(1);
      } else if (level === 2) {
        console.log('Level 2 completed, showing victory screen');
        setGameState('victory');
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('highScore', score.toString());
        }
      }
    }
  }, [invaders, score, highScore, gameState, level, maxGameWidth, isMobile]);

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
    console.log('Resetting game for level:', level);
    setPlayerPosition(maxGameWidth / 2);
    setBullets([]);
    
    // Only reset score for new games
    if (gameState !== 'playing') {
      setScore(0);
      setLevel(1);
    }
    
    const rows = 3; // Always start with 3 rows for level 1
    const invaderSize = 30;
    const spacing = invaderSize * 1.5;
    const invadersPerRow = isMobile ? 7 : Math.floor((maxGameWidth - spacing) / spacing);
    
    const initialInvaders = [];
    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < invadersPerRow; i++) {
        initialInvaders.push({ 
          x: i * spacing,
          y: row * (spacing * 0.8) + 20
        });
      }
    }
    
    setInvaders(initialInvaders);
    setInvaderDirection(1);
    setGameState('playing');
  };

  // Inside the Game component
  useEffect(() => {
    if (gameState === 'start') {
      document.getElementById('start-screen').focus();
    }
  }, [gameState]);

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
    const invaderSize = 30;
    const interval = setInterval(() => {
      setInvaders((invaders) => {
        const gameWindow = document.querySelector('[style*="gameWindowStyle"]');
        const gameWidth = gameWindow ? gameWindow.offsetWidth : maxGameWidth;
        
        // Check if any invader would hit the boundaries after movement
        const wouldHitBoundary = invaders.some(invader => {
          const nextX = invader.x + (invaderDirection * 3);
          return nextX <= 0 || (nextX + invaderSize) >= gameWidth;
        });
        
        if (wouldHitBoundary) {
          setInvaderDirection((dir) => -dir);
          return invaders.map((invader) => ({
            ...invader,
            y: invader.y + 20,
          }));
        }
        
        return invaders.map((invader) => ({
          ...invader,
          x: invader.x + invaderDirection * 3,
        }));
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [invaderDirection, maxGameWidth]);

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
    const gameWindow = document.querySelector('[style*="gameWindowStyle"]');
    const gameWidth = gameWindow ? gameWindow.offsetWidth : maxGameWidth;
    const playerWidth = 50; // Width of player ship
    setPlayerPosition((pos) => Math.min(pos + 20, gameWidth - playerWidth));
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

  // Add level display to the game screen
  const levelStyle = {
    position: 'absolute',
    top: '120px', // Position it below the score
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '16px',
    zIndex: 1,
  };

  // Modify the return statements to include the new styles and controls
  if (gameState === 'start') {
    return (
      <div style={gameContainerStyle}>
        <div
          id="start-screen"
          style={gameWindowStyle}
          onKeyDown={() => {
            setLevel(1); // Ensure we start at level 1
            setGameState('playing');
            resetGame();
          }}
          onClick={() => {
            setLevel(1); // Ensure we start at level 1
            setGameState('playing');
            resetGame();
          }}
          tabIndex="0"
        >
          <h3 className='start-message' style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 1)',
            fontFamily: "'Press Start 2P', cursive",
            margin: 0
          }}>
            {isMobile ? 'Tap to start' : 'Press any key to start'}
          </h3>
          <p style={{
            position: 'absolute',
            top: '60%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 1)',
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '16px',
            margin: 0
          }}>
            High Score: {highScore}
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
              onClick={() => {
                setLevel(1);
                setGameState('start');
                setScore(0);
              }}
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