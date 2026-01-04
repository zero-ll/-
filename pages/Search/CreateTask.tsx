import React, { useState } from 'react';
import {
  Card,
  Typography,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  Upload,
  message,
  Row,
  Col,
  Space,
  InputNumber,
  Alert
} from 'antd';
import {
  InboxOutlined,
  SearchOutlined,
  FileExcelOutlined,
  ArrowLeftOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/useProjectStore';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const currentProject = useProjectStore((state) => state.currentProject);
  const [loading, setLoading] = useState(false);
  const [uploadForm] = Form.useForm();

  // 下载Excel模板
  const handleDownloadTemplate = () => {
    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 创建数据，第一行是表头
    const data = [
      ['红人 id', '频道 id']
    ];

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(data);

    // 设置列宽
    ws['!cols'] = [
      { wch: 30 }, // 红人 id 列宽
      { wch: 30 }  // 频道 id 列宽
    ];

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '红人名单');

    // 生成并下载文件
    XLSX.writeFile(wb, '红人名单导入模板.xlsx');
  };

  const onFinishKeyword = async (values: any) => {
    setLoading(true);
    try {
      await api.createSearchTask({
        projectId: currentProject?.id,
        name: values.taskName,
        type: 'keyword',
        config: {
          ...values,
          videosPerKeyword: values.videosPerKeyword || 50,
        }
      });
      message.success('搜索任务已成功启动');
      navigate('/search/tasks');
    } catch (error) {
      message.error('创建任务失败');
    } finally {
      setLoading(false);
    }
  };

  const onFinishUpload = async (values: any) => {
    // 验证：必须上传文件
    const hasFile = values.file && values.file.length > 0;

    if (!hasFile) {
      message.error('请上传 Excel 文件');
      return;
    }

    setLoading(true);
    try {
      await api.createSearchTask({
        projectId: currentProject?.id,
        name: values.taskName,
        type: 'upload',
        config: {
          industryKeywords: values.industryKeywords,
          brandKeywords: values.brandKeywords,
          competitorKeywords: values.competitorKeywords,
        }
      });
      message.success('任务创建成功，开始处理');
      navigate('/search/tasks');
    } catch (error) {
      message.error('创建任务失败');
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const KeywordForm = () => (
    <Form layout="vertical" onFinish={onFinishKeyword} initialValues={{ videosPerKeyword: 50, searchDimension: 'video', sortBy: 'relevance' }}>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item
            name="taskName"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="例如：夏季营销活动初步搜索" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Form.Item
            name="industryKeywords"
            label="行业关键词"
            tooltip="与产品类别相关的关键词（例如：'割草机'、'园艺'）"
            rules={[{ required: true, message: '请输入行业关键词' }]}
          >
            <Input.TextArea placeholder="输入关键词，用分号分隔" rows={3} />
          </Form.Item>

          <Form.Item
            name="brandKeywords"
            label="品牌关键词"
            tooltip="您自己的品牌名称，用于查找现有提及"
            rules={[{ required: true, message: '请输入品牌关键词' }]}
          >
            <Input.TextArea placeholder="输入关键词，用分号分隔" rows={3} />
          </Form.Item>

          <Form.Item
            name="competitorKeywords"
            label="竞品关键词"
            tooltip="竞争对手的品牌名称"
            rules={[{ required: true, message: '请输入竞品关键词' }]}
          >
            <Input.TextArea placeholder="输入关键词，用分号分隔" rows={3} />
          </Form.Item>
        </Col>

        <Col xs={24} lg={12}>
          <Form.Item
            name="videosPerKeyword"
            label="单个关键字搜索视频数"
            rules={[{ required: true, message: '请输入搜索视频数' }]}
          >
            <InputNumber min={10} max={200} style={{ width: '100%' }} placeholder="10-200" />
          </Form.Item>

          <Form.Item name="sortBy" label="排序方式">
            <Select>
              <Option value="relevance">相关性</Option>
              <Option value="viewCount">观看次数</Option>
              <Option value="date">发布时间</Option>
            </Select>
          </Form.Item>

          <Form.Item name="searchDimension" label="检索维度">
            <Select>
              <Option value="video">按视频</Option>
              <Option value="channel">按网红</Option>
            </Select>
          </Form.Item>

          <Form.Item name="countryPreference" label="国家偏好">
            <Select mode="multiple" placeholder="选择国家（可选）" allowClear>
              <Option value="US">美国</Option>
              <Option value="UK">英国</Option>
              <Option value="DE">德国</Option>
              <Option value="FR">法国</Option>
              <Option value="CA">加拿大</Option>
              <Option value="AU">澳大利亚</Option>
            </Select>
          </Form.Item>

          <Form.Item name="minSubscribers" label="最小粉丝数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="例如：10000" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" loading={loading} style={{ width: 150 }}>
          开始搜索
        </Button>
      </Form.Item>
    </Form>
  );

  const UploadForm = () => (
    <Form layout="vertical" onFinish={onFinishUpload} form={uploadForm}>
      <Form.Item
        name="taskName"
        label="任务名称"
        rules={[{ required: true, message: '请输入任务名称' }]}
      >
        <Input placeholder="例如：红人名单导入 Q1" size="large" />
      </Form.Item>

      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Form.Item
            name="industryKeywords"
            label="行业关键词"
            tooltip="与产品类别相关的关键词"
            rules={[{ required: true, message: '请输入行业关键词' }]}
          >
            <Input.TextArea placeholder="输入关键词，用分号分隔" rows={4} />
          </Form.Item>
        </Col>

        <Col xs={24} lg={8}>
          <Form.Item
            name="brandKeywords"
            label="品牌关键词"
            tooltip="您自己的品牌名称"
            rules={[{ required: true, message: '请输入品牌关键词' }]}
          >
            <Input.TextArea placeholder="输入关键词，用分号分隔" rows={4} />
          </Form.Item>
        </Col>

        <Col xs={24} lg={8}>
          <Form.Item
            name="competitorKeywords"
            label="竞品关键词"
            tooltip="竞争对手的品牌名称"
            rules={[{ required: true, message: '请输入竞品关键词' }]}
          >
            <Input.TextArea placeholder="输入关键词，用分号分隔" rows={4} />
          </Form.Item>
        </Col>
      </Row>

      <div className="text-xs text-gray-400 mb-6">
        以上关键词配置将用作红人评估时的"商单"识别依据
      </div>

      <Row gutter={24}>
        <Col xs={24}>
          <Form.Item label="上传红人名单">
            <Form.Item
              name="file"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              noStyle
            >
              <Dragger
                name="file"
                multiple={false}
                accept=".xlsx, .xls"
                beforeUpload={() => false}
                style={{ padding: '20px 0', background: '#FAFBFE', border: '1px dashed #d9d9d9' }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: '#6C6C9C' }} />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint text-xs">
                  仅支持 Excel 文件 (.xlsx, .xls)
                </p>
                <div className="mt-4">
                  <Button
                    icon={<FileExcelOutlined />}
                    type="dashed"
                    size="small"
                    onClick={handleDownloadTemplate}
                  >
                    下载模板
                  </Button>
                </div>
              </Dragger>
            </Form.Item>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item className="mt-6">
        <Button type="primary" htmlType="submit" size="large" loading={loading} style={{ width: 150 }}>
          创建任务
        </Button>
      </Form.Item>
    </Form>
  );

  const items = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2">
          <SearchOutlined /> 关键词搜索
        </span>
      ),
      children: <KeywordForm />,
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2">
          <IdcardOutlined /> 按红人 ID 搜索
        </span>
      ),
      children: <UploadForm />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/search/tasks')}
          className="text-gray-500 hover:text-gray-700"
        />
        <div>
          <Title level={3} style={{ marginBottom: 0 }}>创建搜索任务</Title>
          <Text type="secondary">搜索新红人或分析现有红人</Text>
        </div>
      </div>

      <Card bordered={false} className="shadow-sm">
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
};

export default CreateTask;
