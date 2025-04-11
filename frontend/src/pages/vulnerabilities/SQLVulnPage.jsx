import React from 'react';
import VulnerabilityTypePage from '../../components/VulnerabilityTypePage';

const SQLVulnPage = () => {
  return (
    <VulnerabilityTypePage
      vulnType="SQL注入"
      title="SQL注入漏洞分析"
      description="SQL注入是一种常见的Web应用程序漏洞，攻击者可以通过在应用程序的输入中注入恶意的SQL代码来操纵数据库，可能导致数据泄露、篡改或破坏。常见于登录页面、搜索功能和数据查询接口。"
    />
  );
};

export default SQLVulnPage; 