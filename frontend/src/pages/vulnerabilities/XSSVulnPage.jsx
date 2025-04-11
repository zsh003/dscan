import React from 'react';
import VulnerabilityTypePage from '../../components/VulnerabilityTypePage';

const XSSVulnPage = () => {
  return (
    <VulnerabilityTypePage
      vulnType="XSS"
      title="XSS漏洞分析"
      description="跨站脚本攻击（XSS）是一种常见的Web应用程序漏洞，攻击者可以通过在网页中注入恶意脚本来获取用户信息或执行未经授权的操作。常见类型包括反射型XSS、存储型XSS和DOM型XSS。"
    />
  );
};

export default XSSVulnPage; 