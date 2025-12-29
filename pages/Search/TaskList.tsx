import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Badge,
  Typography,
  Tooltip,
  Input,
  Drawer,
  Descriptions
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useProjectStore } from '../../stores/useProjectStore';

const { Title, Text } = Typography;

const SearchTaskList: React.FC = () => {
  const navigate = useNavigate();
  const currentProject = useProjectStore((state) => state.currentProject);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getSearchTasks(currentProject?.id);
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentProject]);

  // Filtered tasks based on search text
  const filteredTasks = useMemo(() => {
    if (!searchText.trim()) return tasks;

    const lowerSearch = searchText.toLowerCase();
    return tasks.filter(task =>
      task.name?.toLowerCase().includes(lowerSearch) ||
      task.creator?.toLowerCase().includes(lowerSearch)
    );
  }, [tasks, searchText]);

  const handleViewDetail = (task: any) => {
    setSelectedTask(task);
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: '搜索方式',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        return type === 'keyword' ? (
          <Tag icon={<SearchOutlined />} color="blue">关键词</Tag>
        ) : (
          <Tag icon={<CloudUploadOutlined />} color="purple">上传</Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, 'success' | 'processing' | 'default' | 'error'> = {
          completed: 'success',
          processing: 'processing',
          pending: 'default',
          failed: 'error',
        };

        const labelMap: Record<string, string> = {
            completed: '已完成',
            processing: '搜索中',
            pending: '待处理',
            failed: '失败',
        };

        return <Badge status={statusMap[status] || 'default'} text={labelMap[status] || status} />;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => <span className="text-gray-500 text-sm">{text}</span>,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      render: (text: string) => <span className="text-gray-600">{text || '-'}</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            disabled={record.status !== 'completed'}
            onClick={() => navigate(`/search/tasks/${record.id}`)}
          >
            查看结果
          </Button>
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            任务详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={3} style={{ marginBottom: 0 }}>搜索任务</Title>
          <Text type="secondary">管理您的红人搜索任务</Text>
        </div>
        <Space>
           <Tooltip title="刷新列表">
              <Button icon={<ReloadOutlined />} onClick={fetchTasks} />
           </Tooltip>
           <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/search/create')}
            style={{ backgroundColor: '#6C6C9C' }}
          >
            创建任务
          </Button>
        </Space>
      </div>

      {/* Search Input */}
      <Card bordered={false} className="shadow-sm">
        <Input
          placeholder="搜索任务名称或创建人..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          size="large"
          style={{ maxWidth: 400 }}
        />
      </Card>

      <Card bordered={false} className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowClassName="hover:bg-gray-50 cursor-default transition-colors"
          components={{
            header: {
              cell: (props: any) => (
                <th
                    {...props}
                    style={{
                        ...props.style,
                        background: '#fafafa',
                        fontWeight: 600,
                        color: '#666'
                    }}
                />
              )
            }
          }}
        />
      </Card>

      {/* Task Detail Drawer */}
      <Drawer
        title="任务详情"
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedTask && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="任务名称">{selectedTask.name}</Descriptions.Item>
            <Descriptions.Item label="创建人">{selectedTask.creator || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedTask.createdAt}</Descriptions.Item>
            <Descriptions.Item label="任务状态">
              <Badge
                status={
                  selectedTask.status === 'completed' ? 'success' :
                  selectedTask.status === 'processing' ? 'processing' :
                  selectedTask.status === 'failed' ? 'error' : 'default'
                }
                text={
                  selectedTask.status === 'completed' ? '已完成' :
                  selectedTask.status === 'processing' ? '搜索中' :
                  selectedTask.status === 'failed' ? '失败' : '待处理'
                }
              />
            </Descriptions.Item>
            {selectedTask.config && (
              <>
                <Descriptions.Item label="行业关键词">
                  {selectedTask.config.industryKeywords || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="品牌关键词">
                  {selectedTask.config.brandKeywords || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="竞品关键词">
                  {selectedTask.config.competitorKeywords || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="单个关键词搜索视频数">
                  {selectedTask.config.videosPerKeyword || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="排序方式">
                  {selectedTask.config.sortBy === 'relevance' ? '相关性' :
                   selectedTask.config.sortBy === 'viewCount' ? '观看次数' :
                   selectedTask.config.sortBy === 'date' ? '发布时间' : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="检索维度">
                  {selectedTask.config.searchDimension === 'video' ? '按视频' :
                   selectedTask.config.searchDimension === 'channel' ? '按网红' : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="国家偏好">
                  {selectedTask.config.countries && selectedTask.config.countries.length > 0 ? (
                    <Space size={[4, 4]} wrap>
                      {selectedTask.config.countries.map((country: string) => (
                        <Tag key={country}>{country}</Tag>
                      ))}
                    </Space>
                  ) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="最小粉丝数">
                  {selectedTask.config.minSubscribers ? selectedTask.config.minSubscribers.toLocaleString() : '-'}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default SearchTaskList;
