import React from 'react';
import VulnerabilityTypePage from '../../components/VulnerabilityTypePage';

const WeakPasswordVulnPage = () => {
  return (
    <VulnerabilityTypePage
      vulnType="weak_password"
      title="弱口令漏洞分析"
      description="弱口令漏洞是指系统中存在容易被猜测或破解的密码，这可能导致未经授权的访问。常见的弱口令包括默认密码、简单密码、常用词组等。"
    />
  );
};

export default WeakPasswordVulnPage; 