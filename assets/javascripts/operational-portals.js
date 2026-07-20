(() => {
  const language = () => ((document.documentElement.lang || '').toLowerCase().startsWith('en') ? 'en' : 'zh');
  const localeRoot = () => (language() === 'en' ? '/en/' : '/');

  const initializeHeaderEntries = (attempt = 0) => {
    const nav = document.querySelector('.l2do-global-nav');
    if (!nav) {
      if (attempt < 8) window.setTimeout(() => initializeHeaderEntries(attempt + 1), 40);
      return;
    }

    const root = localeRoot();
    const links = [...nav.querySelectorAll('a')];
    const runbook = links.find((link) => /runbooks?/i.test((link.textContent || '').trim()));
    if (runbook) runbook.href = `${root}runbooks/`;

    if (!nav.querySelector('[data-global-ai]')) {
      const ai = document.createElement('a');
      ai.href = `${root}ai/`;
      ai.dataset.globalAi = 'true';
      ai.textContent = language() === 'zh' ? 'AI' : 'AI';
      nav.append(ai);
    }

    const pathname = window.location.pathname;
    nav.querySelectorAll('a').forEach((link) => {
      const active = new URL(link.href).pathname !== root && pathname.startsWith(new URL(link.href).pathname);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const initializeRunbooks = () => {
    const root = document.querySelector('[data-runbook-console]');
    if (!root) return;
    document.body.classList.add('l2do-runbooks-page', 'l2do-portal-page');
    if (root.dataset.ready === 'true') return;
    root.dataset.ready = 'true';

    const search = root.querySelector('[data-runbook-search]');
    const filters = [...root.querySelectorAll('[data-runbook-filter]')];
    const items = [...root.querySelectorAll('[data-runbook-item]')];
    const status = root.querySelector('[data-runbook-status]');
    const empty = root.querySelector('[data-runbook-empty]');
    let domain = 'all';

    const render = () => {
      const query = search instanceof HTMLInputElement ? search.value.trim().toLowerCase() : '';
      let visible = 0;
      items.forEach((item) => {
        const domainMatch = domain === 'all' || item.dataset.domain === domain;
        const haystack = `${item.dataset.keywords || ''} ${item.textContent || ''}`.toLowerCase();
        const queryMatch = !query || haystack.includes(query);
        item.hidden = !(domainMatch && queryMatch);
        if (!item.hidden) visible += 1;
      });

      filters.forEach((button) => {
        const active = button.dataset.runbookFilter === domain;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if (empty) empty.hidden = visible > 0;
      if (status) {
        status.textContent = language() === 'zh'
          ? `当前显示 ${visible} 个可执行 Runbook`
          : `${visible} executable runbooks shown`;
      }
    };

    search?.addEventListener('input', render);
    filters.forEach((button) => button.addEventListener('click', () => {
      domain = button.dataset.runbookFilter || 'all';
      render();
    }));
    render();
  };

  const initializeAi = () => {
    if (!document.querySelector('[data-ai-portal]')) return;
    document.body.classList.add('l2do-ai-page', 'l2do-portal-page');
  };

  const initialize = () => {
    initializeHeaderEntries();
    initializeRunbooks();
    initializeAi();
  };

  if (typeof document$ !== 'undefined') document$.subscribe(initialize);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
