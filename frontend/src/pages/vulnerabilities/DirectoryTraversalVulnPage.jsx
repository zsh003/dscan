import React from 'react';
import VulnerabilityTypePage from '../../components/VulnerabilityTypePage';

const DirectoryTraversalVulnPage = () => {
  return (
    <VulnerabilityTypePage
      vulnType="目录遍历"
      title="目录遍历漏洞分析"
      description="目录遍历漏洞允许攻击者访问Web根目录之外的任意文件，通常通过操作文件路径参数实现。攻击者可能通过这个漏洞读取系统敏感文件，如配置文件、密码文件等。常见于文件下载、图片访问等功能。"
    />
  );
};

export default DirectoryTraversalVulnPage; 