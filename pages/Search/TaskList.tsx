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
  Descriptions,
  Modal,
  message
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  EditOutlined
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
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingTask, setRenamingTask] = useState<any>(null);
  const [newTaskName, setNewTaskName] = useState('');

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

  const handleRename = (task: any) => {
    setRenamingTask(task);
    setNewTaskName(task.name);
    setRenameModalVisible(true);
  };

  const handleRenameConfirm = async () => {
    if (!newTaskName.trim()) {
      message.error('任务名称不能为空');
      return;
    }

    // 验证名称是否重复（排除当前任务）
    const isDuplicate = tasks.some(
      t => t.id !== renamingTask.id && t.name === newTaskName.trim()
    );

    if (isDuplicate) {
      message.error('任务名称已存在，请使用其他名称');
      return;
    }

    try {
      await api.updateSearchTask(renamingTask.id, { name: newTaskName.trim() });
      message.success('任务重命名成功');
      setRenameModalVisible(false);
      fetchTasks();
    } catch (error) {
      message.error('重命名失败');
    }
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
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleRename(record)}
          >
            重命名
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
            <Descriptions.Item label="搜索方式">
              {selectedTask.type === 'keyword' ? (
                <Tag icon={<SearchOutlined />} color="blue">关键词</Tag>
              ) : (
                <Tag icon={<CloudUploadOutlined />} color="purple">上传</Tag>
              )}
            </Descriptions.Item>
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
            {selectedTask.type === 'keyword' && selectedTask.config && (
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
            {selectedTask.type === 'upload' && selectedTask.config && (
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
              </>
            )}
            {selectedTask.type === 'upload' && !selectedTask.config && (
              <Descriptions.Item label="说明">
                <Text type="secondary">该任务通过Excel上传方式创建</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>

      {/* Rename Modal */}
      <Modal
        title="重命名任务"
        open={renameModalVisible}
        onOk={handleRenameConfirm}
        onCancel={() => setRenameModalVisible(false)}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ style: { backgroundColor: '#6C6C9C' } }}
      >
        <div className="mb-4">
          <Text type="secondary">请输入新的任务名称</Text>
        </div>
        <Input
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="请输入任务名称"
          onPressEnter={handleRenameConfirm}
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default SearchTaskList;
