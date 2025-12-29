export interface User {
  id: string;
  username: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  users: string[];
}

export interface Influencer {
  id: string;
  name: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok';
  followers: number;
  engagementRate: number;
  category: string;
  email: string;
  status: 'Active' | 'Contacted' | 'Pending';
  avatar: string;
}
