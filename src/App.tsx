import { useState, useEffect } from 'react';
import { initialGameState, scenes } from './game/scenes';
import type { GameState, Scene } from './game/scenes';
import { Cpu, Shield, Settings } from 'lucide-react';
import './styles/game.css';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeSolved, setChallengeSolved] = useState(false);

  const currentScene: Scene = scenes[gameState.currentSceneId] || scenes['start'];

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    setIsTyping(true);
    setChallengeSolved(false);
    setShowChallenge(false);

    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + currentScene.text[index]);
      index++;
      if (index >= currentScene.text.length) {
        clearInterval(timer);
        setIsTyping(false);
        if (currentScene.challenge) {
          setShowChallenge(true);
        }
      }
    }, 20);

    return () => clearInterval(timer);
  }, [gameState.currentSceneId]);

  const handleChoice = (sceneId: string, action?: (s: GameState) => GameState) => {
    if (isTyping) return;
    let nextState = { ...gameState, currentSceneId: sceneId };
    if (action) {
      nextState = action(nextState);
    }
    setGameState(nextState);
  };

  const handleChallengeAnswer = (index: number) => {
    if (currentScene.challenge && index === currentScene.challenge.correctIndex) {
      setChallengeSolved(true);
      setShowChallenge(false);
    } else if (currentScene.challenge) {
      handleChoice(currentScene.challenge.failSceneId);
    }
  };

  return (
    <div className="terminal-window flicker">
      <div className="scanline"></div>
      <div className="crt-frame"></div>

      <div className="stats-bar">
        <span><Cpu size={14} /> NET: {gameState.skills.networking}</span>
        <span><Settings size={14} /> SUP: {gameState.skills.support}</span>
        <span><Shield size={14} /> MGT: {gameState.skills.management}</span>
        <span>REP: {gameState.reputation}</span>
      </div>

      <div className="narrative-container">
        <AnimatePresence mode="wait">
          <motion.div 
            key={gameState.currentSceneId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="dialogue-box"
          >
            <div style={{ color: 'var(--terminal-highlight)', marginBottom: '5px' }}>
              [{currentScene.speaker}]
            </div>
            <div className="terminal-text">
              {displayedText}
              {isTyping && <span className="cursor">_</span>}
            </div>
          </motion.div>
        </AnimatePresence>

        {showChallenge && currentScene.challenge && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="dialogue-box"
            style={{ borderColor: 'var(--terminal-highlight)' }}
          >
            <div style={{ color: 'var(--terminal-highlight)', marginBottom: '10px' }}>
              TECHNICAL CHALLENGE: {currentScene.challenge.question}
            </div>
            <div className="choices-container">
              {currentScene.challenge.options.map((opt, i) => (
                <button 
                  key={i} 
                  className="choice-btn"
                  onClick={() => handleChallengeAnswer(i)}
                >
                  {i + 1}. {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {(!isTyping && (!currentScene.challenge || challengeSolved)) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="choices-container"
          >
            {currentScene.choices.map((choice, i) => (
              <button 
                key={i} 
                className="choice-btn"
                onClick={() => handleChoice(choice.nextSceneId, choice.action)}
              >
                &gt; {choice.text}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
