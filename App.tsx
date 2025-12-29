import React from 'react';
import { ConfigProvider } from 'antd';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Projects from './pages/Projects';
import SearchTaskList from './pages/Search/TaskList';
import CreateSearchTask from './pages/Search/CreateTask';
import TaskDetail from './pages/Search/TaskDetail';
import EvaluateTaskList from './pages/Evaluate/TaskList';
import EvaluateDetail from './pages/Evaluate/EvaluateDetail';
import CandidateList from './pages/Pitch/CandidateList';
import Placeholder from './pages/Placeholder';
import { useAuthStore } from './stores/useAuthStore';
import { useProjectStore } from './stores/useProjectStore';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// Project Guard Wrapper
const ProjectRoute = () => {
  const currentProject = useProjectStore((state) => state.currentProject);
  if (!currentProject) {
    return <Navigate to="/projects" replace />;
  }
  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6C6C9C',
          colorLink: '#6C6C9C',
          borderRadius: 6,
          fontFamily: "'Inter', sans-serif",
          colorBgBase: '#ffffff',
        },
        components: {
          Layout: {
            bodyBg: '#FAFBFE',
            headerBg: '#ffffff',
            siderBg: '#ffffff',
          },
          Menu: {
            itemSelectedBg: '#E3E3FF',
            itemSelectedColor: '#6C6C9C',
          }
        },
      }}
    >
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/projects" element={<Projects />} />
            
            <Route element={<ProjectRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/search/tasks" replace />} />
                
                <Route path="search/tasks" element={<SearchTaskList />} />
                <Route path="search/create" element={<CreateSearchTask />} />
                <Route path="search/tasks/:id" element={<TaskDetail />} />
                
                <Route path="evaluate/tasks" element={<EvaluateTaskList />} />
                <Route path="evaluate/tasks/:id" element={<EvaluateDetail />} />
                
                <Route path="pitch/list" element={<CandidateList />} />
                <Route path="tracking" element={<Placeholder title="Tracking" />} />
                
                <Route path="*" element={<Navigate to="/search/tasks" replace />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
};

export default App;
