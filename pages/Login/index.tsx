import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功');
      navigate('/projects');
    } catch (error) {
      message.error('用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBFE]">
      <Card 
        style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
        bordered={false}
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#6C6C9C] rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            IM
          </div>
          <Title level={3} style={{ color: '#333', marginBottom: 0 }}>欢迎回来</Title>
          <Text type="secondary">登录您的账户</Text>
        </div>

        <Form
          name="login"
          initialValues={{ username: 'admin', password: '123456' }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ backgroundColor: '#6C6C9C' }}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
