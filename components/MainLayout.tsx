import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Button, Dropdown, Space, Divider, Modal } from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  AuditOutlined,
  MailOutlined,
  LogoutOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  SettingOutlined,
  SwapOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useProjectStore } from '../stores/useProjectStore';
import { api } from '../services/api';

const { Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { currentProject, setCurrentProject } = useProjectStore();
  const [projects, setProjects] = useState<any[]>([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 加载项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectList = await api.getProjects();
        setProjects(projectList);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  // 切换项目
  const handleProjectChange = (project: any) => {
    // 如果点击的是当前项目，不做任何操作
    if (currentProject?.id === project.id) {
      return;
    }

    Modal.confirm({
      title: '切换项目',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>确定要切换到项目 <strong>{project.name}</strong> 吗？</p>
          {project.description && (
            <p className="text-gray-500 text-sm mt-2">{project.description}</p>
          )}
        </div>
      ),
      okText: '确认切换',
      cancelText: '取消',
      okButtonProps: { style: { backgroundColor: '#6C6C9C' } },
      onOk: () => {
        setCurrentProject(project);
        navigate('/search/tasks');
      },
    });
  };

  // 项目菜单
  const projectMenu = {
    items: projects.map(project => ({
      key: project.id,
      label: (
        <div className="py-1">
          <div className="font-medium text-gray-800">{project.name}</div>
          {project.description && (
            <div className="text-xs text-gray-500 mt-0.5">{project.description}</div>
          )}
        </div>
      ),
      onClick: () => handleProjectChange(project),
    })),
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: '个人资料',
        icon: <UserOutlined />,
      },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };


  const menuItems = [
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: '红人搜索',
      children: [
        { key: '/search/tasks', label: '任务列表' },
        { key: '/search/create', label: '创建任务' },
      ]
    },
    {
      key: 'evaluate',
      icon: <AuditOutlined />,
      label: '红人评估',
      children: [
        { key: '/evaluate/tasks', label: '任务列表' },
      ]
    },
    {
      key: '/pitch/list',
      icon: <MailOutlined />,
      label: '红人联络',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Sider
        trigger={null}
        theme="light"
        width={260}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
          background: '#ffffff',
          borderRight: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Logo区域 */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 font-bold text-lg text-gray-800 transition-all">
            <div className="min-w-9 min-h-9 w-9 h-9 bg-gradient-to-br from-[#6C6C9C] to-[#5a5a8a] rounded-xl flex items-center justify-center text-white shadow-sm">
              IM
            </div>
            <span className="whitespace-nowrap">Influencer Mkt</span>
          </div>
        </div>

        {/* 项目切换 */}
        <div className="px-4 pb-3">
          <Dropdown menu={projectMenu} trigger={['click']} placement="bottomLeft">
            <Button
              type="text"
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-[#6C6C9C] transition-all"
              style={{ height: 'auto' }}
            >
              <AppstoreOutlined className="text-gray-500" />
              <div className="flex-1 text-left">
                <div className="text-xs text-gray-500">当前项目</div>
                <div className="text-sm font-medium text-gray-800 truncate">{currentProject?.name || '未选择项目'}</div>
              </div>
              <SwapOutlined className="text-gray-400 text-xs" />
            </Button>
          </Dropdown>
        </div>

        {/* 菜单区域 */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Menu
            mode="inline"
            defaultOpenKeys={['search', 'evaluate']}
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            className="border-none"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              background: 'transparent'
            }}
            theme="light"
          />
        </div>

        {/* 用户信息区域 */}
        <div className="mt-auto border-t border-gray-100 px-4 py-3">
          <Dropdown menu={userMenu} placement="topRight" trigger={['click']}>
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-all">
              <Avatar
                size={36}
                style={{
                  backgroundColor: '#E3E3FF',
                  color: '#6C6C9C',
                  flexShrink: 0
                }}
                icon={<UserOutlined />}
              >
                {user?.name?.[0]}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{user?.name}</div>
                <div className="text-xs text-gray-500 truncate">{user?.username}</div>
              </div>
              <SettingOutlined className="text-gray-400" />
            </div>
          </Dropdown>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 260, transition: 'all 0.2s', background: '#fafafa' }}>
        <Content
          style={{
            margin: '24px 60px 24px 24px',
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
