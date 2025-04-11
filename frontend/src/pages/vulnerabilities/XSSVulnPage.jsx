import React from 'react';
import VulnerabilityTypePage from '../../components/VulnerabilityTypePage';

const XSSVulnPage = () => {
  return (
    <VulnerabilityTypePage
      vulnType="xss"
      title="XSS漏洞分析"
      description="跨站脚本攻击（XSS）是一种常见的Web应用程序漏洞，攻击者可以通过在网页中注入恶意脚本来获取用户信息或执行未经授权的操作。"
    />
  );
};

export default XSSVulnPage; 