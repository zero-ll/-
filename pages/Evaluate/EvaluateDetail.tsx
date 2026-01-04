import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  Table,
  Typography,
  Avatar,
  Tag,
  Button,
  Row,
  Col,
  Select,
  Modal,
  message,
  Divider,
  Tooltip,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  YoutubeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SendOutlined,
  DollarOutlined,
  LineChartOutlined,
  LinkOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { usePitchStore, PitchCandidate } from '../../stores/usePitchStore';
import NumberFilter, { NumberFilterValue } from '../../components/NumberFilter';
import ColumnConfigDropdown, { ALL_COLUMNS, DEFAULT_COLUMNS } from '../../components/ColumnConfigDropdown';
import * as XLSX from 'xlsx';
import { getCountryName } from '../../utils/countryMap';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to format numbers
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
};

// Helper function to get subscriber tier
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

// Helper function to get tier color
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

// Helper Component for Score Badges
const ScoreTag: React.FC<{ score: number }> = ({ score }) => {
  let color = '#ef4444'; // Red < 60
  if (score >= 80) color = '#22c55e'; // Green > 80
  else if (score >= 60) color = '#f59e0b'; // Orange 60-80

  return (
    <Tag color={color} style={{ fontSize: '13px', fontWeight: 500, border: 'none' }}>
      {score}
    </Tag>
  );
};

const EvaluateDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [task, setTask] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const addCandidates = usePitchStore((state) => state.addCandidates);
  const candidates = usePitchStore((state) => state.candidates);

  // Helper function to check if influencer is already a candidate
  const isCandidate = (influencerId: string): boolean => {
    return candidates.some(c => c.influencer_id === influencerId);
  };

  // Number Filter States
  const [qualityFilter, setQualityFilter] = useState<NumberFilterValue>({ condition: 'none' });
  const [matchFilter, setMatchFilter] = useState<NumberFilterValue>({ condition: 'none' });
  const [avgViewsFilter, setAvgViewsFilter] = useState<NumberFilterValue>({ condition: 'none' });
  const [cpmFilter, setCpmFilter] = useState<NumberFilterValue>({ condition: 'none' });
  const [sponsoredCountFilter, setSponsoredCountFilter] = useState<NumberFilterValue>({ condition: 'none' });

  // Multi-Select Filter States
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Column Configuration
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_COLUMNS);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [taskData, resultsData] = await Promise.all([
          api.getEvaluateTaskById(id),
          api.getEvaluationResults(id)
        ]);
        setTask(taskData);
        setResults(resultsData);
      } catch (error) {
        message.error('Failed to load evaluation details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Derived filter options
  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(results.map(r => r.country))).filter(Boolean);
    return uniqueCountries.sort();
  }, [results]);

  const subscriberTiers = useMemo(() => {
    return [
      { value: 'Mega', label: 'Mega (5M-10M)' },
      { value: 'Top', label: 'Top (1M-5M)' },
      { value: 'Macro', label: 'Macro (500K-1M)' },
      { value: 'Mid+', label: 'Mid+ (200K-500K)' },
      { value: 'Mid', label: 'Mid (100K-200K)' },
      { value: 'Micro+', label: 'Micro+ (50K-100K)' },
      { value: 'Micro', label: 'Micro (10K-50K)' },
      { value: 'Nano', label: 'Nano (0-10K)' },
    ];
  }, []);

  const channelTypes = useMemo(() => {
    const types = Array.from(new Set(results.map(r => r.channel_type).filter(Boolean)));
    return types.sort();
  }, [results]);

  // Helper function to apply number filter
  const applyNumberFilter = (value: number, filter: NumberFilterValue): boolean => {
    if (filter.condition === 'none') return true;
    if (filter.condition === 'gt' && filter.value1 !== undefined) {
      return value > filter.value1;
    }
    if (filter.condition === 'lt' && filter.value1 !== undefined) {
      return value < filter.value1;
    }
    if (filter.condition === 'between' && filter.value1 !== undefined && filter.value2 !== undefined) {
      return value >= filter.value1 && value <= filter.value2;
    }
    return true;
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return results.filter(item => {
      // Number filters
      if (!applyNumberFilter(item.quality_score, qualityFilter)) return false;
      if (!applyNumberFilter(item.match_score, matchFilter)) return false;
      if (!applyNumberFilter(item.avg_views_last_10, avgViewsFilter)) return false;
      if (!applyNumberFilter(item.estimated_cpm, cpmFilter)) return false;
      if (!applyNumberFilter(item.sponsored_count, sponsoredCountFilter)) return false;

      // Subscriber Tier Filter
      if (selectedTiers.length > 0) {
        const tier = getSubscriberTier(item.subscriber_count);
        if (!selectedTiers.includes(tier)) return false;
      }

      // Country Filter
      if (selectedCountries.length > 0 && !selectedCountries.includes(item.country)) {
        return false;
      }

      // Channel Type Filter
      if (selectedTypes.length > 0) {
        if (!item.channel_type || !selectedTypes.includes(item.channel_type)) return false;
      }

      return true;
    });
  }, [results, qualityFilter, matchFilter, avgViewsFilter, cpmFilter, sponsoredCountFilter, selectedTiers, selectedCountries, selectedTypes]);

  const handleAddToPitch = () => {
    Modal.confirm({
      title: '添加到联络列表',
      icon: <SendOutlined style={{ color: '#6C6C9C' }} />,
      content: `确定要将 ${selectedRowKeys.length} 位红人添加到联络候选列表吗？`,
      okText: '确认添加',
      cancelText: '取消',
      okButtonProps: { style: { backgroundColor: '#6C6C9C' } },
      onOk: async () => {
        try {
          // Filter selected items from results
          const selectedItems = results.filter(r => selectedRowKeys.includes(r.influencer_id));

          // Add to store
          addCandidates(selectedItems as PitchCandidate[]);

          message.success('成功添加到联络列表！');
          navigate('/pitch/list');
        } catch (error) {
          message.error('操作失败');
        }
      }
    });
  };

  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = filteredData.map(item => ({
        '红人名称': item.name,
        '红人ID': `@${item.influencer_id}`,
        '频道链接': item.channel_url,
        '粉丝数': item.subscriber_count,
        '粉丝量级': getSubscriberTier(item.subscriber_count),
        '国家': item.country,
        '红人类型': item.channel_type || '-',
        '质量评估': item.quality_score,
        '业务匹配度': item.match_score,
        '近10条均播': item.avg_views_last_10,
        '互动率': `${(item.engagement_rate * 100).toFixed(2)}%`,
        '商单数量': item.sponsored_count,
        '预估CPM': `$${item.estimated_cpm}`,
        '建议报价': `$${item.suggested_price}`,
        '近3月视频数': item.videos_last_3_months,
        '近10条中位数': item.median_views_last_10,
        '近10条短视频': item.short_videos_last_10,
        '近10条长视频': item.long_videos_last_10,
        '商单均播': item.sponsored_avg_views,
        '商单中位数': item.sponsored_median_views,
        '商单最高观看': item.sponsored_max_views,
        '商单最高互动率': `${(item.sponsored_max_engagement * 100).toFixed(2)}%`,
        '商单均播占比': item.sponsored_avg_views_ratio.toFixed(2),
      }));

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '评估结果');

      // Generate file name with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `评估结果_${task?.name || '未命名'}_${timestamp}.xlsx`;

      // Export
      XLSX.writeFile(wb, fileName);
      message.success('导出成功！');
    } catch (error) {
      message.error('导出失败');
      console.error('Export error:', error);
    }
  };

  // Define all possible columns
  const allColumnsConfig: Record<string, any> = {
    influencer: {
      title: '红人',
      dataIndex: 'name',
      key: 'influencer',
      width: 280,
      fixed: 'left' as const,
      render: (_: string, record: any) => {
        const hasValidAvatar = record.avatar_url && !record.avatar_url.includes('placeholder');
        return (
          <div className="flex items-start gap-3">
            <a href={record.channel_url} target="_blank" rel="noreferrer">
              {hasValidAvatar ? (
                <Avatar src={record.avatar_url} size={40} className="cursor-pointer hover:opacity-80" />
              ) : (
                <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#6C6C9C', color: '#fff' }} className="cursor-pointer hover:opacity-80" />
              )}
            </a>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <a href={record.channel_url} target="_blank" rel="noreferrer" className="font-semibold text-gray-800 hover:text-[#6C6C9C] truncate">
                  {record.name}
                </a>
                <a href={record.channel_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-600 flex-shrink-0">
                  <YoutubeOutlined />
                </a>
              </div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">
                @{record.influencer_id}
              </div>
            </div>
          </div>
        );
      },
    },
    subscriber_tier: {
      title: '粉丝量级',
      dataIndex: 'subscriber_count',
      key: 'subscriber_tier',
      width: 120,
      render: (val: number) => {
        const tier = getSubscriberTier(val);
        return <Tag color={getTierColor(tier)}>{tier}</Tag>;
      },
    },
    country: {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      width: 90,
      render: (code: string) => <Tag>{getCountryName(code)}</Tag>,
    },
    channel_type: {
      title: '红人类型',
      dataIndex: 'channel_type',
      key: 'channel_type',
      width: 200,
      render: (text: string) => text ? <Tag color="geekblue">{text}</Tag> : <span className="text-gray-400">-</span>,
    },
    quality_score: {
      title: '质量评估',
      dataIndex: 'quality_score',
      key: 'quality_score',
      width: 110,
      sorter: (a: any, b: any) => a.quality_score - b.quality_score,
      render: (score: number) => <ScoreTag score={score} />,
    },
    match_score: {
      title: '业务匹配度',
      dataIndex: 'match_score',
      key: 'match_score',
      width: 120,
      sorter: (a: any, b: any) => a.match_score - b.match_score,
      render: (score: number) => <ScoreTag score={score} />,
    },
    avg_views_last_10: {
      title: '近10条均播',
      dataIndex: 'avg_views_last_10',
      key: 'avg_views_last_10',
      width: 140,
      sorter: (a: any, b: any) => a.avg_views_last_10 - b.avg_views_last_10,
      render: (val: number) => <span className="font-mono">{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}</span>,
    },
    engagement_rate: {
      title: '互动率',
      dataIndex: 'engagement_rate',
      key: 'engagement_rate',
      width: 110,
      sorter: (a: any, b: any) => a.engagement_rate - b.engagement_rate,
      render: (val: number) => (
        <div className="flex items-center gap-1">
          <LineChartOutlined className="text-blue-400" />
          <span>{(val * 100).toFixed(2)}%</span>
        </div>
      ),
    },
    sponsored_count: {
      title: <Tooltip title="基于搜索任务输入的本品竞品搜索词匹配"><span>商单数量 ⓘ</span></Tooltip>,
      dataIndex: 'sponsored_count',
      key: 'sponsored_count',
      width: 110,
      sorter: (a: any, b: any) => a.sponsored_count - b.sponsored_count,
      render: (val: number) => <span className="font-mono">{val}</span>,
    },
    estimated_cpm: {
      title: '预估CPM',
      dataIndex: 'estimated_cpm',
      key: 'estimated_cpm',
      width: 110,
      sorter: (a: any, b: any) => a.estimated_cpm - b.estimated_cpm,
      render: (val: number) => <span className="text-gray-600">${val}</span>,
    },
    suggested_price: {
      title: '建议报价',
      dataIndex: 'suggested_price',
      key: 'suggested_price',
      width: 130,
      sorter: (a: any, b: any) => a.suggested_price - b.suggested_price,
      render: (val: number) => (
        <span className="text-gray-600">${new Intl.NumberFormat('en-US').format(val)}</span>
      ),
    },
    videos_last_3_months: {
      title: '近3月视频数',
      dataIndex: 'videos_last_3_months',
      key: 'videos_last_3_months',
      width: 130,
      sorter: (a: any, b: any) => a.videos_last_3_months - b.videos_last_3_months,
      render: (val: number) => <span className="font-mono">{val}</span>,
    },
    median_views_last_10: {
      title: '近10条中位数',
      dataIndex: 'median_views_last_10',
      key: 'median_views_last_10',
      width: 140,
      sorter: (a: any, b: any) => a.median_views_last_10 - b.median_views_last_10,
      render: (val: number) => <span className="font-mono">{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}</span>,
    },
    short_videos_last_10: {
      title: '近10条短视频',
      dataIndex: 'short_videos_last_10',
      key: 'short_videos_last_10',
      width: 140,
      sorter: (a: any, b: any) => a.short_videos_last_10 - b.short_videos_last_10,
      render: (val: number) => <span className="font-mono">{val}</span>,
    },
    long_videos_last_10: {
      title: '近10条长视频',
      dataIndex: 'long_videos_last_10',
      key: 'long_videos_last_10',
      width: 140,
      sorter: (a: any, b: any) => a.long_videos_last_10 - b.long_videos_last_10,
      render: (val: number) => <span className="font-mono">{val}</span>,
    },
    sponsored_avg_views: {
      title: '商单均播',
      dataIndex: 'sponsored_avg_views',
      key: 'sponsored_avg_views',
      width: 140,
      sorter: (a: any, b: any) => a.sponsored_avg_views - b.sponsored_avg_views,
      render: (val: number) => <span className="font-mono">{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}</span>,
    },
    sponsored_median_views: {
      title: '商单中位数',
      dataIndex: 'sponsored_median_views',
      key: 'sponsored_median_views',
      width: 140,
      sorter: (a: any, b: any) => a.sponsored_median_views - b.sponsored_median_views,
      render: (val: number) => <span className="font-mono">{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}</span>,
    },
    sponsored_max_views: {
      title: '商单最高观看',
      dataIndex: 'sponsored_max_views',
      key: 'sponsored_max_views',
      width: 150,
      sorter: (a: any, b: any) => a.sponsored_max_views - b.sponsored_max_views,
      render: (val: number) => <span className="font-mono">{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}</span>,
    },
    sponsored_max_engagement: {
      title: '商单最高互动率',
      dataIndex: 'sponsored_max_engagement',
      key: 'sponsored_max_engagement',
      width: 160,
      sorter: (a: any, b: any) => a.sponsored_max_engagement - b.sponsored_max_engagement,
      render: (val: number) => <span>{(val * 100).toFixed(2)}%</span>,
    },
    sponsored_avg_views_ratio: {
      title: '商单均播占比',
      dataIndex: 'sponsored_avg_views_ratio',
      key: 'sponsored_avg_views_ratio',
      width: 140,
      sorter: (a: any, b: any) => a.sponsored_avg_views_ratio - b.sponsored_avg_views_ratio,
      render: (val: number) => <span>{val.toFixed(2)}</span>,
    },
    sponsored_video_links: {
      title: '商单视频链接',
      dataIndex: 'sponsored_video_links',
      key: 'sponsored_video_links',
      width: 160,
      render: (links: string[]) => {
        if (!links || links.length === 0) return <span className="text-gray-400">-</span>;
        return (
          <Space direction="vertical" size={2}>
            {links.slice(0, 2).map((link, i) => (
              <a key={i} href={link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                <LinkOutlined style={{ fontSize: '10px' }} />
                视频 {i + 1}
              </a>
            ))}
            {links.length > 2 && <span className="text-xs text-gray-400">+{links.length - 2} 更多</span>}
          </Space>
        );
      },
    },
  };

  // Generate visible columns based on configuration
  const columns = visibleColumns.map(key => allColumnsConfig[key]).filter(Boolean);

  return (
    <div className="relative pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/evaluate/tasks')}
            className="text-gray-500 hover:text-gray-700"
          />
          <div>
            <Title level={3} style={{ marginBottom: 0 }}>评估报告</Title>
            <Text type="secondary">{task?.name || '加载详情中...'}</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
          style={{ backgroundColor: '#6C6C9C' }}
        >
          导出结果
        </Button>
      </div>

      {/* Channel Types Config */}
      {task?.channelTypes && (
        <Card bordered={false} className="shadow-sm mb-4" bodyStyle={{ padding: '12px 20px' }}>
          <div className="flex items-center gap-3">
            <Text strong className="text-gray-600 text-sm" style={{ minWidth: '80px' }}>频道类型要求</Text>
            <Space size={[8, 8]} wrap>
              {task.channelTypes.p0 && task.channelTypes.p0.length > 0 && task.channelTypes.p0.map((type: string, i: number) => (
                <Tag key={`p0-${i}`} color="red" style={{ margin: 0, fontSize: '12px' }}>P0:{type}</Tag>
              ))}
              {task.channelTypes.p1 && task.channelTypes.p1.length > 0 && task.channelTypes.p1.map((type: string, i: number) => (
                <Tag key={`p1-${i}`} color="orange" style={{ margin: 0, fontSize: '12px' }}>P1:{type}</Tag>
              ))}
              {task.channelTypes.p2 && task.channelTypes.p2.length > 0 && task.channelTypes.p2.map((type: string, i: number) => (
                <Tag key={`p2-${i}`} color="blue" style={{ margin: 0, fontSize: '12px' }}>P2:{type}</Tag>
              ))}
            </Space>
          </div>
        </Card>
      )}

      {/* Advanced Filters */}
      <Card bordered={false} className="shadow-sm mb-6" bodyStyle={{ padding: '20px 24px' }}>
        {/* Number Filters Row 1 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">质量评估</span>
              <NumberFilter
                value={qualityFilter}
                onChange={setQualityFilter}
                min={0}
                max={100}
                precision={0}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">业务匹配度</span>
              <NumberFilter
                value={matchFilter}
                onChange={setMatchFilter}
                min={0}
                max={100}
                precision={0}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">均播</span>
              <NumberFilter
                value={avgViewsFilter}
                onChange={setAvgViewsFilter}
                min={0}
                step={1000}
                precision={0}
              />
            </div>
          </Col>
        </Row>

        {/* Number Filters Row 2 */}
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} sm={12} lg={8}>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">预估CPM</span>
              <NumberFilter
                value={cpmFilter}
                onChange={setCpmFilter}
                min={0}
                precision={0}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">商单数量</span>
              <NumberFilter
                value={sponsoredCountFilter}
                onChange={setSponsoredCountFilter}
                min={0}
                precision={0}
              />
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        {/* Multi-Select Filters */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
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
                {subscriberTiers.map(tier => (
                  <Option key={tier.value} value={tier.value}>{tier.label}</Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} lg={8}>
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
          <Col xs={24} lg={8}>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">红人类型</span>
              <Select
                mode="multiple"
                allowClear
                placeholder="选择红人类型"
                style={{ width: '100%' }}
                value={selectedTypes}
                onChange={setSelectedTypes}
                maxTagCount="responsive"
              >
                {channelTypes.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        bordered={false}
        className="shadow-sm"
        bodyStyle={{ padding: 0 }}
        extra={<ColumnConfigDropdown onChange={setVisibleColumns} />}
      >
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            preserveSelectedRowKeys: true,
            getCheckboxProps: (record: any) => {
              const isAlreadyCandidate = isCandidate(record.influencer_id);
              return {
                disabled: isAlreadyCandidate,
              };
            },
            renderCell: (checked: boolean, record: any, index: number, originNode: React.ReactNode) => {
              const isAlreadyCandidate = isCandidate(record.influencer_id);
              if (isAlreadyCandidate) {
                return (
                  <Tooltip title="此红人已添加至红人候选列表">
                    {originNode}
                  </Tooltip>
                );
              }
              return originNode;
            },
          }}
          columns={columns}
          dataSource={filteredData}
          rowKey="influencer_id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 15,
            showTotal: (total) => `共 ${total} 个结果`,
            position: ['bottomCenter']
          }}
          rowClassName="hover:bg-gray-50"
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
            已选择 <span className="text-[#6C6C9C] font-bold">{selectedRowKeys.length}</span> 位候选人
          </span>
        </div>
        <div className="h-6 w-px bg-gray-200"></div>
        <Button
          type="primary"
          size="large"
          onClick={handleAddToPitch}
          icon={<SendOutlined />}
          style={{ backgroundColor: '#6C6C9C', borderRadius: '20px', paddingLeft: '24px', paddingRight: '24px' }}
        >
          添加到联络列表
        </Button>
      </div>
    </div>
  );
};

export default EvaluateDetail;
