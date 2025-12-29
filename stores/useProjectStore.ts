import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '../types';

interface ProjectState {
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
      clearProject: () => set({ currentProject: null }),
    }),
    { name: 'project-storage' }
  )
);
