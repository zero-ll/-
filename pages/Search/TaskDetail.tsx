import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  Table,
  Typography,
  Avatar,
  Tag,
  Space,
  Button,
  Row,
  Col,
  Select,
  Divider,
  Modal,
  message,
  Tooltip
} from 'antd';
import {
  ArrowLeftOutlined,
  YoutubeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useProjectStore } from '../../stores/useProjectStore';
import EvaluateConfigModal from '../../components/EvaluateConfigModal';
import { getCountryName } from '../../utils/countryMap';

const { Title, Text } = Typography;
const { Option } = Select;

const TaskDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentProject = useProjectStore((state) => state.currentProject);

  const [task, setTask] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [defaultTaskName, setDefaultTaskName] = useState('');

  // Filter States
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [taskData, resultsData] = await Promise.all([
          api.getSearchTaskById(id),
          api.getSearchResults(id)
        ]);
        setTask(taskData);
        setResults(resultsData);
      } catch (error) {
        message.error('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Derived Data for Filters
  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(results.map(r => r.country))).filter(Boolean);
    return uniqueCountries.sort();
  }, [results]);

  const filteredData = useMemo(() => {
    return results.filter(item => {
      // Filter by Country
      if (selectedCountries.length > 0 && !selectedCountries.includes(item.country)) {
        return false;
      }

      // Filter by Subscriber Tier
      if (selectedTiers.length > 0) {
        const subs = item.subscriber_count;
        const isNano = subs >= 0 && subs < 10000;
        const isMicro = subs >= 10000 && subs < 50000;
        const isMicroPlus = subs >= 50000 && subs < 100000;
        const isMid = subs >= 100000 && subs < 200000;
        const isMidPlus = subs >= 200000 && subs < 500000;
        const isMacro = subs >= 500000 && subs < 1000000;
        const isTop = subs >= 1000000 && subs < 5000000;
        const isMega = subs >= 5000000 && subs < 10000000;

        const matchesTier = (
          (selectedTiers.includes('Nano') && isNano) ||
          (selectedTiers.includes('Micro') && isMicro) ||
          (selectedTiers.includes('Micro+') && isMicroPlus) ||
          (selectedTiers.includes('Mid') && isMid) ||
          (selectedTiers.includes('Mid+') && isMidPlus) ||
          (selectedTiers.includes('Macro') && isMacro) ||
          (selectedTiers.includes('Top') && isTop) ||
          (selectedTiers.includes('Mega') && isMega)
        );
        if (!matchesTier) return false;
      }

      return true;
    });
  }, [results, selectedCountries, selectedTiers]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
  };

  // 计算粉丝量级
  const getSubscriberTier = (count: number): string => {
    if (count >= 5000000 && count < 10000000) return 'Mega';
    if (count >= 1000000 && count < 5000000) return 'Top';
    if (count >= 500000 && count < 1000000) return 'Macro';
    if (count >= 200000 && count < 500000) return 'Mid+';
    if (count >= 100000 && count < 200000) return 'Mid';
    if (count >= 50000 && count < 100000) return 'Micro+';
    if (count >= 10000 && count < 50000) return 'Micro';
    return 'Nano';
  };

  // 粉丝量级颜色
  const getTierColor = (tier: string): string => {
    const colorMap: Record<string, string> = {
      'Mega': 'purple',
      'Top': 'red',
      'Macro': 'orange',
      'Mid+': 'gold',
      'Mid': 'lime',
      'Micro+': 'green',
      'Micro': 'cyan',
      'Nano': 'blue'
    };
    return colorMap[tier] || 'default';
  };

  const handleStartEvaluate = async () => {
    // 计算创建次数
    try {
      const existingTasks = await api.getEvaluateTasksBySourceId(id!);
      const createCount = existingTasks.length + 1;
      const defaultName = `评估${createCount}-${task?.name || ''}`;
      setDefaultTaskName(defaultName);

      // 显示配置弹窗
      setConfigModalVisible(true);
    } catch (error) {
      console.error('Failed to calculate task count:', error);
      // 如果计算失败，使用默认值
      setDefaultTaskName(`评估-${task?.name || ''}`);
      setConfigModalVisible(true);
    }
  };

  const handleConfigConfirm = async (data: { taskName: string; channelTypes: any }) => {
    // 确认配置后创建评估任务
    Modal.confirm({
      title: '开始评估',
      content: `确定要为 ${selectedRowKeys.length} 位红人创建评估任务吗？`,
      okText: '开始评估',
      cancelText: '取消',
      okButtonProps: { style: { backgroundColor: '#6C6C9C' } },
      onOk: async () => {
        try {
          await api.createEvaluateTask({
            projectId: currentProject?.id,
            name: data.taskName,
            influencerCount: selectedRowKeys.length,
            sourceTaskId: id,
            channelTypes: data.channelTypes
          });
          message.success('评估任务创建成功');
          navigate('/evaluate/tasks');
        } catch (error) {
          message.error('创建评估任务失败');
        }
      }
    });
  };

  // 导出CSV功能
  const handleExportCSV = () => {
    try {
      // CSV表头
      const headers = [
        '红人名称',
        '粉丝数',
        '粉丝量级',
        '视频数',
        '总观看次数',
        '平均观看',
        '国家',
        '命中关键词',
        '频道简介',
        '频道URL'
      ];

      // 转换数据为CSV行
      const rows = filteredData.map(record => {
        const tier = getSubscriberTier(record.subscriber_count);
        const keywords = record.seo_keywords
          ? record.seo_keywords.replace(/"/g, '').split(' ').filter((k: string) => k.length > 2).join('; ')
          : '';

        return [
          record.name,
          record.subscriber_count,
          tier,
          record.video_count,
          record.total_views,
          record.avg_views,
          record.country,
          keywords,
          record.channel_description || '',
          record.channel_url
        ];
      });

      // 组合CSV内容
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // 添加BOM以支持中文
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // 创建下载链接
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `搜索结果_${task?.name || '导出'}_${new Date().toLocaleDateString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success(`成功导出 ${filteredData.length} 条数据`);
    } catch (error) {
      message.error('导出失败，请重试');
    }
  };

  const columns = [
    {
      title: '红人',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      fixed: 'left' as const,
      render: (_: string, record: any) => {
        // 检查是否有有效的头像URL
        const hasValidAvatar = record.avatar_url && !record.avatar_url.includes('placeholder');

        return (
          <div className="flex items-start gap-3">
            <a href={record.channel_url} target="_blank" rel="noreferrer">
              {hasValidAvatar ? (
                <Avatar
                  src={record.avatar_url}
                  size={40}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              ) : (
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: '#6C6C9C',
                    color: '#fff'
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              )}
            </a>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <a
                  href={record.channel_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-gray-800 hover:text-[#6C6C9C] transition-colors truncate"
                >
                  {record.name}
                </a>
                <a href={record.channel_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0">
                  <YoutubeOutlined />
                </a>
              </div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">
                @{record.uuid}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: '粉丝数',
      dataIndex: 'subscriber_count',
      key: 'subscriber_count',
      width: 110,
      sorter: (a: any, b: any) => a.subscriber_count - b.subscriber_count,
      render: (val: number) => <span className="font-mono font-medium">{formatNumber(val)}</span>,
    },
    {
      title: '粉丝量级',
      dataIndex: 'subscriber_count',
      key: 'subscriber_tier',
      width: 110,
      render: (val: number) => {
        const tier = getSubscriberTier(val);
        return <Tag color={getTierColor(tier)}>{tier}</Tag>;
      },
    },
    {
      title: '视频数',
      dataIndex: 'video_count',
      key: 'video_count',
      width: 100,
      sorter: (a: any, b: any) => a.video_count - b.video_count,
      render: (val: number) => <span className="font-mono">{formatNumber(val)}</span>,
    },
    {
      title: '总观看次数',
      dataIndex: 'total_views',
      key: 'total_views',
      width: 130,
      sorter: (a: any, b: any) => a.total_views - b.total_views,
      render: (val: number) => <span className="font-mono">{formatNumber(val)}</span>,
    },
    {
      title: '平均观看',
      dataIndex: 'avg_views',
      key: 'avg_views',
      width: 110,
      sorter: (a: any, b: any) => a.avg_views - b.avg_views,
      render: (val: number) => <span className="font-mono">{formatNumber(val)}</span>,
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      width: 80,
      render: (code: string) => (
        <Tag>{getCountryName(code)}</Tag>
      ),
    },
    {
      title: <Tooltip title="通过行业/品牌/竞品关键词检索的红人才会呈现此结果"><span>命中关键词 ⓘ</span></Tooltip>,
      dataIndex: 'seo_keywords',
      key: 'seo_keywords',
      width: 250,
      render: (text: string) => {
        if (!text) return '-';
        const keywords = text.replace(/"/g, '').split(' ').filter(k => k.length > 2);
        return (
          <div className="flex flex-wrap gap-1">
            {keywords.slice(0, 3).map((k, i) => (
              <Tag key={i} color="blue" style={{ marginRight: 0, fontSize: '10px' }}>{k}</Tag>
            ))}
            {keywords.length > 3 && <span className="text-xs text-gray-400">+{keywords.length - 3}</span>}
          </div>
        );
      },
    },
    {
      title: '频道简介',
      dataIndex: 'channel_description',
      key: 'channel_description',
      width: 300,
      render: (text: string) => {
        if (!text) return '-';
        return (
          <Tooltip title={text}>
            <div className="line-clamp-2 text-xs text-gray-600">
              {text}
            </div>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className="relative pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/search/tasks')}
          className="text-gray-500 hover:text-gray-700"
        />
        <div>
          <Title level={3} style={{ marginBottom: 0 }}>搜索结果</Title>
          <Text type="secondary">任务：{task?.name || '加载中...'}</Text>
        </div>
        <div className="ml-auto">
          <Button icon={<ExportOutlined />} onClick={handleExportCSV}>导出结果</Button>
        </div>
      </div>

      {/* Filters */}
      <Card bordered={false} className="shadow-sm mb-6" bodyStyle={{ padding: '20px 24px' }}>
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} lg={14}>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">粉丝量级</span>
              <Select
                mode="multiple"
                allowClear
                placeholder="选择粉丝量级"
                style={{ width: '100%' }}
                value={selectedTiers}
                onChange={setSelectedTiers}
                maxTagCount="responsive"
              >
                <Option value="Mega">Mega (5M-10M)</Option>
                <Option value="Top">Top (1M-5M)</Option>
                <Option value="Macro">Macro (500K-1M)</Option>
                <Option value="Mid+">Mid+ (200K-500K)</Option>
                <Option value="Mid">Mid (100K-200K)</Option>
                <Option value="Micro+">Micro+ (50K-100K)</Option>
                <Option value="Micro">Micro (10K-50K)</Option>
                <Option value="Nano">Nano (0-10K)</Option>
              </Select>
            </div>
          </Col>
          <Col xs={0} lg={1}>
            <Divider type="vertical" className="h-12" />
          </Col>
          <Col xs={24} lg={9}>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">国家</span>
              <Select
                mode="multiple"
                allowClear
                placeholder="选择国家"
                style={{ width: '100%' }}
                value={selectedCountries}
                onChange={setSelectedCountries}
                maxTagCount="responsive"
              >
                {countries.map(c => (
                  <Option key={c} value={c}>{getCountryName(c)}</Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Results Table */}
      <Card bordered={false} className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            preserveSelectedRowKeys: true,
          }}
          columns={columns}
          dataSource={filteredData}
          rowKey="uuid"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            pageSize: 20,
            showTotal: (total, range) => `${range[0]}-${range[1]} / 共 ${total} 位红人`,
            position: ['bottomCenter']
          }}
          rowClassName="hover:bg-gray-50 transition-colors"
        />
      </Card>

      {/* Sticky Action Bar */}
      <div
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-100 px-6 py-3 flex items-center gap-6 transition-all duration-300 z-50 ${selectedRowKeys.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
        style={{ maxWidth: '90%' }}
      >
        <div className="flex items-center gap-2">
          <CheckCircleOutlined className="text-[#6C6C9C] text-xl" />
          <span className="font-medium text-gray-700">
            已选择 <span className="text-[#6C6C9C] font-bold">{selectedRowKeys.length}</span> 位红人
          </span>
        </div>
        <div className="h-6 w-px bg-gray-200"></div>
        <Button
          type="primary"
          size="large"
          onClick={handleStartEvaluate}
          style={{ backgroundColor: '#6C6C9C', borderRadius: '20px', paddingLeft: '32px', paddingRight: '32px' }}
        >
          开始评估
        </Button>
      </div>

      {/* Evaluate Config Modal */}
      <EvaluateConfigModal
        visible={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        onConfirm={handleConfigConfirm}
        defaultTaskName={defaultTaskName}
      />
    </div>
  );
};

export default TaskDetail;
