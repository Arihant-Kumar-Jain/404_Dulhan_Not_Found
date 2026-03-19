import { create } from 'zustand';

export interface AgentMessage {
  id: string;
  agent: string;
  icon: string;
  message: string;
  timestamp: number;
  type: 'status' | 'message';
}

export type AgentStatus = 'idle' | 'working' | 'done' | 'error';

export interface AgentState {
  name: string;
  icon: string;
  status: AgentStatus;
  result: Record<string, unknown> | null;
}

interface AgentStoreState {
  agents: Record<string, AgentState>;
  messages: AgentMessage[];
  progress: { completed: number; total: number };
  isCalculating: boolean;
  sessionId: string | null;

  setSessionId: (id: string) => void;
  setCalculating: (calculating: boolean) => void;
  updateAgent: (name: string, update: Partial<AgentState>) => void;
  addMessage: (msg: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  setProgress: (completed: number, total: number) => void;
  reset: () => void;
}

const defaultAgents: Record<string, AgentState> = {
  'Venue Agent': { name: 'Venue Agent', icon: '🏨', status: 'idle', result: null },
  'F&B Agent': { name: 'F&B Agent', icon: '🍽️', status: 'idle', result: null },
  'Décor Agent': { name: 'Décor Agent', icon: '🎨', status: 'idle', result: null },
  'Artist Agent': { name: 'Artist Agent', icon: '🎤', status: 'idle', result: null },
  'Logistics Agent': { name: 'Logistics Agent', icon: '🚗', status: 'idle', result: null },
  'Sundries Agent': { name: 'Sundries Agent', icon: '🎁', status: 'idle', result: null },
};

export const useAgentStore = create<AgentStoreState>((set) => ({
  agents: { ...defaultAgents },
  messages: [],
  progress: { completed: 0, total: 6 },
  isCalculating: false,
  sessionId: null,

  setSessionId: (id) => set({ sessionId: id }),
  setCalculating: (calculating) => set({ isCalculating: calculating }),

  updateAgent: (name, update) => set((state) => ({
    agents: {
      ...state.agents,
      [name]: { ...state.agents[name], ...update },
    },
  })),

  addMessage: (msg) => set((state) => ({
    messages: [
      ...state.messages,
      { ...msg, id: `msg-${Date.now()}-${Math.random()}`, timestamp: Date.now() },
    ],
  })),

  setProgress: (completed, total) => set({ progress: { completed, total } }),

  reset: () => set({
    agents: { ...defaultAgents },
    messages: [],
    progress: { completed: 0, total: 6 },
    isCalculating: false,
  }),
}));
