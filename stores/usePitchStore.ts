import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PitchCandidate {
  influencer_id: string;
  name: string;
  avatar_url: string;
  subscriber_count: number;
  country: string;
  channel_url: string;
  estimated_cpm: number;
  suggested_price: number;
  engagement_rate: number;
  channel_type?: string;
  // Email specific fields managed by this store
  email?: string;
  emailStatus?: 'idle' | 'loading' | 'found' | 'not_found';
}

interface PitchState {
  candidates: PitchCandidate[];
  addCandidates: (candidates: PitchCandidate[]) => void;
  removeCandidate: (id: string) => void;
  updateCandidate: (id: string, updates: Partial<PitchCandidate>) => void;
  clearCandidates: () => void;
}

export const usePitchStore = create<PitchState>()(
  persist(
    (set) => ({
      candidates: [],
      addCandidates: (newCandidates) => set((state) => {
        // Filter out duplicates based on influencer_id
        const existingIds = new Set(state.candidates.map(c => c.influencer_id));
        const uniqueNew = newCandidates.filter(c => !existingIds.has(c.influencer_id));
        
        // Initialize email status for new items
        const initialized = uniqueNew.map(c => ({
          ...c,
          emailStatus: 'idle' as const
        }));

        return { candidates: [...state.candidates, ...initialized] };
      }),
      removeCandidate: (id) => set((state) => ({
        candidates: state.candidates.filter(c => c.influencer_id !== id)
      })),
      updateCandidate: (id, updates) => set((state) => ({
        candidates: state.candidates.map(c => 
          c.influencer_id === id ? { ...c, ...updates } : c
        )
      })),
      clearCandidates: () => set({ candidates: [] }),
    }),
    { name: 'pitch-storage' }
  )
);
