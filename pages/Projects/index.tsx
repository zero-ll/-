import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin, Avatar, Button } from 'antd';
import { FolderOpenOutlined, ArrowRightOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Project } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';
import { useProjectStore } from '../../stores/useProjectStore';

const { Title, Text } = Typography;

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    navigate('/search/tasks');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFE]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFE] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} style={{ marginBottom: 0 }}>选择项目</Title>
            <Text type="secondary">选择一个项目来管理您的营销活动</Text>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar style={{ backgroundColor: '#6C6C9C' }}>{user?.name?.[0]}</Avatar>
              <span className="font-medium">{user?.name}</span>
            </div>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {projects.map((project) => (
            <Col xs={24} sm={12} md={8} key={project.id}>
              <Card 
                hoverable 
                className="h-full border border-gray-100"
                onClick={() => handleProjectSelect(project)}
                actions={[
                  <div key="enter" className="flex justify-center items-center text-[#6C6C9C] font-medium">
                    进入项目 <ArrowRightOutlined className="ml-2" />
                  </div>
                ]}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-[#E3E3FF] rounded-lg">
                    <FolderOpenOutlined style={{ fontSize: '24px', color: '#6C6C9C' }} />
                  </div>
                  <div>
                    <Title level={4} style={{ marginBottom: 4 }}>{project.name}</Title>
                    <Text type="secondary">ID: {project.id}</Text>
                  </div>
                </div>
                <div className="mt-4 flex -space-x-2 overflow-hidden">
                   {/* Mock avatars for team members */}
                   {project.users.map((uid, idx) => (
                     <Avatar key={uid} size="small" style={{ backgroundColor: idx % 2 === 0 ? '#87d068' : '#108ee9' }}>
                        U{uid}
                     </Avatar>
                   ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Projects;
