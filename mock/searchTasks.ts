export const mockSearchTasks = [
  {
    id: 'st1',
    projectId: 'p1',
    name: '割草机红人检索-第一批',
    type: 'keyword',
    status: 'completed',
    createdAt: '2024-01-15 10:30:00',
    creator: '张伟',
    config: {
      industryKeywords: 'lawn mower;robot mower;garden tools',
      brandKeywords: 'Husqvarna;Honda',
      competitorKeywords: 'Robomow;Worx',
      videosPerKeyword: 50,
      sortBy: 'viewCount',
      countries: ['US', 'DE'],
      searchDimension: 'video',
      minSubscribers: 10000
    }
  },
  {
    id: 'st2',
    projectId: 'p1',
    name: '割草机红人-Excel上传',
    type: 'upload',
    status: 'completed',
    createdAt: '2024-01-16 14:20:00',
    creator: '李娜',
  },
  {
    id: 'st3',
    projectId: 'p1',
    name: '新一批检索',
    type: 'keyword',
    status: 'processing',
    createdAt: '2024-01-17 09:00:00',
    creator: '王芳',
  },
];