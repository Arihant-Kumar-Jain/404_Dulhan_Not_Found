import { create } from 'zustand';

export interface BudgetCategory {
  name: string;
  icon: string;
  low: number;
  mid: number;
  high: number;
  details: string;
}

interface BudgetState {
  totalLow: number;
  totalMid: number;
  totalHigh: number;
  confidence: number;
  breakdown: Record<string, BudgetCategory>;
  hasResults: boolean;
  compareMode: boolean;
  comparisonBudget: {
    totalLow: number;
    totalMid: number;
    totalHigh: number;
    breakdown: Record<string, BudgetCategory>;
  } | null;

  setBudget: (data: {
    total_low: number;
    total_mid: number;
    total_high: number;
    confidence: number;
    breakdown: Record<string, BudgetCategory>;
  }) => void;
  setComparisonBudget: (data: {
    totalLow: number;
    totalMid: number;
    totalHigh: number;
    breakdown: Record<string, BudgetCategory>;
  } | null) => void;
  toggleCompareMode: () => void;
  reset: () => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  totalLow: 0,
  totalMid: 0,
  totalHigh: 0,
  confidence: 0,
  breakdown: {},
  hasResults: false,
  compareMode: false,
  comparisonBudget: null,

  setBudget: (data) => set({
    totalLow: data.total_low,
    totalMid: data.total_mid,
    totalHigh: data.total_high,
    confidence: data.confidence,
    breakdown: data.breakdown,
    hasResults: true,
  }),

  setComparisonBudget: (data) => set({ comparisonBudget: data }),
  toggleCompareMode: () => set((state) => ({ compareMode: !state.compareMode })),
  reset: () => set({
    totalLow: 0, totalMid: 0, totalHigh: 0,
    confidence: 0, breakdown: {}, hasResults: false,
    compareMode: false, comparisonBudget: null,
  }),
}));
