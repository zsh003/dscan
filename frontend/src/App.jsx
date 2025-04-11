import React from 'react';
import { Layout, Menu } from 'antd';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ScanPage from './pages/ScanPage';
import ScanHistoryPage from './pages/ScanHistoryPage';
import './App.css';

const { Header, Content } = Layout;

const App = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      label: <Link to="/">新建扫描</Link>,
    },
    {
      key: '/history',
      label: <Link to="/history">扫描历史</Link>,
    },
  ];

  return (
    <Layout className="app-container">
      <Header className="header">
        <div className="logo">
          <h1 style={{ color: 'white', margin: 0 }}>DScan - Web应用漏洞扫描系统</h1>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 24 }}>
        <Routes>
          <Route path="/" element={<ScanPage />} />
          <Route path="/history" element={<ScanHistoryPage />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default App; 