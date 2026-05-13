import { useState, useEffect, useRef } from 'react';
import { initialGameState, scenes, dataFragments, XP_THRESHOLDS } from './game/scenes';
import type { GameState, Scene, TerminalChallenge, Choice } from './game/scenes';
import { Cpu, Shield, Settings, Activity, Zap, Wifi, Star, TrendingUp } from 'lucide-react';
import './styles/game.css';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'silicon_reborn_save';

const TerminalSim = ({ challenge, onComplete }: { challenge: TerminalChallenge, onComplete: (success: boolean, xpReward?: number) => void }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, `${challenge.prompt}${input}`];
    
    if (cmd === challenge.expectedCommand.toLowerCase()) {
      newHistory.push('SUCCESS: COMMAND ACCEPTED');
      setHistory(newHistory);
      setTimeout(() => onComplete(true, challenge.xpReward), 1000);
    } else if (cmd === 'help' || cmd === '?') {
      newHistory.push(`HINT: ${challenge.hint}`);
      setHistory(newHistory);
    } else {
      newHistory.push(`ERROR: INVALID COMMAND "${cmd}"`);
      setHistory(newHistory);
      if (newHistory.filter(h => h.startsWith('ERROR')).length >= 3) {
        setTimeout(() => onComplete(false), 1000);
      }
    }
    setInput('');
  };

  return (
    <div className="dialogue-box" style={{ backgroundColor: '#000', border: '1px solid var(--terminal-green)' }}>
      <div className="terminal-text" style={{ height: '120px', overflowY: 'auto', marginBottom: '10px' }}>
        {history.map((line, i) => <div key={i}>{line}</div>)}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <span>{challenge.prompt}</span>
        <input 
          ref={inputRef}
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          className="terminal-input"
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--terminal-green)', 
            outline: 'none',
            fontFamily: 'var(--font-mono)',
            width: '100%'
          }}
        />
      </form>
    </div>
  );
};

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialGameState;
  });

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [challengeSolved, setChallengeSolved] = useState(false);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const currentScene: Scene = scenes[gameState.currentSceneId] || scenes['start'];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    setIsTyping(true);
    setChallengeSolved(false);
    setShowChallenge(false);
    setShowTerminal(false);

    const timer = setInterval(() => {
      if (currentScene.text[index]) {
        setDisplayedText((prev) => prev + currentScene.text[index]);
        index++;
      }
      if (index >= currentScene.text.length) {
        clearInterval(timer);
        setIsTyping(false);
        if (currentScene.challenge) {
          setShowChallenge(true);
        } else if (currentScene.terminalChallenge) {
          setShowTerminal(true);
        }
      }
    }, 20);

    return () => clearInterval(timer);
  }, [gameState.currentSceneId]);

  const addXP = (amount: number) => {
    setGameState(prev => {
      const newXP = prev.xp + amount;
      let newLevel = prev.level;
      for (let i = 0; i < XP_THRESHOLDS.length; i++) {
        if (newXP >= XP_THRESHOLDS[i]) newLevel = i + 1;
        else break;
      }
      if (newLevel > prev.level) {
        setLevelUp(newLevel);
        setTimeout(() => setLevelUp(null), 3000);
      }
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

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
      if (currentScene.challenge.xpReward) addXP(currentScene.challenge.xpReward);
    } else if (currentScene.challenge) {
      handleChoice(currentScene.challenge.failSceneId);
    }
  };

  const handleTerminalComplete = (success: boolean, xpReward?: number) => {
    if (success && currentScene.terminalChallenge) {
      setChallengeSolved(true);
      setShowTerminal(false);
      if (xpReward) addXP(xpReward);
    } else if (currentScene.terminalChallenge) {
      handleChoice(currentScene.terminalChallenge.failSceneId);
    }
  };

  const checkRequirements = (choice: Choice) => {
    if (!choice.requirements) return true;
    const req = choice.requirements;
    if (req.level && gameState.level < req.level) return false;
    if (req.networking && gameState.skills.networking < req.networking) return false;
    if (req.support && gameState.skills.support < req.support) return false;
    if (req.management && gameState.skills.management < req.management) return false;
    if (req.fragments && !req.fragments.every(f => gameState.discoveredFragments.includes(f))) return false;
    return true;
  };

  const renderArchive = () => (
    <div className="dialogue-box">
      <h3>Ancient Data Archives</h3>
      {gameState.discoveredFragments.length === 0 ? (
        <p>No data fragments discovered yet.</p>
      ) : (
        gameState.discoveredFragments.map(id => {
          const fragment = dataFragments[id];
          return (
            <div key={id} className="card" style={{ backgroundColor: 'rgba(0,40,0,0.5)', border: '1px solid var(--terminal-dim)' }}>
              <h4>{fragment.title}</h4>
              <p style={{ fontSize: '0.8em', fontStyle: 'italic' }}>"{fragment.snippet}"</p>
              <a href={fragment.link} target="_blank" rel="noreferrer" style={{ color: 'var(--terminal-highlight)' }}>
                Access Deep-Dive Module &gt;
              </a>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="terminal-window flicker">
      <div className="scanline"></div>
      <div className="crt-frame"></div>

      <AnimatePresence>
        {levelUp && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="level-up-toast"
          >
            <TrendingUp size={32} /> LEVEL UP: {levelUp}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="stats-bar">
        <div className="stat-group">
          <span className="lvl-badge"><Star size={14} /> LVL: {gameState.level}</span>
          <span>XP: {gameState.xp} / {XP_THRESHOLDS[gameState.level] || 'MAX'}</span>
        </div>
        <div className="stat-group">
          <span><Cpu size={14} /> NET: {gameState.skills.networking}</span>
          <span><Settings size={14} /> SUP: {gameState.skills.support}</span>
          <span><Shield size={14} /> MGT: {gameState.skills.management}</span>
        </div>
        <div className="stat-group">
          <span><Zap size={14} /> PWR: {gameState.settlement.power}%</span>
          <span><Wifi size={14} /> CON: {gameState.settlement.connectivity}%</span>
          <span><Activity size={14} /> STB: {gameState.settlement.stability}%</span>
        </div>
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
            {currentScene.fragmentId && !isTyping && (
              <div style={{ marginTop: '10px', color: 'var(--terminal-highlight)', border: '1px dashed var(--terminal-highlight)', padding: '5px' }}>
                NEW DATA FRAGMENT DISCOVERED: {dataFragments[currentScene.fragmentId].title}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {gameState.currentSceneId === 'archive-view' && renderArchive()}

        {showTerminal && currentScene.terminalChallenge && (
          <TerminalSim 
            challenge={currentScene.terminalChallenge} 
            onComplete={handleTerminalComplete} 
          />
        )}

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

        {(!isTyping && (!currentScene.challenge || challengeSolved) && (!currentScene.terminalChallenge || challengeSolved)) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="choices-container"
          >
            {currentScene.choices.map((choice, i) => {
              const meetsReqs = checkRequirements(choice);
              return (
                <button 
                  key={i} 
                  className={`choice-btn ${!meetsReqs ? 'locked' : ''}`}
                  onClick={() => meetsReqs && handleChoice(choice.nextSceneId, choice.action)}
                  disabled={!meetsReqs}
                >
                  {meetsReqs ? `> ${choice.text}` : `[LOCKED] ${choice.text}`}
                </button>
              );
            })}
            {currentScene.terminalChallenge && challengeSolved && (
              <button 
                className="choice-btn"
                onClick={() => handleChoice(currentScene.terminalChallenge!.successSceneId)}
              >
                &gt; Continue...
              </button>
            )}
            <button className="choice-btn" onClick={() => handleChoice('archive-view')}>
              &gt; View Data Archives
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
