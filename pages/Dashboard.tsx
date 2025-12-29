import React from 'react';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, GlobalOutlined, DollarOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

const recentCampaigns = [
  {
    key: '1',
    name: 'Summer Sale 2024',
    platform: 'Instagram',
    status: 'Active',
    budget: '$12,000',
  },
  {
    key: '2',
    name: 'Tech Gadget Launch',
    platform: 'YouTube',
    status: 'Pending',
    budget: '$45,000',
  },
  {
    key: '3',
    name: 'Beauty Brand Collab',
    platform: 'TikTok',
    status: 'Completed',
    budget: '$8,500',
  },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">Overview of your marketing performance</div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Influencers"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#6C6C9C', fontWeight: 600 }}
            />
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <ArrowUpOutlined className="mr-1" /> 12% increase
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Active Campaigns"
              value={24}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#3f8600', fontWeight: 600 }}
            />
             <div className="mt-2 text-xs text-gray-500 flex items-center">
              Target: 30
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
           <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Budget Spent"
              value={93450}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322', fontWeight: 600 }}
            />
            <div className="mt-2 text-xs text-red-500 flex items-center">
              <ArrowDownOutlined className="mr-1" /> 5% over budget
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Avg. Engagement Rate"
              value={4.8}
              suffix="%"
              valueStyle={{ color: '#6C6C9C', fontWeight: 600 }}
            />
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <ArrowUpOutlined className="mr-1" /> 0.8% increase
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Engagement Trends" bordered={false} className="shadow-sm h-full">
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#6C6C9C" strokeWidth={3} dot={{r: 4, fill: '#6C6C9C'}} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Recent Campaigns" bordered={false} className="shadow-sm h-full">
            <Table 
              dataSource={recentCampaigns} 
              pagination={false}
              size="small"
              columns={[
                { title: 'Name', dataKey: 'name', render: (text: any, record: any) => <span className="font-medium">{record.name}</span> },
                { title: 'Status', dataKey: 'status', render: (status: string) => {
                    let color = status === 'Active' ? 'processing' : status === 'Completed' ? 'success' : 'default';
                    return <Tag color={color}>{status}</Tag>;
                }}
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
