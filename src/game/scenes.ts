export interface Choice {
  text: string;
  nextSceneId: string;
  action?: (state: GameState) => GameState;
}

export interface Scene {
  id: string;
  speaker: string;
  text: string;
  choices: Choice[];
  challenge?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    failSceneId: string;
  };
}

export interface GameState {
  currentSceneId: string;
  inventory: string[];
  skills: {
    networking: number;
    support: number;
    management: number;
  };
  reputation: number;
}

export const initialGameState: GameState = {
  currentSceneId: 'start',
  inventory: [],
  skills: {
    networking: 0,
    support: 0,
    management: 0
  },
  reputation: 0
};

export const scenes: Record<string, Scene> = {
  start: {
    id: 'start',
    speaker: 'SYSTEM',
    text: 'NEURAL LINK ESTABLISHED...\nYEAR: 2142\nLOCATION: SECTOR 7 WASTELAND\n\nYou wake up in a collapsed server room. Dust hangs thick in the air. A flickering terminal in front of you is the only source of light.',
    choices: [
      { text: 'Inspect the terminal', nextSceneId: 'inspect-terminal' },
      { text: 'Look for an exit', nextSceneId: 'look-exit' }
    ]
  },
  'inspect-terminal': {
    id: 'inspect-terminal',
    speaker: 'TERMINAL',
    text: '> ERROR: NETWORK UNREACHABLE\n> DIAGNOSTIC: LAYER 3 LINK DOWN\n\nThe console is waiting for a command. You remember your training... the old world relied on these protocols.',
    choices: [
      { text: 'Attempt to fix the routing table', nextSceneId: 'ccna-challenge-1' },
      { text: 'Search the room for a physical manual', nextSceneId: 'search-manual' }
    ]
  },
  'ccna-challenge-1': {
    id: 'ccna-challenge-1',
    speaker: 'TUTORIAL',
    text: 'To restore the link, you must identify which layer of the OSI model handles routing and logical addressing. This is crucial for rebuilding the communication nodes.',
    challenge: {
      question: 'Which OSI layer is responsible for path determination and IP addressing?',
      options: ['Data Link (Layer 2)', 'Network (Layer 3)', 'Transport (Layer 4)', 'Session (Layer 5)'],
      correctIndex: 1,
      explanation: 'Layer 3, the Network layer, is where routers operate and logical IP addressing occurs.',
      failSceneId: 'failed-fix'
    },
    choices: [
      { 
        text: 'Proceed after fixing the link', 
        nextSceneId: 'link-restored',
        action: (s) => ({ ...s, skills: { ...s.skills, networking: s.skills.networking + 10 } })
      }
    ]
  },
  'look-exit': {
    id: 'look-exit',
    speaker: 'SELF',
    text: 'The door is electronically locked. A small keypad is sparks occasionally. "Project Management Node 4" is etched into the metal.',
    choices: [
      { text: 'Try to bypass the lock using Support skills', nextSceneId: 'it-support-challenge-1' },
      { text: 'Go back to the terminal', nextSceneId: 'inspect-terminal' }
    ]
  },
  'it-support-challenge-1': {
    id: 'it-support-challenge-1',
    speaker: 'TUTORIAL',
    text: 'Standard troubleshooting methodology applies here. What is the very first step in the Cisco Troubleshooting Methodology?',
    challenge: {
      question: 'What is the first step in the troubleshooting process?',
      options: ['Define the problem', 'Gather facts', 'Consider possibilities', 'Create an action plan'],
      correctIndex: 0,
      explanation: 'The first step is always to clearly Define the Problem before moving to fact gathering.',
      failSceneId: 'failed-support'
    },
    choices: [
      { 
        text: 'The door slides open', 
        nextSceneId: 'outside-world',
        action: (s) => ({ ...s, skills: { ...s.skills, support: s.skills.support + 10 } })
      }
    ]
  },
  'link-restored': {
    id: 'link-restored',
    speaker: 'SYSTEM',
    text: 'LINK STATE: UP\nCOMMUNICATIONS RESTORED\n\nA voice crackles through a speaker: "Is anyone there? This is the Haven Settlement. We lost our local network. We need a technician to manage the reconstruction project."',
    choices: [
      { text: 'Accept the mission (Project Management)', nextSceneId: 'pm-intro' },
      { text: 'Ask for more technical details', nextSceneId: 'more-tech' }
    ]
  },
  'outside-world': {
    id: 'outside-world',
    speaker: 'SELF',
    text: 'You step out into the sunlight. The ruins of a data center tower over you. A group of scavengers is trying to wire up a makeshift generator.',
    choices: [
      { text: 'Help them organize the repair project', nextSceneId: 'pm-intro' },
      { text: 'Show them how to secure the connection', nextSceneId: 'ccna-challenge-1' }
    ]
  },
  'pm-intro': {
    id: 'pm-intro',
    speaker: 'SCAVENGER LEADER',
    text: 'We have the parts, but no plan. To rebuild Sector 7, we need to understand the project lifecycle. What is the phase where we actually build the deliverables?',
    challenge: {
      question: 'In the project lifecycle, which phase involves the actual creation of the project products?',
      options: ['Initiating', 'Planning', 'Executing', 'Closing'],
      correctIndex: 2,
      explanation: 'The Execution phase is where the work planned is performed to create the project deliverables.',
      failSceneId: 'failed-pm'
    },
    choices: [
      { 
        text: 'Organize the team and begin reconstruction', 
        nextSceneId: 'victory-demo',
        action: (s) => ({ ...s, skills: { ...s.skills, management: s.skills.management + 10 } })
      }
    ]
  },
  'victory-demo': {
    id: 'victory-demo',
    speaker: 'SYSTEM',
    text: 'CONGRATULATIONS TECHNICIAN.\nYou have successfully used your CCNA, IT Support, and Project Management skills to begin the Silicon Reborn initiative.\n\nThis is just the beginning of your journey to restore the world.',
    choices: [
      { text: 'Restart Adventure', nextSceneId: 'start' }
    ]
  },
  'failed-fix': {
    id: 'failed-fix',
    speaker: 'SYSTEM',
    text: 'CRITICAL ERROR: SYSTEM LOCKOUT.\nYou entered the wrong protocol parameters. The terminal goes dark. You must start over and recall your training.',
    choices: [{ text: 'Try Again', nextSceneId: 'start' }]
  },
  'failed-support': {
    id: 'failed-support',
    speaker: 'SELF',
    text: 'You start pulling wires randomly. A small explosion knocks you back. You need to follow the proper methodology.',
    choices: [{ text: 'Try Again', nextSceneId: 'start' }]
  },
  'failed-pm': {
    id: 'failed-pm',
    speaker: 'SCAVENGER LEADER',
    text: 'You have no idea how to manage this. The project falls apart before it even begins. Try again when you understand the lifecycle.',
    choices: [{ text: 'Try Again', nextSceneId: 'start' }]
  }
};
