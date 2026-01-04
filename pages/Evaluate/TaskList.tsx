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
  Modal,
  message
} from 'antd';
import {
  EyeOutlined,
  ReloadOutlined,
  UsergroupAddOutlined,
  SearchOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useProjectStore } from '../../stores/useProjectStore';

const { Title, Text } = Typography;

const EvaluateTaskList: React.FC = () => {
  const navigate = useNavigate();
  const currentProject = useProjectStore((state) => state.currentProject);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingTask, setRenamingTask] = useState<any>(null);
  const [newTaskName, setNewTaskName] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getEvaluateTasks(currentProject?.id);
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
      await api.updateEvaluateTask(renamingTask.id, { name: newTaskName.trim() });
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
      title: '红人数量',
      dataIndex: 'influencerCount',
      key: 'influencerCount',
      render: (count: number) => (
        <Space>
          <UsergroupAddOutlined className="text-gray-400" />
          <span>{count}</span>
        </Space>
      ),
    },
    {
      title: '频道类型要求',
      dataIndex: 'channelTypes',
      key: 'channelTypes',
      width: 350,
      render: (channelTypes: any) => {
        if (!channelTypes) return '-';

        // 收集所有标签并平铺显示
        const allTags: Array<{ label: string, color: string }> = [];

        if (channelTypes.p0 && channelTypes.p0.length > 0) {
          channelTypes.p0.forEach((tag: string) => {
            allTags.push({ label: `P0:${tag}`, color: 'red' });
          });
        }

        if (channelTypes.p1 && channelTypes.p1.length > 0) {
          channelTypes.p1.forEach((tag: string) => {
            allTags.push({ label: `P1:${tag}`, color: 'orange' });
          });
        }

        if (channelTypes.p2 && channelTypes.p2.length > 0) {
          channelTypes.p2.forEach((tag: string) => {
            allTags.push({ label: `P2:${tag}`, color: 'blue' });
          });
        }

        return (
          <Space size={[4, 4]} wrap>
            {allTags.map((item, i) => (
              <Tag key={i} color={item.color} style={{ fontSize: '10px', margin: 0 }}>
                {item.label}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, 'success' | 'processing' | 'default'> = {
          completed: 'success',
          processing: 'processing',
          pending: 'default',
        };

        const labelMap: Record<string, string> = {
          completed: '已完成',
          processing: '分析中',
          pending: '待处理',
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
            onClick={() => navigate(`/evaluate/tasks/${record.id}`)}
          >
            查看报告
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
          <Title level={3} style={{ marginBottom: 0 }}>评估任务</Title>
          <Text type="secondary">深度分析您选择的红人</Text>
        </div>
        <Space>
          <Tooltip title="刷新列表">
            <Button icon={<ReloadOutlined />} onClick={fetchTasks} />
          </Tooltip>
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

export default EvaluateTaskList;
