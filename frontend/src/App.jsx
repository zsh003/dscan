import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Space, Avatar, Typography } from 'antd';
import {
  DashboardOutlined,
  ScanOutlined,
  HistoryOutlined,
  BugOutlined,
  SecurityScanOutlined,
  WarningOutlined,
  FileSearchOutlined,
  FolderOutlined,
  SafetyOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';
import ScanHistoryPage from './pages/ScanHistoryPage';
import ScanDetailPage from './pages/ScanDetailPage';
import XSSVulnPage from './pages/vulnerabilities/XSSVulnPage';
import SQLVulnPage from './pages/vulnerabilities/SQLVulnPage';
import InfoLeakVulnPage from './pages/vulnerabilities/InfoLeakVulnPage';
import DirectoryTraversalVulnPage from './pages/vulnerabilities/DirectoryTraversalVulnPage';
import CSRFVulnPage from './pages/vulnerabilities/CSRFVulnPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import UserListPage from './pages/UserListPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;
const { Title } = Typography;

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">个人信息</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!user ? (
        // 未登录状态的公共路由
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        // 已登录状态的布局
    <>
      <Header style={{ 
        padding: '0 24px', 
        background: '#fff', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        zIndex: 1,
      }}>
        <Title level={3} style={{ margin: 0 }}>DScan - Web应用漏洞扫描系统</Title>
        <Dropdown overlay={userMenu} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span>{user.username}</span>
          </Space>
        </Dropdown>
      </Header>
      <Layout>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div className="logo">
            <Title level={4} style={{ color: 'white', margin: '16px 0', textAlign: 'center' }}>
              DScan
            </Title>
          </div>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1" icon={<DashboardOutlined />}>
              <Link to="/">仪表盘</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<ScanOutlined />}>
              <Link to="/scan">开始扫描</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<HistoryOutlined />}>
              <Link to="/history">扫描历史</Link>
            </Menu.Item>
            
            <SubMenu key="vulns" icon={<BugOutlined />} title="漏洞分析">
              <Menu.Item key="vuln-xss" icon={<SecurityScanOutlined />}>
                <Link to="/vulnerability/xss">XSS漏洞</Link>
              </Menu.Item>
              <Menu.Item key="vuln-sql" icon={<WarningOutlined />}>
                <Link to="/vulnerability/sql">SQL注入</Link>
              </Menu.Item>
              <Menu.Item key="vuln-info" icon={<FileSearchOutlined />}>
                <Link to="/vulnerability/info-leak">信息泄露</Link>
              </Menu.Item>
              <Menu.Item key="vuln-traversal" icon={<FolderOutlined />}>
                <Link to="/vulnerability/directory-traversal">目录遍历</Link>
              </Menu.Item>
              <Menu.Item key="vuln-csrf" icon={<SafetyOutlined />}>
                <Link to="/vulnerability/csrf">CSRF漏洞</Link>
              </Menu.Item>
            </SubMenu>
            {user.is_superuser && (
              <Menu.Item key="users" icon={<TeamOutlined />}>
                <Link to="/users">用户管理</Link>
              </Menu.Item>
            )}
          </Menu>
        </Sider>
          <Layout>
            <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/" element={<DashboardPage />} />
                <Route path="/scan" element={<ScanPage />} />
                <Route path="/history" element={<ScanHistoryPage />} />
                <Route path="/scan-detail/:id" element={<ScanDetailPage />} />
                <Route path="/vulnerability/xss" element={<XSSVulnPage />} />
                <Route path="/vulnerability/sql" element={<SQLVulnPage />} />
                <Route path="/vulnerability/info-leak" element={<InfoLeakVulnPage />} />
                <Route path="/vulnerability/directory-traversal" element={<DirectoryTraversalVulnPage />} />
                <Route path="/vulnerability/csrf" element={<CSRFVulnPage />} />
                {user.is_superuser && (
                  <Route path="/users" element={<UserListPage />} />
                )}
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </>
    )}
  </Layout>

  );
};

export default App; 