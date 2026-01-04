import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Checkbox, Space, Divider } from 'antd';
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

// 所有字段定义
export interface ColumnField {
  key: string;
  label: string;
  mandatory: boolean; // 是否为必须展示字段
}

export const ALL_COLUMNS: ColumnField[] = [
  { key: 'influencer', label: '红人', mandatory: true },
  { key: 'subscriber_tier', label: '粉丝量级', mandatory: true },
  { key: 'country', label: '国家', mandatory: true },
  { key: 'channel_type', label: '红人类型', mandatory: false },
  { key: 'is_candidate', label: '候选状态', mandatory: false },
  { key: 'quality_score', label: '红人质量评估', mandatory: true },
  { key: 'match_score', label: '红人业务匹配度', mandatory: true },
  { key: 'avg_views_last_10', label: '近10条均播', mandatory: true },
  { key: 'engagement_rate', label: '互动率', mandatory: true },
  { key: 'sponsored_count', label: '商单数量', mandatory: false },
  { key: 'estimated_cpm', label: '预估CPM', mandatory: false },
  { key: 'suggested_price', label: '建议报价', mandatory: false },
  { key: 'videos_last_3_months', label: '近3个月发布视频数', mandatory: false },
  { key: 'median_views_last_10', label: '近10条播放中位数', mandatory: false },
  { key: 'short_videos_last_10', label: '近10条短视频数量', mandatory: false },
  { key: 'long_videos_last_10', label: '近10条长视频数量', mandatory: false },
  { key: 'sponsored_avg_views', label: '商单均播', mandatory: false },
  { key: 'sponsored_median_views', label: '商单中位数', mandatory: false },
  { key: 'sponsored_max_views', label: '商单最高观看量', mandatory: false },
  { key: 'sponsored_max_engagement', label: '商单最高互动率', mandatory: false },
  { key: 'sponsored_avg_views_ratio', label: '商单均播占比', mandatory: false },
  { key: 'sponsored_video_links', label: '商单视频链接', mandatory: false },
];

// 默认展示的字段（12个）
export const DEFAULT_COLUMNS = [
  'influencer',
  'subscriber_tier',
  'country',
  'channel_type',
  'is_candidate',
  'quality_score',
  'match_score',
  'avg_views_last_10',
  'engagement_rate',
  'sponsored_count',
  'estimated_cpm',
  'suggested_price',
];

const STORAGE_KEY = 'evaluate_column_config';

interface ColumnConfigDropdownProps {
  onChange?: (selectedColumns: string[]) => void;
}

const ColumnConfigDropdown: React.FC<ColumnConfigDropdownProps> = ({ onChange }) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // 从 localStorage 加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setSelectedColumns(config);
        onChange?.(config);
      } catch (e) {
        console.error('Failed to parse saved column config:', e);
      }
    } else {
      onChange?.(DEFAULT_COLUMNS);
    }
  }, []);

  // 保存配置到 localStorage
  const saveConfig = (columns: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  };

  // 处理列选择变化
  const handleColumnToggle = (columnKey: string, checked: boolean) => {
    const newColumns = checked
      ? [...selectedColumns, columnKey]
      : selectedColumns.filter((key) => key !== columnKey);

    setSelectedColumns(newColumns);
    saveConfig(newColumns);
    onChange?.(newColumns);
  };

  // 重置为默认配置
  const handleReset = () => {
    setSelectedColumns(DEFAULT_COLUMNS);
    saveConfig(DEFAULT_COLUMNS);
    onChange?.(DEFAULT_COLUMNS);
    setDropdownVisible(false);
  };

  // 生成下拉菜单内容
  const dropdownMenu = (
    <div className="bg-white rounded shadow-lg p-4" style={{ width: 320, maxHeight: 500, overflowY: 'auto' }}>
      <div className="mb-3 flex justify-between items-center">
        <span className="font-semibold text-gray-700">列配置</span>
        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={handleReset}
        >
          重置
        </Button>
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {ALL_COLUMNS.map((column) => {
          const isChecked = selectedColumns.includes(column.key);
          const isDisabled = column.mandatory;

          return (
            <div
              key={column.key}
              className={`flex items-center p-2 rounded hover:bg-gray-50 ${
                isDisabled ? 'bg-gray-50' : ''
              }`}
            >
              <Checkbox
                checked={isChecked}
                disabled={isDisabled}
                onChange={(e) => handleColumnToggle(column.key, e.target.checked)}
              >
                <span className={isDisabled ? 'text-gray-500' : 'text-gray-700'}>
                  {column.label}
                  {isDisabled && <span className="text-xs text-gray-400 ml-1">(必选)</span>}
                </span>
              </Checkbox>
            </div>
          );
        })}
      </Space>
    </div>
  );

  return (
    <Dropdown
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
      dropdownRender={() => dropdownMenu}
      trigger={['click']}
      placement="bottomRight"
      getPopupContainer={(trigger) => trigger.parentElement || document.body}
    >
      <Button icon={<SettingOutlined />}>
        列配置
      </Button>
    </Dropdown>
  );
};

export default ColumnConfigDropdown;
