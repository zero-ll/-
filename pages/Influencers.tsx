import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Input, Select, Card, Avatar, Tooltip } from 'antd';
import { SearchOutlined, FilterOutlined, PlusOutlined, InstagramOutlined, YoutubeOutlined, ExportOutlined } from '@ant-design/icons';
import { Influencer } from '../types';
import { useAppStore } from '../store/useAppStore';

const { Option } = Select;

// Mock Data Generation
const MOCK_INFLUENCERS: Influencer[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `${i}`,
  name: `Influencer ${i + 1}`,
  platform: i % 3 === 0 ? 'Instagram' : i % 3 === 1 ? 'YouTube' : 'TikTok',
  followers: Math.floor(Math.random() * 1000000) + 5000,
  engagementRate: Number((Math.random() * 5 + 1).toFixed(2)),
  category: i % 2 === 0 ? 'Lifestyle' : 'Tech',
  email: `contact${i}@example.com`,
  status: i % 4 === 0 ? 'Contacted' : 'Active',
  avatar: `https://picsum.photos/seed/${i}/40/40`,
}));

const Influencers: React.FC = () => {
  const { influencers, setInfluencers, isLoading, toggleLoading } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API Call
    toggleLoading(true);
    setTimeout(() => {
      setInfluencers(MOCK_INFLUENCERS);
      toggleLoading(false);
    }, 800);
  }, [setInfluencers, toggleLoading]);

  const columns = [
    {
      title: 'Influencer',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Influencer) => (
        <Space>
          <Avatar src={record.avatar} />
          <div className="flex flex-col">
            <span className="font-medium">{text}</span>
            <span className="text-xs text-gray-400">{record.email}</span>
          </div>
        </Space>
      ),
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => {
        let icon = null;
        let color = 'default';
        if (platform === 'Instagram') { icon = <InstagramOutlined />; color = 'magenta'; }
        if (platform === 'YouTube') { icon = <YoutubeOutlined />; color = 'red'; }
        if (platform === 'TikTok') { icon = <span className="font-bold">T</span>; color = 'black'; }
        
        return (
          <Tag icon={icon} color={color} className="flex items-center gap-1 w-fit">
            {platform}
          </Tag>
        );
      },
    },
    {
      title: 'Followers',
      dataIndex: 'followers',
      key: 'followers',
      sorter: (a: Influencer, b: Influencer) => a.followers - b.followers,
      render: (followers: number) => (
        <span className="font-mono">
          {new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(followers)}
        </span>
      ),
    },
    {
      title: 'Engagement',
      dataIndex: 'engagementRate',
      key: 'engagementRate',
      render: (rate: number) => (
        <span className={`${rate > 3 ? 'text-green-600' : 'text-gray-600'}`}>
          {rate}%
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'success' : 'processing'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Influencer) => (
        <Space size="middle">
          <Button type="link" size="small">Details</Button>
          <Button type="text" size="small" className="text-gray-400 hover:text-gray-600">Email</Button>
        </Space>
      ),
    },
  ];

  const filteredData = influencers.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) || item.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesPlatform = filterPlatform ? item.platform === filterPlatform : true;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Influencers</h1>
           <p className="text-gray-500">Manage your outreach and partnerships.</p>
        </div>
        <div className="flex gap-2">
           <Button icon={<ExportOutlined />}>Export</Button>
           <Button type="primary" icon={<PlusOutlined />}>Add Influencer</Button>
        </div>
      </div>

      <Card bordered={false} className="shadow-sm">
        <div className="flex flex-wrap gap-4 mb-6">
          <Input 
            placeholder="Search influencers..." 
            prefix={<SearchOutlined className="text-gray-400" />} 
            className="max-w-xs"
            onChange={e => setSearchText(e.target.value)}
          />
          <Select 
            placeholder="Platform" 
            style={{ width: 150 }} 
            allowClear 
            onChange={setFilterPlatform}
            suffixIcon={<FilterOutlined className="text-gray-400" />}
          >
            <Option value="Instagram">Instagram</Option>
            <Option value="YouTube">YouTube</Option>
            <Option value="TikTok">TikTok</Option>
          </Select>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ 
            pageSize: 8, 
            showTotal: (total) => `Total ${total} items`,
            showSizeChanger: false,
          }} 
        />
      </Card>
    </div>
  );
};

export default Influencers;
