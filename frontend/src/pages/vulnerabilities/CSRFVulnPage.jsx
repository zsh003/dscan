import React from 'react';
import VulnerabilityTypePage from '../../components/VulnerabilityTypePage';

const CSRFVulnPage = () => {
  return (
    <VulnerabilityTypePage
      vulnType="CSRF"
      title="CSRF漏洞分析"
      description="跨站请求伪造（CSRF）是一种强制用户在已登录的Web应用程序上执行非本意操作的攻击。攻击者通过诱导用户访问恶意网站，利用用户的登录状态执行未经授权的操作。常见于密码修改、资金转账等敏感操作。"
    />
  );
};

export default CSRFVulnPage; 