export interface Choice {
  text: string;
  nextSceneId: string;
  action?: (state: GameState) => GameState;
}

export interface TerminalChallenge {
  prompt: string;
  expectedCommand: string;
  hint: string;
  successSceneId: string;
  failSceneId: string;
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
  terminalChallenge?: TerminalChallenge;
  fragmentId?: string; // ID of the Data Fragment discovered in this scene
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
  settlement: {
    power: number;
    connectivity: number;
    stability: number;
  };
  discoveredFragments: string[];
}

export const initialGameState: GameState = {
  currentSceneId: 'start',
  inventory: [],
  skills: {
    networking: 0,
    support: 0,
    management: 0
  },
  reputation: 0,
  settlement: {
    power: 0,
    connectivity: 0,
    stability: 0
  },
  discoveredFragments: []
};

export const dataFragments: Record<string, { title: string; link: string; snippet: string }> = {
  'osi-deep-dive': {
    title: 'Archive: OSI Layer 3',
    link: 'https://Bgarrison84.github.io/ccna-guide/#/module/osi-model',
    snippet: 'The Network layer is responsible for path determination and logical addressing. In the old world, routers were the guardians of this layer.'
  },
  'subnetting-manual': {
    title: 'Manual: IP Math',
    link: 'https://Bgarrison84.github.io/ccna-guide/#/module/subnetting',
    snippet: 'Subnetting allowed the ancients to divide their massive networks into manageable pieces. A /26 mask equals 255.255.255.192.'
  }
};

export const scenes: Record<string, Scene> = {
  start: {
    id: 'start',
    speaker: 'SYSTEM',
    text: 'NEURAL LINK ESTABLISHED...\nYEAR: 2142\nLOCATION: SECTOR 7 WASTELAND\n\nYou wake up in a collapsed server room. The air smells of ozone and decay. A terminal flickers, its green glow illuminating a dusty manual on the floor.',
    choices: [
      { text: 'Pick up the dusty manual', nextSceneId: 'found-manual' },
      { text: 'Login to the terminal', nextSceneId: 'terminal-login' }
    ]
  },
  'found-manual': {
    id: 'found-manual',
    speaker: 'SELF',
    text: 'It\'s an ancient training guide. Most pages are torn, but a section on IPv4 addressing is still readable.',
    fragmentId: 'subnetting-manual',
    choices: [
      { 
        text: 'Access the terminal with this new knowledge', 
        nextSceneId: 'terminal-login',
        action: (s) => ({ ...s, discoveredFragments: [...s.discoveredFragments, 'subnetting-manual'] })
      }
    ]
  },
  'terminal-login': {
    id: 'terminal-login',
    speaker: 'TERMINAL',
    text: 'RE-CORE OS v4.2.1\nLOGIN REQUIRED...\n\nTo bypass the lockout, you must demonstrate basic IOS proficiency. Enter the command to enter Privileged EXEC mode.',
    terminalChallenge: {
      prompt: 'Router>',
      expectedCommand: 'enable',
      hint: 'The ancients used "enable" to gain higher privileges.',
      successSceneId: 'config-mode',
      failSceneId: 'failed-fix'
    },
    choices: []
  },
  'config-mode': {
    id: 'config-mode',
    speaker: 'TERMINAL',
    text: 'PRIVILEGED ACCESS GRANTED.\n\nNow, enter the command to enter Global Configuration mode.',
    terminalChallenge: {
      prompt: 'Router#',
      expectedCommand: 'configure terminal',
      hint: 'Short for "config t".',
      successSceneId: 'restore-comm-link',
      failSceneId: 'failed-fix'
    },
    choices: []
  },
  'restore-comm-link': {
    id: 'restore-comm-link',
    speaker: 'SYSTEM',
    text: 'CONFIG MODE ENABLED.\nYou have restored the core routing protocols. The Haven Settlement suddenly appears on your scan.',
    choices: [
      { 
        text: 'Transmit coordinates to Haven', 
        nextSceneId: 'haven-contact',
        action: (s) => ({ 
          ...s, 
          settlement: { ...s.settlement, connectivity: 20 },
          skills: { ...s.skills, networking: s.skills.networking + 20 }
        })
      }
    ]
  },
  'haven-contact': {
    id: 'haven-contact',
    speaker: 'ELARA (HAVEN LEADER)',
    text: 'Technician! You fixed the link! We\'ve been isolated for months. Our power grid is failing, and we need a Project Manager to lead the repair teams.',
    choices: [
      { text: 'Head to Haven (Project Management)', nextSceneId: 'pm-challenge-complex' },
      { text: 'Fix their local network first (IT Support)', nextSceneId: 'it-support-complex' }
    ]
  },
  'pm-challenge-complex': {
    id: 'pm-challenge-complex',
    speaker: 'PROJECT TERMINAL',
    text: 'To rebuild the power grid, you must manage multiple stakeholders and resources. What is the document that formally authorizes the existence of a project?',
    challenge: {
      question: 'Which document provides the project manager with the authority to apply organizational resources to project activities?',
      options: ['Project Management Plan', 'Project Charter', 'Work Performance Data', 'Business Case'],
      correctIndex: 1,
      explanation: 'The Project Charter is the document that formally authorizes the project and gives the PM authority.',
      failSceneId: 'failed-pm'
    },
    choices: [
      { 
        text: 'Approve the Charter and begin work', 
        nextSceneId: 'settlement-growing',
        action: (s) => ({ 
          ...s, 
          settlement: { ...s.settlement, stability: 30, power: 40 },
          skills: { ...s.skills, management: s.skills.management + 25 }
        })
      }
    ]
  },
  'it-support-complex': {
    id: 'it-support-complex',
    speaker: 'SELF',
    text: 'The Haven local network is a mess. Devices can\'t communicate even though they are on the same switch. You suspect a VLAN configuration error.',
    terminalChallenge: {
      prompt: 'Switch#',
      expectedCommand: 'show vlan brief',
      hint: 'Use the command to see all VLAN assignments.',
      successSceneId: 'vlan-fix',
      failSceneId: 'failed-support'
    },
    choices: []
  },
  'vlan-fix': {
    id: 'vlan-fix',
    speaker: 'SYSTEM',
    text: 'VLAN database accessed. You reassign the ports correctly. The network hums to life.',
    fragmentId: 'osi-deep-dive',
    choices: [
      { 
        text: 'Proceed to Settlement Center', 
        nextSceneId: 'settlement-growing',
        action: (s) => ({ 
          ...s, 
          settlement: { ...s.settlement, connectivity: 50 },
          skills: { ...s.skills, support: s.skills.support + 20 },
          discoveredFragments: [...s.discoveredFragments, 'osi-deep-dive']
        })
      }
    ]
  },
  'settlement-growing': {
    id: 'settlement-growing',
    speaker: 'SYSTEM',
    text: 'SETTLEMENT STATUS UPDATED:\nPOWER: [||||      ]\nCONNECTIVITY: [|||||||   ]\nSTABILITY: [|||       ]\n\nThe people of Haven look to you for guidance. Rebuilding the Silicon world is a massive project, but with your skills, it\'s possible.',
    choices: [
      { text: 'Continue Expansion (Coming Soon)', nextSceneId: 'victory-demo' },
      { text: 'Review Ancient Data Archives', nextSceneId: 'archive-view' }
    ]
  },
  'archive-view': {
    id: 'archive-view',
    speaker: 'DATABASE',
    text: 'ACCESSING DISCOVERED DATA FRAGMENTS...',
    choices: [
      { text: 'Return to Settlement', nextSceneId: 'settlement-growing' }
    ]
  },
  'failed-fix': {
    id: 'failed-fix',
    speaker: 'SYSTEM',
    text: 'CRITICAL ERROR: SYSTEM LOCKOUT.\nYou entered an invalid command. The terminal goes dark. You must start over and recall your training.',
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
  },
  'victory-demo': {
    id: 'victory-demo',
    speaker: 'SYSTEM',
    text: 'CONGRATULATIONS TECHNICIAN.\nYou have successfully used your CCNA, IT Support, and Project Management skills to begin the Silicon Reborn initiative.\n\nThis is just the beginning of your journey to restore the world.',
    choices: [
      { text: 'Restart Adventure', nextSceneId: 'start' }
    ]
  }
};

