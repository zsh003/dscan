import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ScanOutlined,
  HistoryOutlined,
} from '@ant-design/icons';

import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';
import ScanHistoryPage from './pages/ScanHistoryPage';
import ScanDetailPage from './pages/ScanDetailPage';
import './App.css';

const { Header, Sider, Content } = Layout;

const App = () => {
  return (
    
      <Layout style={{ minHeight: '100vh' }}>
        <Sider>
          <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)' }} />
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
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: '#fff' }} />
          <Content style={{ margin: '0 16px' }}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/history" element={<ScanHistoryPage />} />
              <Route path="/scan-detail/:id" element={<ScanDetailPage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    
  );
};

export default App; 