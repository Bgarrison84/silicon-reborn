export type TerminalMode = 'USER_EXEC' | 'PRIVILEGED_EXEC' | 'GLOBAL_CONFIG' | 'INTERFACE_CONFIG';

export interface Choice {
  text: string;
  nextSceneId: string;
  action?: (state: GameState) => GameState;
  requirements?: {
    level?: number;
    networking?: number;
    support?: number;
    management?: number;
    fragments?: string[];
  };
}

export interface TerminalChallenge {
  prompt: string;
  mode: TerminalMode;
  expectedCommand: string;
  hint: string;
  successSceneId: string;
  failSceneId: string;
  xpReward?: number;
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
    xpReward?: number;
  };
  terminalChallenge?: TerminalChallenge;
  fragmentId?: string;
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
  xp: number;
  level: number;
}

export const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000];

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
  discoveredFragments: [],
  xp: 0,
  level: 1
};

export const dataFragments: Record<string, { title: string; link: string; snippet: string }> = {
  'osi-deep-dive': {
    title: 'Archive: OSI Layer 3',
    link: 'https://Bgarrison84.github.io/ccna-guide/#/module/osi-model',
    snippet: 'The Network layer is responsible for path determination and logical addressing.'
  },
  'subnetting-manual': {
    title: 'Manual: IP Math',
    link: 'https://Bgarrison84.github.io/ccna-guide/#/module/subnetting',
    snippet: 'Subnetting allowed the ancients to divide their massive networks into manageable pieces.'
  }
};

export const scenes: Record<string, Scene> = {
  start: {
    id: 'start',
    speaker: 'SYSTEM',
    text: 'NEURAL LINK ESTABLISHED...\nYEAR: 2142\nLOCATION: SECTOR 7 WASTELAND\n\nYou wake up in a collapsed server room. A terminal flickers nearby. To your left, a reinforced door with a Project Management override console.',
    choices: [
      { text: 'Inspect the terminal', nextSceneId: 'terminal-init' },
      { 
        text: '[LVL 2] Forced Entry (Management)', 
        nextSceneId: 'forced-entry',
        requirements: { level: 2 }
      },
      { text: 'Look for an exit', nextSceneId: 'look-exit' }
    ]
  },
  'terminal-init': {
    id: 'terminal-init',
    speaker: 'TERMINAL',
    text: 'RE-CORE OS v4.2.1\n\nThe console is in restricted mode. You need to elevate privileges to access the subnetting tools.',
    terminalChallenge: {
      prompt: 'Router>',
      mode: 'USER_EXEC',
      expectedCommand: 'enable',
      hint: 'The command to enter Privileged EXEC mode.',
      successSceneId: 'terminal-privileged',
      failSceneId: 'failed-fix',
      xpReward: 20
    },
    choices: []
  },
  'terminal-privileged': {
    id: 'terminal-privileged',
    speaker: 'TERMINAL',
    text: 'PRIVILEGED EXEC MODE ENABLED.\n\nNow, enter global configuration mode to modify the routing parameters.',
    terminalChallenge: {
      prompt: 'Router#',
      mode: 'PRIVILEGED_EXEC',
      expectedCommand: 'configure terminal',
      hint: 'The command to enter global config mode.',
      successSceneId: 'terminal-config',
      failSceneId: 'failed-fix',
      xpReward: 30
    },
    choices: []
  },
  'terminal-config': {
    id: 'terminal-config',
    speaker: 'TERMINAL',
    text: 'GLOBAL CONFIG MODE ENABLED.\n\nRestoring the communications link requires configuring the interface GigabitEthernet 0/0.',
    terminalChallenge: {
      prompt: 'Router(config)#',
      mode: 'GLOBAL_CONFIG',
      expectedCommand: 'interface g0/0',
      hint: 'The command to enter interface configuration mode.',
      successSceneId: 'interface-config',
      failSceneId: 'failed-fix',
      xpReward: 50
    },
    choices: []
  },
  'interface-config': {
    id: 'interface-config',
    speaker: 'SYSTEM',
    text: 'LINK STATE: UP (Simulated)\n\nYou have restored the internal communication bus. A hidden compartment opens, revealing an ancient data fragment.',
    fragmentId: 'subnetting-manual',
    choices: [
      { 
        text: 'Download Fragment and Proceed', 
        nextSceneId: 'outside-world',
        action: (s) => ({ 
          ...s, 
          xp: s.xp + 50,
          discoveredFragments: [...s.discoveredFragments, 'subnetting-manual'],
          skills: { ...s.skills, networking: s.skills.networking + 15 }
        })
      }
    ]
  },
  'look-exit': {
    id: 'look-exit',
    speaker: 'SELF',
    text: 'The main door is locked. A small label reads "PM-NODE-4". It seems you need to define the project scope to bypass the lockout.',
    choices: [
      { text: 'Access the PM Console', nextSceneId: 'pm-challenge-1' },
      { text: 'Go back to the terminal', nextSceneId: 'terminal-init' }
    ]
  },
  'pm-challenge-1': {
    id: 'pm-challenge-1',
    speaker: 'PM CONSOLE',
    text: 'To unlock this sector, you must identify the key document that formally initiates a project and provides the project manager with authority.',
    challenge: {
      question: 'Which document formally authorizes the existence of a project?',
      options: ['Project Management Plan', 'Project Charter', 'Business Case', 'Scope Statement'],
      correctIndex: 1,
      explanation: 'The Project Charter is the document that formally authorizes the project.',
      failSceneId: 'failed-pm',
      xpReward: 40
    },
    choices: [
      { 
        text: 'The door slides open', 
        nextSceneId: 'outside-world',
        action: (s) => ({ ...s, skills: { ...s.skills, management: s.skills.management + 10 } })
      }
    ]
  },
  'outside-world': {
    id: 'outside-world',
    speaker: 'ELARA',
    text: 'Technician! We saw the signal flare from the server room. The Haven Settlement is in dire need of someone with your "Silicon" skills.',
    choices: [
      { 
        text: '[NET 15] Fix the Settlement Network', 
        nextSceneId: 'vlan-challenge',
        requirements: { networking: 15 }
      },
      { 
        text: '[MGT 10] Organize the Reconstruction', 
        nextSceneId: 'rebuild-quest',
        requirements: { management: 10 }
      },
      { text: 'Ask about the world', nextSceneId: 'world-lore' }
    ]
  },
  'vlan-challenge': {
    id: 'vlan-challenge',
    speaker: 'TERMINAL',
    text: 'The Haven network is unstable. Multiple broadcast domains are overlapping. You need to isolate the Scavenger team from the Life Support systems.',
    terminalChallenge: {
      prompt: 'Switch#',
      mode: 'PRIVILEGED_EXEC',
      expectedCommand: 'show vlan brief',
      hint: 'The command to view the current VLAN configuration.',
      successSceneId: 'victory-demo',
      failSceneId: 'failed-support',
      xpReward: 100
    },
    choices: []
  },
  'forced-entry': {
    id: 'forced-entry',
    speaker: 'SELF',
    text: 'Using your advanced management knowledge, you realize this door was built during the "Charter Crisis". You know the override code was the Project ID of the first Haven build.',
    choices: [
      { 
        text: 'Bypass the door', 
        nextSceneId: 'outside-world',
        action: (s) => ({ ...s, xp: s.xp + 200, reputation: s.reputation + 10 })
      }
    ]
  },
  'world-lore': {
    id: 'world-lore',
    speaker: 'ELARA',
    text: 'The world ended when the "Last Patch" failed. Only those who remember the protocols of the Old Silicon can rebuild what was lost. We are the Haven, a small light in the dark.',
    choices: [
      { text: 'I am ready to help', nextSceneId: 'outside-world' }
    ]
  },
  'failed-fix': {
    id: 'failed-fix',
    speaker: 'SYSTEM',
    text: 'CRITICAL ERROR: SYSTEM LOCKOUT.\nYou must recall your training.',
    choices: [{ text: 'Restart', nextSceneId: 'start' }]
  },
  'failed-pm': {
    id: 'failed-pm',
    speaker: 'SYSTEM',
    text: 'AUTHORIZATION DENIED.\nProject Management methodology failed.',
    choices: [{ text: 'Try Again', nextSceneId: 'start' }]
  },
  'failed-support': {
    id: 'failed-support',
    speaker: 'SELF',
    text: 'You triggered a power surge. The equipment is fried.',
    choices: [{ text: 'Try Again', nextSceneId: 'start' }]
  },
  'victory-demo': {
    id: 'victory-demo',
    speaker: 'SYSTEM',
    text: 'CONGRATULATIONS TECHNICIAN.\nYou have reached the end of this demo. Your skills are rebuilding the world.',
    choices: [
      { text: 'Restart Adventure', nextSceneId: 'start' }
    ]
  }
};
