export const mockUsers = [
  { id: '1', username: 'admin', password: '123456', name: '管理员' },
  { id: '2', username: 'user1', password: '123456', name: '运营小王' },
];

export const mockProjects = [
  { id: 'p1', name: '割草机品牌推广', users: ['1', '2'] },
  { id: 'p2', name: '智能家居Q1营销', users: ['1'] },
  { id: 'p3', name: '电动工具海外推广', users: ['1', '2'] },
];