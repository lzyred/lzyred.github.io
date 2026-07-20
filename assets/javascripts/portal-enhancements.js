(() => {
  const domainCatalog = {
    kubernetes: { code: 'K8S', assets: 8, span: 8, featured: true },
    containers: { code: 'CTR', assets: 7, span: 4 },
    linux: { code: 'LNX', assets: 4, span: 4 },
    cloud: { code: 'CLD', assets: 2, span: 4 },
    networking: { code: 'NET', assets: 6, span: 4 },
    platform: { code: 'PLT', assets: 3, span: 12 },
    redis: { code: 'RDS', assets: 5, span: 8, featured: true },
    mysql: { code: 'SQL', assets: 1, span: 4 },
    mongodb: { code: 'MDB', assets: 1, span: 4 },
    etcd: { code: 'ETCD', assets: 1, span: 4 },
    middleware: { code: 'MW', assets: 4, span: 4 },
    delivery: { code: 'CD', assets: 4, span: 6, featured: true },
    automation: { code: 'AUTO', assets: 1, span: 3 },
    'infrastructure-as-code': { code: 'IaC', assets: 1, span: 3 },
    observability: { code: 'OBS', assets: 7, span: 6, featured: true },
    opentelemetry: { code: 'OTel', assets: 8, span: 6 },
    operations: { code: 'OPS', assets: 1, span: 12 },
    'ai-full-stack': { code: 'AI', assets: 1, span: 6, featured: true },
    'engineering-practice': { code: 'COL', assets: 3, span: 3 },
    documentation: { code: 'DOC', assets: 3, span: 3 },
  };

  const language = () => (document.documentElement.lang || '').toLowerCase().startsWith('en') ? 'en' : 'zh';

  const maturity = (assets) => {
    if (assets >= 4) return language() === 'zh' ? '持续维护' : 'Maintained';
    if (assets >= 2) return language() === 'zh' ? '候选成熟' : 'Candidate';
    return language() === 'zh' ? '建设中' : 'Building';
  };

  const initializeTaskPortal = () => {
    if (!document.querySelector('[data-task-console]')) return;
    document.body.classList.add('l2do-task-page', 'l2do-portal-page');
  };

  const initializeDomainPortal = () => {
    const isDomainPortal = /^\/(?:en\/)?topics\/$/.test(window.location.pathname);
    if (!isDomainPortal) return;
    const grids = document.querySelectorAll('.l2do-card-grid');
    if (!grids.length) return;

    document.body.classList.add('l2do-topics-page', 'l2do-portal-page');
    grids.forEach((grid) => grid.classList.add('l2do-domain-grid'));

    document.querySelectorAll('.l2do-domain-grid > .l2do-article-card').forEach((card) => {
      if (card.dataset.enhanced === 'true') return;
      const segment = new URL(card.href).pathname.split('/').filter(Boolean).pop();
      const data = domainCatalog[segment];
      if (!data) return;
      card.dataset.enhanced = 'true';
      card.dataset.span = String(data.span);
      card.classList.add('l2do-domain-card');
      if (data.featured) card.classList.add('l2do-domain-card--featured');

      const icon = document.createElement('span');
      icon.className = 'l2do-domain-card__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = data.code;
      card.prepend(icon);

      if (data.featured) {
        const recommended = document.createElement('span');
        recommended.className = 'l2do-domain-card__recommended';
        recommended.textContent = language() === 'zh' ? '推荐入口' : 'Recommended';
        card.append(recommended);
      }

      const footer = document.createElement('span');
      footer.className = 'l2do-domain-card__footer';
      const assetLabel = language() === 'zh' ? `${data.assets} 项资产` : `${data.assets} assets`;
      footer.innerHTML = `<span>${assetLabel}</span><span>${maturity(data.assets)}</span>`;
      card.append(footer);
    });
  };

  const initialize = () => {
    initializeTaskPortal();
    initializeDomainPortal();
  };

  if (typeof document$ !== 'undefined') document$.subscribe(initialize);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
