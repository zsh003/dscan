import React from 'react';
import VulnerabilityTypePage from '../../components/VulnerabilityTypePage';

const SQLVulnPage = () => {
  return (
    <VulnerabilityTypePage
      vulnType="sql"
      title="SQL注入漏洞分析"
      description="SQL注入是一种常见的Web应用程序漏洞，攻击者可以通过在应用程序的输入中注入恶意的SQL代码来操纵数据库，可能导致数据泄露、篡改或破坏。"
    />
  );
};

export default SQLVulnPage; 