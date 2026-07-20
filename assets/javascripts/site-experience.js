(() => {
  const locale = () => {
    const lang = (document.documentElement.lang || '').toLowerCase();
    return lang.startsWith('zh') || !window.location.pathname.startsWith('/en/') ? 'zh' : 'en';
  };

  const localeRoot = () => (locale() === 'en' ? '/en/' : '/');

  const openSearch = () => {
    const toggle = document.querySelector('#__search');
    if (toggle instanceof HTMLInputElement) toggle.checked = true;
    window.setTimeout(() => {
      const input = document.querySelector('.md-search__input');
      if (input instanceof HTMLInputElement) input.focus();
    }, 40);
  };

  const initializeHeader = () => {
    const inner = document.querySelector('.md-header__inner');
    const title = inner?.querySelector('.md-header__title');
    if (!inner || !title || inner.querySelector('.l2do-global-nav')) return;

    const root = localeRoot();
    const labels = locale() === 'zh'
      ? { tasks: '任务', domains: '领域', runbooks: 'Runbook' }
      : { tasks: 'Tasks', domains: 'Domains', runbooks: 'Runbooks' };

    const nav = document.createElement('nav');
    nav.className = 'l2do-global-nav';
    nav.setAttribute('aria-label', locale() === 'zh' ? '全局导航' : 'Global navigation');
    nav.innerHTML = `
      <a href="${root}tasks/">${labels.tasks}</a>
      <a href="${root}topics/">${labels.domains}</a>
      <a href="${root}tasks/#recover">${labels.runbooks}</a>
    `;
    title.insertAdjacentElement('afterend', nav);

    const source = inner.querySelector('.md-source');
    if (source) {
      source.setAttribute('title', 'lzyred/lzyred.github.io');
      source.setAttribute('aria-label', 'GitHub: lzyred/lzyred.github.io');
    }
  };

  const initializeSearch = () => {
    document.querySelectorAll('[data-l2do-search-trigger]').forEach((trigger) => {
      if (trigger.dataset.l2doReady === 'true') return;
      trigger.dataset.l2doReady = 'true';
      trigger.addEventListener('click', openSearch);
    });
  };

  const initializeKeyboard = () => {
    if (document.documentElement.dataset.l2doKeyboardReady === 'true') return;
    document.documentElement.dataset.l2doKeyboardReady = 'true';
    document.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
      }
      if (event.key === 'Escape') {
        const toggle = document.querySelector('#__search');
        if (toggle instanceof HTMLInputElement) toggle.checked = false;
      }
    });
  };

  const initializeTaskConsole = () => {
    const consoleRoot = document.querySelector('[data-task-console]');
    if (!consoleRoot || consoleRoot.dataset.ready === 'true') return;
    consoleRoot.dataset.ready = 'true';

    const taskButtons = [...consoleRoot.querySelectorAll('[data-task-select]')];
    const sections = [...consoleRoot.querySelectorAll('[data-task-panel]')];
    const typeButtons = [...consoleRoot.querySelectorAll('[data-type-filter]')];
    const domainButtons = [...consoleRoot.querySelectorAll('[data-domain-filter]')];
    const status = consoleRoot.querySelector('[data-task-status]');
    const empty = consoleRoot.querySelector('[data-task-empty]');
    const validTasks = new Set(taskButtons.map((button) => button.dataset.taskSelect));

    let activeTask = validTasks.has(window.location.hash.slice(1)) ? window.location.hash.slice(1) : taskButtons[0]?.dataset.taskSelect;
    let activeType = 'all';
    let activeDomain = 'all';

    const setPressed = (buttons, attribute, value) => {
      buttons.forEach((button) => {
        const active = button.dataset[attribute] === value;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', String(active));
        button.setAttribute('aria-pressed', String(active));
        button.tabIndex = active ? 0 : -1;
      });
    };

    const render = () => {
      setPressed(taskButtons, 'taskSelect', activeTask);
      setPressed(typeButtons, 'typeFilter', activeType);
      setPressed(domainButtons, 'domainFilter', activeDomain);

      sections.forEach((section) => {
        const active = section.dataset.taskPanel === activeTask;
        section.hidden = !active;
        section.setAttribute('aria-hidden', String(!active));
      });

      const current = sections.find((section) => section.dataset.taskPanel === activeTask);
      const items = [...(current?.querySelectorAll('[data-asset]') || [])];
      let visible = 0;
      items.forEach((item) => {
        const typeMatch = activeType === 'all' || item.dataset.type === activeType;
        const domainMatch = activeDomain === 'all' || item.dataset.domain === activeDomain;
        item.hidden = !(typeMatch && domainMatch);
        if (!item.hidden) visible += 1;
      });

      if (empty) empty.hidden = visible > 0;
      if (status) {
        status.textContent = locale() === 'zh'
          ? `当前显示 ${visible} 项生产资产`
          : `${visible} production assets shown`;
      }
    };

    taskButtons.forEach((button) => button.addEventListener('click', () => {
      activeTask = button.dataset.taskSelect;
      const url = new URL(window.location.href);
      url.hash = activeTask;
      window.history.replaceState({}, '', url);
      render();
    }));
    typeButtons.forEach((button) => button.addEventListener('click', () => {
      activeType = button.dataset.typeFilter;
      render();
    }));
    domainButtons.forEach((button) => button.addEventListener('click', () => {
      activeDomain = button.dataset.domainFilter;
      render();
    }));

    const keyboardSwitch = (buttons, event, callback) => {
      const index = buttons.indexOf(event.currentTarget);
      if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      buttons[next].focus();
      callback(buttons[next]);
    };

    taskButtons.forEach((button) => button.addEventListener('keydown', (event) => keyboardSwitch(taskButtons, event, (next) => next.click())));
    typeButtons.forEach((button) => button.addEventListener('keydown', (event) => keyboardSwitch(typeButtons, event, (next) => next.click())));
    domainButtons.forEach((button) => button.addEventListener('keydown', (event) => keyboardSwitch(domainButtons, event, (next) => next.click())));
    render();
  };

  const initializeArticleHeader = () => {
    const header = document.querySelector('.l2do-article-header');
    if (!header || header.dataset.ready === 'true') return;
    header.dataset.ready = 'true';
    document.body.classList.add('l2do-article-page');

    const content = header.parentElement;
    const duplicateTitle = content ? [...content.children].find((node) => node.tagName === 'H1' && node !== header.querySelector('h1')) : null;
    if (duplicateTitle) {
      duplicateTitle.classList.add('l2do-source-title');
      duplicateTitle.setAttribute('aria-hidden', 'true');
    }

    const tags = content?.querySelector('.md-tags');
    const taxonomy = header.querySelector('[data-article-taxonomy]');
    if (tags && taxonomy) taxonomy.append(tags);
  };

  const initializeAnchors = () => {
    document.querySelectorAll('.headerlink').forEach((link) => {
      link.setAttribute('aria-label', locale() === 'zh' ? '复制本节链接' : 'Copy section link');
    });
  };

  const initializePrimaryNavigation = () => {
    const nav = document.querySelector('.md-sidebar--primary nav.md-nav--primary');
    if (!nav || nav.dataset.l2doReady === 'true') return;
    nav.dataset.l2doReady = 'true';

    const storageKey = `l2do-nav:${window.location.pathname}`;
    let saved = {};
    try { saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}'); } catch { saved = {}; }

    nav.querySelectorAll('input.md-nav__toggle').forEach((toggle) => {
      const item = toggle.closest('.md-nav__item');
      const active = item?.classList.contains('md-nav__item--active');
      toggle.checked = active || saved[toggle.id] === true;
      toggle.addEventListener('change', () => {
        saved[toggle.id] = toggle.checked;
        window.localStorage.setItem(storageKey, JSON.stringify(saved));
      });
    });
  };

  const initializeReadingProgress = () => {
    if (!document.body.classList.contains('l2do-article-page')) return;
    let bar = document.querySelector('.l2do-reading-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'l2do-reading-progress';
      bar.setAttribute('aria-hidden', 'true');
      document.body.append(bar);
    }

    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      bar.style.setProperty('--l2do-reading-progress', `${progress * 100}%`);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  };

  const initializeMobileTools = () => {
    if (document.querySelector('.l2do-mobile-tools')) return;
    const pagination = document.querySelector('.md-footer__inner');
    if (!pagination) return;
    const tools = document.createElement('nav');
    tools.className = 'l2do-mobile-tools';
    tools.setAttribute('aria-label', locale() === 'zh' ? '移动端文档工具' : 'Mobile document tools');
    const prev = document.querySelector('.md-footer__link--prev')?.getAttribute('href') || '#';
    const next = document.querySelector('.md-footer__link--next')?.getAttribute('href') || '#';
    tools.innerHTML = `
      <button type="button" data-l2do-mobile-search>${locale() === 'zh' ? '搜索' : 'Search'}</button>
      <button type="button" data-l2do-mobile-toc>${locale() === 'zh' ? '目录' : 'Contents'}</button>
      <a href="${prev}">${locale() === 'zh' ? '上一页' : 'Previous'}</a>
      <a href="${next}">${locale() === 'zh' ? '下一页' : 'Next'}</a>
    `;
    document.body.append(tools);
    tools.querySelector('[data-l2do-mobile-search]')?.addEventListener('click', openSearch);
    tools.querySelector('[data-l2do-mobile-toc]')?.addEventListener('click', () => {
      const toggle = document.querySelector('#__toc');
      if (toggle instanceof HTMLInputElement) toggle.checked = true;
    });
  };

  const initialize = () => {
    initializeHeader();
    initializeSearch();
    initializeKeyboard();
    initializeTaskConsole();
    initializeArticleHeader();
    initializeAnchors();
    initializePrimaryNavigation();
    initializeReadingProgress();
    initializeMobileTools();
  };

  if (typeof document$ !== 'undefined') document$.subscribe(initialize);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
