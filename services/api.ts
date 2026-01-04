import { mockUsers, mockProjects } from '../mock/users';
import { mockSearchTasks } from '../mock/searchTasks';
import { mockSearchResults } from '../mock/searchResults';
import { mockEvaluateTasks } from '../mock/evaluateTasks';
import { mockEvaluationResults } from '../mock/evaluationResults';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory storage for the session
let searchTasks = [...mockSearchTasks];
let evaluateTasks = [...mockEvaluateTasks];

export const api = {
  login: async (username: string, password: string) => {
    await delay(500);
    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (user) {
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    throw new Error('Invalid credentials');
  },

  getProjects: async () => {
    await delay(500);
    return mockProjects;
  },

  getSearchTasks: async (projectId?: string) => {
    await delay(600);
    if (projectId) {
      return searchTasks.filter(task => task.projectId === projectId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return searchTasks;
  },

  createSearchTask: async (task: any) => {
    await delay(1000);
    const newTask = {
      ...task,
      id: `st${Date.now()}`,
      status: 'processing',
      createdAt: new Date().toLocaleString(),
    };
    searchTasks.unshift(newTask);
    return newTask;
  },

  getSearchResults: async (taskId?: string) => {
    await delay(800);
    // In a real scenario, we would filter by taskId. 
    // For now, we return the single list of mock results available.
    return mockSearchResults;
  },

  getEvaluateTasks: async (projectId?: string) => {
    await delay(600);
    if (projectId) {
      return evaluateTasks.filter(task => task.projectId === projectId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return evaluateTasks;
  },

  createEvaluateTask: async (task: any) => {
    await delay(800);
    const newTask = {
      id: `et${Date.now()}`,
      status: 'processing',
      createdAt: new Date().toLocaleString(),
      ...task
    };
    evaluateTasks.unshift(newTask);
    return newTask;
  },

  getEvaluationResults: async (taskId?: string) => {
    await delay(800);
    // Return mock results
    return mockEvaluationResults;
  },

  // Helper to get a specific evaluation task
  getEvaluateTaskById: async (taskId: string) => {
    await delay(400);
    return evaluateTasks.find(t => t.id === taskId);
  },

  // Helper to get a specific search task
  getSearchTaskById: async (taskId: string) => {
    await delay(400);
    return searchTasks.find(t => t.id === taskId);
  },

  addToPitchList: async (influencerIds: (string | number)[]) => {
    await delay(800);
    return true;
  },

  // 根据源任务ID获取评估任务列表
  getEvaluateTasksBySourceId: async (sourceTaskId: string) => {
    await delay(400);
    return evaluateTasks.filter(t => t.sourceTaskId === sourceTaskId);
  },

  // 更新搜索任务
  updateSearchTask: async (taskId: string, updates: any) => {
    await delay(500);
    const taskIndex = searchTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      searchTasks[taskIndex] = { ...searchTasks[taskIndex], ...updates };
      return searchTasks[taskIndex];
    }
    throw new Error('Task not found');
  },

  // 更新评估任务
  updateEvaluateTask: async (taskId: string, updates: any) => {
    await delay(500);
    const taskIndex = evaluateTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      evaluateTasks[taskIndex] = { ...evaluateTasks[taskIndex], ...updates };
      return evaluateTasks[taskIndex];
    }
    throw new Error('Task not found');
  }
};