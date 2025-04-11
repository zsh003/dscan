import React from 'react';
import VulnerabilityTypePage from '../../components/VulnerabilityTypePage';

const InfoLeakVulnPage = () => {
  return (
    <VulnerabilityTypePage
      vulnType="信息泄露"
      title="信息泄露漏洞分析"
      description="信息泄露漏洞指网站或应用程序可能暴露敏感信息的安全问题，包括但不限于源代码泄露、配置文件泄露、敏感数据泄露等。常见包括.git目录泄露、配置文件可访问、数据库备份文件暴露等。"
    />
  );
};

export default InfoLeakVulnPage; 