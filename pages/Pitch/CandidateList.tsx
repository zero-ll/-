import React, { useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Typography, 
  Avatar, 
  Space, 
  Tooltip,
  Tag,
  Spin,
  Empty
} from 'antd';
import { 
  UserOutlined, 
  DeleteOutlined, 
  MailOutlined,
  LoadingOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  FileExcelOutlined,
  YoutubeOutlined
} from '@ant-design/icons';
import { usePitchStore, PitchCandidate } from '../../stores/usePitchStore';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;

const CandidateList: React.FC = () => {
  const { candidates, removeCandidate, updateCandidate } = usePitchStore();

  // Simulate Email Fetching
  useEffect(() => {
    const idleCandidates = candidates.filter(c => c.emailStatus === 'idle' || !c.emailStatus);
    
    if (idleCandidates.length > 0) {
      // Mark as loading immediately to prevent infinite loop or re-trigger
      idleCandidates.forEach(c => {
        updateCandidate(c.influencer_id, { emailStatus: 'loading' });
      });

      // Simulate API delay
      setTimeout(() => {
        idleCandidates.forEach(c => {
          const isFound = Math.random() > 0.3; // 70% chance to find email
          updateCandidate(c.influencer_id, {
            emailStatus: isFound ? 'found' : 'not_found',
            email: isFound ? `contact.${c.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com` : undefined
          });
        });
      }, 2000);
    }
  }, [candidates, updateCandidate]);

  const handleExport = () => {
    const dataToExport = candidates.map(c => ({
      '频道名称': c.name,
      '频道链接': c.channel_url,
      '订阅数': c.subscriber_count,
      '互动率': `${(c.engagement_rate * 100).toFixed(2)}%`,
      '国家': c.country,
      '邮箱状态': c.emailStatus,
      '邮箱': c.email || 'N/A',
      '预估 CPM': c.estimated_cpm,
      '建议报价': c.suggested_price
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "联络列表");

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `联络列表_${dateStr}.xlsx`);
  };

  const columns = [
    {
      title: '频道信息',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (_: string, record: PitchCandidate) => (
        <div className="flex items-start gap-3">
          <Avatar src={record.avatar_url} size={40} icon={<UserOutlined />} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">{record.name}</span>
               <a href={record.channel_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-600">
                <YoutubeOutlined />
              </a>
            </div>
            <div className="text-xs text-gray-500 mt-1 flex gap-2">
               <span>{new Intl.NumberFormat('zh-CN', { notation: "compact", compactDisplay: "short" }).format(record.subscriber_count)} 订阅</span>
               <span>•</span>
               <span>{record.country}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '联系邮箱',
      key: 'email',
      width: 250,
      render: (_: any, record: PitchCandidate) => {
        if (record.emailStatus === 'loading') {
          return <span className="text-gray-400 flex items-center gap-2"><Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} /> 获取中...</span>;
        }
        if (record.emailStatus === 'found' && record.email) {
          return (
            <div className="flex items-center gap-2 text-gray-700">
              <MailOutlined className="text-[#6C6C9C]" />
              <span className="font-mono text-sm">{record.email}</span>
              <Tooltip title="已验证">
                 <CheckCircleFilled className="text-green-500 text-xs" />
              </Tooltip>
            </div>
          );
        }
        if (record.emailStatus === 'not_found') {
          return <span className="text-gray-400 flex items-center gap-1"><CloseCircleFilled className="text-gray-300" /> 未找到</span>;
        }
        return <span className="text-gray-400">待处理</span>;
      }
    },
    {
      title: '报价预估',
      key: 'price',
      render: (_: any, record: PitchCandidate) => (
        <div className="flex flex-col">
           <span className="font-medium text-gray-800">${record.suggested_price}</span>
           <span className="text-xs text-gray-400">CPM: ${record.estimated_cpm}</span>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PitchCandidate) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeCandidate(record.influencer_id)}
        >
          移除
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={3} style={{ marginBottom: 0 }}>联络候选列表</Title>
          <Text type="secondary">管理您的联络候选人并导出数据</Text>
        </div>
        {candidates.length > 0 && (
          <Button
            icon={<FileExcelOutlined />}
            onClick={handleExport}
          >
            导出 Excel
          </Button>
        )}
      </div>

      <Card bordered={false} className="shadow-sm" bodyStyle={{ padding: 0 }}>
        {candidates.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={candidates} 
            rowKey="influencer_id"
            pagination={{ pageSize: 10 }}
            rowClassName="hover:bg-gray-50"
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="flex flex-col items-center gap-2">
                <span className="text-gray-500">还没有添加候选人</span>
                <Button type="link" href="#/evaluate/tasks">前往评估任务</Button>
              </div>
            }
            className="py-12"
          />
        )}
      </Card>
    </div>
  );
};

export default CandidateList;
