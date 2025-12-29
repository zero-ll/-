export const mockEvaluateTasks = [
  {
    id: 'et1',
    projectId: 'p1',
    name: '割草机红人评估-批次1',
    influencerCount: 20,
    status: 'completed',
    createdAt: '2024-01-15 14:20:00',
    creator: '张伟',
    sourceTaskId: 'st1',
    channelTypes: {
      p0: ['园艺工具', '户外设备'],
      p1: ['DIY家居', '家庭维护'],
      p2: ['生活方式']
    }
  },
  {
    id: 'et2',
    projectId: 'p1',
    name: '割草机红人评估-批次2',
    influencerCount: 8,
    status: 'processing',
    createdAt: '2024-01-17 10:30:00',
    creator: '李娜',
    sourceTaskId: 'st2',
    channelTypes: {
      p0: ['草坪护理', '电动工具'],
      p1: ['园艺', '户外生活'],
      p2: []
    }
  },
];