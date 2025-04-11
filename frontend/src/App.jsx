import React from 'react';
import { Layout } from 'antd';
import { Routes, Route } from 'react-router-dom';
import ScanPage from './pages/ScanPage';
import './App.css';

const { Header } = Layout;

const App = () => {
  return (
    <Layout className="app-container">
      <Header className="header">
        <h1 style={{ color: 'white' }}>DScan - Web应用漏洞扫描系统</h1>
      </Header>
      <Routes>
        <Route path="/" element={<ScanPage />} />
      </Routes>
    </Layout>
  );
};

export default App; 