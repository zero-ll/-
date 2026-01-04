import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Tag, Typography, Space } from 'antd';

const { Text } = Typography;

interface ChannelTypeConfig {
  p0: string[];
  p1: string[];
  p2: string[];
}

interface EvaluateConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (data: { taskName: string; channelTypes: ChannelTypeConfig }) => void;
  defaultTaskName?: string;
}

const STORAGE_KEY = 'evaluate_channel_type_config';

const EvaluateConfigModal: React.FC<EvaluateConfigModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  defaultTaskName = '',
}) => {
  const [form] = Form.useForm();
  const [p0Tags, setP0Tags] = useState<string[]>([]);
  const [p1Tags, setP1Tags] = useState<string[]>([]);
  const [p2Tags, setP2Tags] = useState<string[]>([]);
  const [p0InputValue, setP0InputValue] = useState('');
  const [p1InputValue, setP1InputValue] = useState('');
  const [p2InputValue, setP2InputValue] = useState('');

  // 从localStorage加载上次配置
  useEffect(() => {
    if (visible) {
      // 设置任务名称默认值
      form.setFieldsValue({ taskName: defaultTaskName });

      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        try {
          const config: ChannelTypeConfig = JSON.parse(savedConfig);
          setP0Tags(config.p0 || []);
          setP1Tags(config.p1 || []);
          setP2Tags(config.p2 || []);
        } catch (e) {
          console.error('Failed to parse saved config:', e);
        }
      }
    }
  }, [visible, defaultTaskName, form]);

  // 处理标签输入
  const handleInputConfirm = (
    value: string,
    tags: string[],
    setTags: React.Dispatch<React.SetStateAction<string[]>>,
    setInputValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value && !tags.includes(value.trim())) {
      setTags([...tags, value.trim()]);
    }
    setInputValue('');
  };

  // 处理标签移除
  const handleTagClose = (
    removedTag: string,
    tags: string[],
    setTags: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  // 确认提交
  const handleOk = async () => {
    // 先验证P0必填
    if (p0Tags.length === 0) {
      form.setFields([
        {
          name: 'p0',
          errors: ['P0频道类型为必填项，请至少添加一个'],
        },
      ]);
      return;
    }

    try {
      // 验证表单（任务名称）
      const values = await form.validateFields();

      const channelTypes: ChannelTypeConfig = {
        p0: p0Tags,
        p1: p1Tags,
        p2: p2Tags,
      };

      // 保存频道类型配置到localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(channelTypes));

      onConfirm({
        taskName: values.taskName,
        channelTypes,
      });
      handleCancel();
    } catch (error) {
      // 表单验证失败（任务名称为空）
      console.error('Validation failed:', error);
    }
  };

  // 取消或关闭
  const handleCancel = () => {
    form.resetFields();
    setP0InputValue('');
    setP1InputValue('');
    setP2InputValue('');
    onCancel();
  };

  // 渲染标签输入组件
  const renderTagInput = (
    tags: string[],
    setTags: React.Dispatch<React.SetStateAction<string[]>>,
    inputValue: string,
    setInputValue: React.Dispatch<React.SetStateAction<string>>,
    placeholder: string
  ) => (
    <div className="border border-gray-300 rounded p-3">
      {/* 已有标签显示区域 */}
      {tags.length > 0 && (
        <div className="mb-2">
          <Space size={[4, 4]} wrap>
            {tags.map((tag) => (
              <Tag
                key={tag}
                closable
                onClose={() => handleTagClose(tag, tags, setTags)}
                color="blue"
              >
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {/* 输入框 */}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onPressEnter={(e) => {
          e.preventDefault();
          handleInputConfirm(inputValue, tags, setTags, setInputValue);
        }}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );

  return (
    <Modal
      title="配置红人画像需求"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      okText="确认"
      cancelText="取消"
      okButtonProps={{ style: { backgroundColor: '#6C6C9C' } }}
    >
      <div className="mb-4">
        <Text type="secondary">
          请按优先级输入您需要找的红人频道类型，我们会用作业务匹配度的评估
        </Text>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label={<span className="font-semibold">任务名称 <Text type="danger">*</Text></span>}
          name="taskName"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="请输入任务名称" size="large" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold">P0 频道类型 <Text type="danger">*</Text></span>}
          name="p0"
          rules={[{ required: true, message: 'P0频道类型为必填项' }]}
        >
          {renderTagInput(p0Tags, setP0Tags, p0InputValue, setP0InputValue, '输入后按回车添加')}
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold">P1 频道类型</span>}
          name="p1"
        >
          {renderTagInput(p1Tags, setP1Tags, p1InputValue, setP1InputValue, '输入后按回车添加')}
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold">P2 频道类型</span>}
          name="p2"
        >
          {renderTagInput(p2Tags, setP2Tags, p2InputValue, setP2InputValue, '输入后按回车添加')}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EvaluateConfigModal;
