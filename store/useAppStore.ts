import { create } from 'zustand';
import { Influencer } from '../types';

interface AppState {
  user: { name: string; email: string } | null;
  influencers: Influencer[];
  isLoading: boolean;
  setInfluencers: (influencers: Influencer[]) => void;
  addInfluencer: (influencer: Influencer) => void;
  toggleLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: { name: "Admin User", email: "admin@example.com" },
  influencers: [],
  isLoading: false,
  setInfluencers: (influencers) => set({ influencers }),
  addInfluencer: (influencer) => set((state) => ({ influencers: [...state.influencers, influencer] })),
  toggleLoading: (loading) => set({ isLoading: loading }),
}));
