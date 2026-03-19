import { create } from 'zustand';

export interface WeddingInput {
  city: string;
  hotel_tier: string;
  room_count: number;
  guest_count: number;
  outstation_percentage: number;
  events: string[];
  bride_city: string;
  groom_city: string;
  decor_style: string;
  decor_complexity: number;
  food_type: string;
  bar_type: string;
  entertainment_tier: string;
}

interface WizardState {
  currentStep: number;
  totalSteps: number;
  input: WeddingInput;
  isComplete: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateInput: (partial: Partial<WeddingInput>) => void;
  toggleEvent: (event: string) => void;
  setComplete: (complete: boolean) => void;
  reset: () => void;
}

const defaultInput: WeddingInput = {
  city: '',
  hotel_tier: '5star_city',
  room_count: 50,
  guest_count: 500,
  outstation_percentage: 0.4,
  events: ['sangeet', 'pheras', 'reception'],
  bride_city: '',
  groom_city: '',
  decor_style: 'traditional',
  decor_complexity: 3,
  food_type: 'veg_nonveg',
  bar_type: 'full_bar',
  entertainment_tier: 'premium',
};

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  totalSteps: 6,
  input: { ...defaultInput },
  isComplete: false,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1)
  })),
  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 0)
  })),

  updateInput: (partial) => set((state) => ({
    input: { ...state.input, ...partial }
  })),

  toggleEvent: (event) => set((state) => {
    const events = state.input.events.includes(event)
      ? state.input.events.filter(e => e !== event)
      : [...state.input.events, event];
    return { input: { ...state.input, events } };
  }),

  setComplete: (complete) => set({ isComplete: complete }),

  reset: () => set({
    currentStep: 0,
    input: { ...defaultInput },
    isComplete: false,
  }),
}));
