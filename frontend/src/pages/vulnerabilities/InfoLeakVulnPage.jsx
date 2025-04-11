import React from 'react';
import VulnerabilityTypePage from '../../components/VulnerabilityTypePage';

const InfoLeakVulnPage = () => {
  return (
    <VulnerabilityTypePage
      vulnType="info_leak"
      title="信息泄露漏洞分析"
      description="信息泄露漏洞指网站或应用程序可能暴露敏感信息的安全问题，包括但不限于源代码泄露、配置文件泄露、敏感数据泄露等。这类漏洞可能导致系统安全性受到严重威胁。"
    />
  );
};

export default InfoLeakVulnPage; 